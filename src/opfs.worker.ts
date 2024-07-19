import { MessengerFactory } from "@freezm-ltd/post-together"
import { OpfsHandle, OpfsInitRequest, OpfsInitResponse } from "./opfs"

const handles: Map<string, OpfsHandle> = new Map()
async function addHandle(request: OpfsInitRequest): Promise<OpfsInitResponse> {
    if (handles.has(request.path)) return { ok: true }
    return await (new OpfsHandle(handles)).init(request)
}

const messenger = MessengerFactory.new(self)
messenger.response("add", async (request: OpfsInitRequest) => {
    return { data: await addHandle(request) }
})