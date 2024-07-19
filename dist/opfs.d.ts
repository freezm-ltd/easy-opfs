import { EventTarget2 } from "@freezm-ltd/event-target-2";
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
export type OpfsWriteRequest = {
    source: ReadableStream<Uint8Array> | ArrayBuffer;
    at?: number;
    keepExistingData?: boolean;
};
export type OpfsWriteResponse = OpfsResponse;
export type OpfsReadRequest = {
    sink?: WritableStream<Uint8Array>;
    at?: number;
    length?: number;
    noStream?: boolean;
};
export type OpfsReadResponse = OpfsResponse<{
    data?: ReadableStream<Uint8Array> | ArrayBuffer;
}>;
export type OpfsHeadResponse = OpfsResponse<{
    size: number;
}>;
export type OpfsDeleteRequest = {
    path: string;
    onlyHandle: boolean;
};
export type OpfsDeleteResponse = OpfsResponse;
export declare class OpfsHandle extends EventTarget2 {
    readonly handleMap?: Map<string, OpfsHandle> | undefined;
    readonly chunk: number;
    private written;
    private handle;
    private messenger;
    path: string;
    state: OpfsState;
    constructor(handleMap?: Map<string, OpfsHandle> | undefined);
    init(request: OpfsInitRequest): Promise<OpfsInitResponse>;
    write(request: OpfsWriteRequest): OpfsWriteResponse;
    read(request: OpfsReadRequest): OpfsReadResponse;
    head(): OpfsHeadResponse;
    delete(request: OpfsDeleteRequest): Promise<OpfsDeleteResponse>;
}
export declare class OpfsWorker {
    private static _instance;
    private worker;
    private workerMessenger;
    private broadcastMessenger;
    private constructor();
    static get instance(): OpfsWorker;
    static checkHandle(path: string): Promise<any>;
    static addHandle(request: OpfsInitRequest): Promise<OpfsInitResponse>;
    static deleteHandle(request: OpfsDeleteRequest): Promise<OpfsDeleteResponse>;
}
export declare class OpfsFile extends EventTarget2 {
    readonly path: string;
    private messenger;
    state: "off" | "initializing" | "on";
    constructor(path: string);
    private _init;
    private init;
    _read(at: number, length?: number): ReadableStream<any>;
    read(at?: number, length?: number): Promise<ReadableStream<any>>;
    _write(source: ArrayBuffer, at: number): Promise<void>;
    write(source: ReadableStream<Uint8Array> | ArrayBuffer, at?: number, keepExistingData?: boolean): Promise<void>;
    delete(): Promise<import("@freezm-ltd/post-together/dist/message.js").MessagePayload>;
    writeText(text: string): Promise<void>;
    readText(): Promise<string>;
}
export {};
