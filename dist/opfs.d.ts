import { EventTarget2 } from "@freezm-ltd/event-target-2";
import { ObjectifiedControlledReadableEndpoint } from "@freezm-ltd/stream-utils";
export declare function getOpfsHandle(path: string, create?: boolean): Promise<FileSystemFileHandle>;
export declare function deleteOpfsFile(path: string): Promise<void>;
type OpfsState = "off" | "initializing" | "on";
type OpfsResponse<S = {}, E = {}> = (OpfsSuccessResponse & S) | (OpfsErrorResponse & E);
type OpfsSuccessResponse = {
    ok: true;
};
type OpfsErrorResponse = {
    ok: false;
    error: unknown;
};
export type OpfsInitRequest = {
    path: string;
};
export type OpfsInitResponse = OpfsResponse;
export type OpfsDataBlockId = number;
export type OpfsDataBlock = {
    chunk: Uint8Array;
    id: OpfsDataBlockId;
};
export type OpfsWriteRequest = {
    source?: ArrayBuffer;
    at?: number;
    keepExistingData?: boolean;
};
export type OpfsWriteResponse = OpfsResponse<{
    endpoint?: ObjectifiedControlledReadableEndpoint<Uint8Array>;
}>;
export type OpfsReadRequest = {
    at: number;
    length?: number;
    noStream?: boolean;
};
export type OpfsReadResponse = OpfsResponse<{
    data: ReadableStream<Uint8Array> | ArrayBuffer;
}>;
export type OpfsHeadResponse = OpfsResponse<{
    size: number;
}>;
export type OpfsDeleteResponse = OpfsResponse;
export type OpfsCloseResponse = OpfsResponse;
export declare class OpfsHandle extends EventTarget2 {
    readonly externalHandleMap?: Map<string, OpfsHandle> | undefined;
    readonly chunk: number;
    private written;
    private handle;
    private messenger;
    path: string;
    state: OpfsState;
    constructor(externalHandleMap?: Map<string, OpfsHandle> | undefined);
    init(request: OpfsInitRequest): Promise<OpfsInitResponse>;
    write(request: OpfsWriteRequest): OpfsWriteResponse;
    read(request: OpfsReadRequest): OpfsReadResponse;
    head(): OpfsHeadResponse;
    close(): OpfsCloseResponse;
    delete(): Promise<OpfsDeleteResponse>;
}
export declare class OpfsWorker {
    private static _instance;
    private worker;
    private workerMessenger;
    private broadcastMessenger;
    private constructor();
    static get instance(): OpfsWorker;
    static checkHandle(path: string): Promise<boolean>;
    static addHandle(request: OpfsInitRequest): Promise<OpfsInitResponse>;
}
export declare class OpfsFile extends EventTarget2 {
    readonly path: string;
    private messenger;
    state: "off" | "initializing" | "on";
    constructor(path: string);
    private _init;
    private init;
    head(): Promise<OpfsSuccessResponse & {
        size: number;
    }>;
    read(at?: number, length?: number): ReadableStream<Uint8Array>;
    _writeArrayBuffer(source: ArrayBuffer, at: number): Promise<OpfsSuccessResponse & {
        endpoint?: ObjectifiedControlledReadableEndpoint<Uint8Array>;
    }>;
    _writeStream(source: ReadableStream<Uint8Array>, at: number): Promise<unknown>;
    write(source: ReadableStream<Uint8Array> | ArrayBuffer, at?: number, keepExistingData?: boolean): Promise<unknown>;
    delete(): Promise<OpfsDeleteResponse>;
    close(): Promise<OpfsCloseResponse>;
    writeText(text: string): Promise<unknown>;
    readText(): Promise<string>;
    writeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<unknown>;
}
export {};
