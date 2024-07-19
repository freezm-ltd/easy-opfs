import { EventTarget2 } from "@freezm-ltd/event-target-2"
import { Messenger, MessengerFactory } from "@freezm-ltd/post-together";
import { normalizePath, path2array, sleep } from "./utils.js";
// @ts-ignore
import Worker from "./opfs.worker?worker&inline"

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

export type OpfsWriteRequest = {
    source: ReadableStream<Uint8Array> | ArrayBuffer
    at?: number
    keepExistingData?: boolean
}
export type OpfsWriteResponse = OpfsResponse

export type OpfsReadRequest = {
    sink?: WritableStream<Uint8Array>
    at?: number
    length?: number
    noStream?: boolean
}
export type OpfsReadResponse = OpfsResponse<{ data?: ReadableStream<Uint8Array> | ArrayBuffer }>

export type OpfsHeadResponse = OpfsResponse<{ size: number }>

export type OpfsDeleteRequest = { path: string, onlyHandle: boolean }
export type OpfsDeleteResponse = OpfsResponse

// low-level read/write opfs with FileSystemSyncAccessHandle
export class OpfsHandle extends EventTarget2 {
    readonly chunk: number = 0
    private written: number = 0;
    private handle: FileSystemSyncAccessHandle | undefined;
    private messenger: Messenger | undefined

    path: string = ""
    state: OpfsState = "off"

    constructor(
        readonly handleMap?: Map<string, OpfsHandle>
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
            broadcastMessenger.response(this.path, (_) => {
                return { data: this.head() }
            })

            // specific path
            this.messenger = MessengerFactory.new(getOpfsFileChannel(this.path))
            this.messenger.response("head", (_) => {
                return { data: this.head() }
            })
            this.messenger.response("read", (request: OpfsReadRequest) => {
                const result = this.read(request)
                let transfer
                if (result.ok && result.data) transfer = [result.data];
                return { data: result, transfer }
            })
            this.messenger.response("write", (request: OpfsWriteRequest) => {
                return { data: this.write(request) }
            })
            this.messenger.response("delete", async (request: OpfsDeleteRequest) => {
                return { data: await this.delete(request) }
            })

            this.handleMap?.set(this.path, this)
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e };
        }
    }

    write(request: OpfsWriteRequest): OpfsWriteResponse {
        const _this = this
        const handle = this.handle!
        let at = request.at || request.keepExistingData ? this.written : 0
        const source = request.source

        // buffer
        if (source instanceof ArrayBuffer) {
            handle.write(source, { at });
            handle.flush()
            return { ok: true }
        }

        // stream
        const stream = new WritableStream<Uint8Array>({
            write(chunk) {
                handle.write(chunk, { at });
                //handle.flush()
                at += chunk.length;
                if (_this.written < at) _this.written = at;
            },
            close() {
                handle.flush()
            },
            abort() {
                handle.flush()
            }
        });
        source.pipeTo(stream);
        return { ok: true }
    }

    read(request: OpfsReadRequest): OpfsReadResponse {
        const start = request.at || 0
        const length = request.length || this.written - start
        const end = length + start;
        const handle = this.handle!;
        const _this = this;
        let at = start;

        // buffer
        if (!request.sink && request.noStream) {
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

        if (!request.sink) {
            return { ok: true, data: stream }
        }

        stream.pipeTo(request.sink)
        return { ok: true }
    }

    head(): OpfsHeadResponse {
        return { ok: true, size: this.written }
    }

    async delete(request: OpfsDeleteRequest): Promise<OpfsDeleteResponse> {
        try {
            this.handle!.close()
            this.messenger!.deresponse()
            this.handleMap?.delete(this.path)
            if (!request.onlyHandle) await deleteOpfsFile(this.path);
            return { ok: true }
        } catch (error) {
            return { ok: false, error }
        }
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

    static async checkHandle(path: string) {
        return (await this.instance.broadcastMessenger.request(path, { data: undefined })).data.ok
    }

    static async addHandle(request: OpfsInitRequest): Promise<OpfsInitResponse> {
        // create OpfsHandle
        const workerResponse = (await this.instance.workerMessenger.request("add", { data: request })).data
        if (workerResponse.ok) return workerResponse;

        // fail to create OpfsHandle -> maybe file is locked, other worker has OpfsHandle
        // send head request -> if no response, wait forever | TODO: set timeout?
        const broadcastResponse = (await this.instance.broadcastMessenger.request(request.path, { data: undefined })).data
        if (broadcastResponse.ok) return broadcastResponse;

        throw new Error("OpfsWorkerAddHandleError: Cannot create/request OpfsHandle.")
    }

    static async deleteHandle(request: OpfsDeleteRequest): Promise<OpfsDeleteResponse> {
        const response = (await this.instance.workerMessenger.request("delete", { data: request })).data
        if (response.ok) return response;

        throw new Error("OpfsWorkerDeleteHandleError: Cannot delete OpfsHandle.")
    }
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

    _read(at: number, length?: number) {
        const { readable, writable } = new TransformStream({
            transform(chunk: Uint8Array, controller) {
                controller.enqueue(chunk)
                at += chunk.length
                if (length) length -= chunk.length;
            }
        })

        const task = async () => {
            while (true) {
                try {
                    const result = await this.messenger.request("read", { data: { at, length } })
                    if (!result.data.ok) throw new Error("OpfsFileReadError: OpfsWorker returned error: ", result.data.error);
                    await result.data.data.pipeTo(writable, { preventClose: true, preventAbort: true, preventCancel: true })
                    await writable.close()
                    break;
                } catch (e) {
                    await this._init() // maybe connection with worker(from other tab) is broken, create new worker or revalidate connection
                }
            }
        }

        task()

        return readable
    }

    async read(at: number = 0, length?: number) {
        await this.init()
        return this._read(at, length)
    }

    async _write(source: ArrayBuffer, at: number) {
        while (true) {
            try {
                const result = await this.messenger.request("write", { data: { source, at } })
                if (!result.data.ok) throw new Error("OpfsFileWriteError: OpfsWorker returned error: ", result.data.error);
                // @ts-ignore
                source.transfer(0) // detach ArrayBuffer for GC
                return
            } catch (e) {
                await this._init() // maybe connection with worker(from other tab) is broken, create new worker or revalidate connection
            }
        }
    }

    async write(source: ReadableStream<Uint8Array> | ArrayBuffer, at?: number, keepExistingData?: boolean) {
        await this.init()

        if (!at) {
            if (keepExistingData) { // get written size
                const head = await this.messenger.request("head", { data: undefined })
                at = head.data.size as number
            } else {
                at = 0
            }
        }

        // buffer
        if (source instanceof ArrayBuffer) {
            return await this._write(source, at)
        }

        // stream
        const _this = this
        let index = at
        const sink = new WritableStream({
            async write(chunk: Uint8Array) {
                await _this._write(chunk.buffer, index)
                index += chunk.length
            }
        })
        await source.pipeTo(sink)
    }

    async delete() {
        return await this.messenger.request("delete", { data: { path: this.path } })
    }

    // utils

    async writeText(text: string) {
        const encoded = (new TextEncoder()).encode(text)
        await this.write(encoded.buffer)
    }

    async readText() {
        const stream = await this.read();
        return await (new Response(stream)).text()
    }
}