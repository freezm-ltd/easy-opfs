import { EventTarget2 } from "@freezm-ltd/event-target-2"
import { Messenger, MessengerFactory } from "@freezm-ltd/post-together";
import { normalizePath, path2array, sleep } from "./utils.js";
// @ts-ignore
import Worker from "./opfs.worker?worker&inline"
import { ControlledReadableStream, ControlledWritableStream, Duplex, DuplexEndpoint, Flowmeter, lengthCallback, ObjectifiedControlledReadableEndpoint, retryableFetchStream, retryableStream, SwitchableDuplexEndpoint, SwitchableReadableStream } from "@freezm-ltd/stream-utils";

const IDENTIFIER = "easy-opfs"
function getKeyWithIdentifier(...key: string[]) {
    return `${IDENTIFIER}:${key.join(":")}`
}
const publicHeadBroadcastChannel = new BroadcastChannel(getKeyWithIdentifier("public-head"))
function getOpfsFileChannel(path: string) {
    return new BroadcastChannel(getKeyWithIdentifier(path))
}

async function getParentDirectoryHandle(path: string, create = false) {
    const _path = path2array(path)
    let cursor = await navigator.storage.getDirectory();
    for (let i = 0; i < _path.length - 1; i++) {
        cursor = await cursor.getDirectoryHandle(_path[i], { create });
    }
    return cursor
}

export async function getOpfsHandle(path: string, create = false) {
    const parent = await getParentDirectoryHandle(path, create)
    return await parent.getFileHandle(path2array(path).pop()!, { create });
}

export async function deleteOpfsFile(path: string) {
    const parent = await getParentDirectoryHandle(path)
    return await parent.removeEntry(path2array(path).pop()!)
}

// OpfsHandle initialize state
type OpfsState = "off" | "initializing" | "on";

// Opfs Request/Response types
type OpfsResponse<S = {}, E = {}> = (OpfsSuccessResponse & S) | (OpfsErrorResponse & E)
type OpfsSuccessResponse = { ok: true }
type OpfsErrorResponse = { ok: false, error: unknown }

export type OpfsInitRequest = {
    path: string;
};
export type OpfsInitResponse = OpfsResponse

export type OpfsDataBlockId = number
export type OpfsDataBlock = {
    chunk: Uint8Array
    id: OpfsDataBlockId // for writing integrity check
}
export type OpfsWriteRequest = {
    source?: ArrayBuffer
    at?: number
    keepExistingData?: boolean
}
export type OpfsWriteResponse = OpfsResponse<{ endpoint?: ObjectifiedControlledReadableEndpoint<Uint8Array> }>

export type OpfsReadRequest = {
    at: number
    length?: number
    noStream?: boolean
}
export type OpfsReadResponse = OpfsResponse<{ data: ReadableStream<Uint8Array> | ArrayBuffer }>

export type OpfsHeadResponse = OpfsResponse<{ size: number }>

export type OpfsDeleteResponse = OpfsResponse

export type OpfsCloseResponse = OpfsResponse

// low-level read/write opfs with FileSystemSyncAccessHandle
export class OpfsHandle extends EventTarget2 {
    readonly chunk: number = 0
    private written: number = 0;
    private handle: FileSystemSyncAccessHandle | undefined;
    private messenger: Messenger | undefined

    path: string = ""
    state: OpfsState = "off"

    constructor(
        readonly externalHandleMap?: Map<string, OpfsHandle> // for self add/remove
    ) {
        super()
    }

    async init(request: OpfsInitRequest): Promise<OpfsInitResponse> {
        try {
            this.path = request.path
            this.state = "initializing";
            this.handle = await (await getOpfsHandle(this.path, true)).createSyncAccessHandle();
            this.written = this.handle.getSize()
            this.state = "on";

            // broadcast/public head response
            const broadcastMessenger = MessengerFactory.new(publicHeadBroadcastChannel)
            broadcastMessenger.response<null, OpfsHeadResponse>(this.path, () => {
                return this.head()
            })

            // specific path
            this.messenger = MessengerFactory.new(getOpfsFileChannel(this.path))
            this.messenger.response<null, OpfsHeadResponse>("head", (_) => {
                return this.head()
            })
            this.messenger.response<OpfsReadRequest, OpfsReadResponse>("read", (request) => {
                const result = this.read(request)
                let transfer
                if (result.ok && result.data) transfer = [result.data];
                return transfer ? { payload: result, transfer } : result
            })
            this.messenger.response<OpfsWriteRequest, OpfsWriteResponse>("write", (request) => {
                const result = this.write(request)
                let transfer
                if (result.ok && result.endpoint) transfer = [result.endpoint.readable, result.endpoint.writable]
                return transfer ? { payload: result, transfer } : result
            })
            this.messenger.response<null, OpfsCloseResponse>("delete", async (_) => {
                return await this.delete()
            })
            this.messenger.response<null, OpfsDeleteResponse>("close", async (_) => {
                return this.close()
            })

            this.externalHandleMap?.set(this.path, this)
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e };
        }
    }

    write(request: OpfsWriteRequest): OpfsWriteResponse {
        const _this = this
        const handle = this.handle!
        let at = request.at || request.keepExistingData ? this.written : 0

        // buffer
        if (request.source) {
            handle.write(request.source, { at });
            if (_this.written < at) _this.written = at;
            return { ok: true }
        }

        // stream with ControlledStream(for integrity)
        const consumer = async (data: Uint8Array) => {
            handle.write(data, { at });
            at += data.length;
            if (_this.written < at) _this.written = at;
        }

        const { endpoint1, endpoint2 } = new Duplex()
        const writable = new ControlledWritableStream(consumer)
        writable.endpoint.switch(endpoint1)
        const { endpoint } = DuplexEndpoint.transferify(endpoint2)

        return { ok: true, endpoint }
    }

    read(request: OpfsReadRequest): OpfsReadResponse {
        const start = request.at || 0
        const length = request.length || this.written - start
        const end = length + start;
        const handle = this.handle!;
        const _this = this;
        let at = start;

        // buffer
        if (request.noStream) {
            const data = new ArrayBuffer(length);
            handle.read(data, { at });
            return { ok: true, data }
        }

        // stream
        const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
                try {
                    while (at < end) {
                        if (at >= _this.written) {
                            await sleep(100);
                            continue;
                        }
                        // throttle 10MiB TODO: check for usefulness
                        const viewSize = Math.min(Math.min(_this.written, end) - at, 10 * 1024 * 1024);
                        const data = new Uint8Array(viewSize);
                        handle.read(data.buffer, { at });
                        controller.enqueue(data);
                        at += viewSize;
                    }
                } finally {
                    controller.close();
                }
            }
        });

        return { ok: true, data: stream }
    }

    head(): OpfsHeadResponse {
        return { ok: true, size: this.written }
    }

    close(): OpfsCloseResponse {
        if (this.handle) {
            try {
                this.handle.flush()
                this.handle.close()
                this.messenger?.deresponse()
                this.externalHandleMap?.delete(this.path)
                this.handle = undefined
                return { ok: true }
            } catch (error) {
                return { ok: false, error }
            }
        }
        return { ok: true }
    }

    async delete(): Promise<OpfsDeleteResponse> {
        const close = this.close()
        if (close.ok) {
            try {
                await deleteOpfsFile(this.path)
                return { ok: true }
            } catch (error) {
                return { ok: false, error }
            }
        }
        return close
    }
}

// Singleton wrapper of worker which has OpfsHandles
export class OpfsWorker {
    private static _instance: OpfsWorker
    private worker: Worker;
    private workerMessenger: Messenger
    private broadcastMessenger: Messenger
    private constructor() {
        this.worker = new Worker()
        this.workerMessenger = MessengerFactory.new(this.worker)
        this.broadcastMessenger = MessengerFactory.new(publicHeadBroadcastChannel)
    }

    static get instance() {
        if (!OpfsWorker._instance) OpfsWorker._instance = new OpfsWorker();
        return OpfsWorker._instance
    }

    static async checkHandle(path: string): Promise<boolean> {
        try {
            return (await this.instance.broadcastMessenger.request<null, OpfsResponse>(path, null, undefined, 100)).ok
        } catch {
            return false
        }
    }

    static async addHandle(request: OpfsInitRequest): Promise<OpfsInitResponse> {
        // check other worker has OpfsHandle
        if (await this.checkHandle(request.path)) return { ok: true };
        const response = await this.instance.workerMessenger.request<OpfsInitRequest, OpfsInitResponse>("init", request)
        if (response.ok) return response;
        throw new Error("OpfsWorkerAddHandleError: Cannot create/request OpfsHandle.")
    }

    /*static async deleteHandle(): Promise<OpfsDeleteResponse> {
        const response = await this.instance.workerMessenger.request<null, OpfsDeleteResponse>("delete", null)
        if (response.ok) return response;

        throw new Error("OpfsWorkerDeleteHandleError: Cannot delete OpfsHandle.")
    }*/
}

// 
export class OpfsFile extends EventTarget2 {
    readonly path: string
    private messenger: Messenger // OpfsFile -> OpfsHandle (BroadcastChannel)
    state: "off" | "initializing" | "on" = "off"
    constructor(path: string) {
        super()
        this.path = normalizePath(path)
        this.messenger = MessengerFactory.new(getOpfsFileChannel(this.path))
        this.init()
    }

    private async _init() { // add or head handle
        this.state = "initializing"
        await OpfsWorker.addHandle({ path: this.path })
        this.state = "on"
        this.dispatch("done")
    }

    private async init() {
        if (this.state === "on") return
        if (this.state === "initializing") return await this.waitFor("done");
        if (this.state === "off") return await this._init();
    }

    async head() {
        const head = await this.messenger.request<null, OpfsHeadResponse>("head", null)
        if (!head.ok) throw new Error("OpfsHeadError: OpfsWorker returned error", { cause: head.error });
        return head
    }

    read(at: number = 0, length?: number) {
        let isChecking = true
        const requestAsContext: OpfsReadRequest = { at, length }
        const generator = async (context: OpfsReadRequest) => {
            await this.init()
            const response = await this.messenger.request<OpfsReadRequest, OpfsReadResponse>("read", context)
            if (!response.ok) throw new Error("OpfsFileReadError: OpfsWorker returned error", { cause: response.error });
            const stream = (response.data as ReadableStream<Uint8Array>).pipeThrough(lengthCallback((delta) => {
                context.at += delta // update received bytes
                if (context.length) context.length -= delta;
            }))
            isChecking = false
            return stream as ReadableStream<Uint8Array>
        }
        const switchable = new SwitchableReadableStream(generator, requestAsContext)
        const flow = new Flowmeter<Uint8Array>((chunk) => chunk.length)
        const stream = switchable.stream.pipeThrough(flow)
        const check = async () => {
            if (isChecking) return;
            isChecking = true
            if (!await OpfsWorker.checkHandle(this.path)) {
                await this._init() // maybe connection with worker(from other tab) is broken, create new worker or revalidate connection
                await switchable.switch()
            }
            isChecking = false
        }
        flow.addTrigger(info => info.flow === 0, check, 1_000, 0)
        return stream
    }

    async _writeArrayBuffer(source: ArrayBuffer, at: number) {
        while (true) {
            try { // retry loop (no transfer)
                const response = await this.messenger.request<OpfsWriteRequest, OpfsWriteResponse>("write", { source, at })
                if (!response.ok) throw new Error("OpfsFileWriteError: OpfsWorker returned error", { cause: response.error });
                // @ts-ignore
                source.transfer(0) // detach ArrayBuffer for GC
                return response
            } catch (e) {
                await this._init() // maybe connection with worker(from other tab) is broken, create new worker or revalidate connection
            }
        }
    }

    async _writeStream(source: ReadableStream<Uint8Array>, at: number) {
        const requestAsContext = { at }
        const endpointGenerator = async (context: OpfsWriteRequest) => {
            let response
            while (true) {
                try {
                    response = await this.messenger.request<OpfsWriteRequest, OpfsWriteResponse>("write", context)
                    break
                } catch (e) {
                    await this._init() // maybe connection with worker(from other tab) is broken, create new worker or revalidate connection
                }
            }
            if (!response.ok) throw new Error("OpfsFileWriteError: OpfsWorker returned error", { cause: response.error });
            return DuplexEndpoint.instancify(response.endpoint!)
        }
        const endpoint = new SwitchableDuplexEndpoint(endpointGenerator, requestAsContext)
        const stream = new ControlledReadableStream(source, endpoint, undefined, (chunk) => { requestAsContext.at += chunk.length })
        return await stream.waitFor("close")
    }

    async write(source: ReadableStream<Uint8Array> | ArrayBuffer, at?: number, keepExistingData: boolean = true) {
        await this.init()
        if (!at) {
            if (keepExistingData) { // get written size
                at = (await this.head()).size
            } else {
                at = 0
            }
        }

        // buffer
        if (source instanceof ArrayBuffer) {
            const result = await this._writeArrayBuffer(source, at)
            //await this.close()
            return result
        }

        // stream
        const result = await this._writeStream(source, at)
        //await this.close()
        return result
    }

    async delete() {
        await this.init()
        const result = await this.messenger.request<null, OpfsDeleteResponse>("delete", null)
        if (result.ok) this.state = "off";
        return result
    }

    async close() {
        const result = await this.messenger.request<null, OpfsCloseResponse>("close", null)
        if (result.ok) this.state = "off";
        return result
    }

    // utils

    async writeText(text: string) {
        const encoded = (new TextEncoder()).encode(text)
        return await this.write(encoded.buffer)
    }

    async readText() {
        const stream = await this.read();
        const result = await (new Response(stream)).text()
        //await this.close()
        return result
    }

    async writeFetch(input: RequestInfo | URL, init?: RequestInit) {
        const stream = retryableFetchStream(input, init)
        return await this.write(stream)
    }
}