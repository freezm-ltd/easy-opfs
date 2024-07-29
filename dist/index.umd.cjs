(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["easy-opfs"] = {}));
})(this, function(exports2) {
  "use strict";
  var EventTarget2$2 = class EventTarget2 extends EventTarget {
    constructor() {
      super(...arguments);
      this.listeners = /* @__PURE__ */ new Map();
      this._bubbleMap = /* @__PURE__ */ new Map();
      this.atomicQueue = /* @__PURE__ */ new Map();
    }
    async waitFor(type, compareValue) {
      return new Promise((resolve) => {
        if (compareValue !== void 0) {
          this.listenOnceOnly(type, (e) => resolve(e.detail), (e) => e.detail === compareValue);
        } else {
          this.listenOnce(type, (e) => resolve(e.detail));
        }
      });
    }
    callback(type, callback) {
      this.waitFor(type).then(callback);
    }
    dispatch(type, detail) {
      this.dispatchEvent(new CustomEvent(type, detail !== void 0 ? { detail } : void 0));
    }
    listen(type, callback, options) {
      if (!this.listeners.has(type)) this.listeners.set(type, /* @__PURE__ */ new Set());
      this.listeners.get(type).add(callback);
      this.addEventListener(type, callback, options);
    }
    remove(type, callback, options) {
      if (!this.listeners.has(type)) this.listeners.set(type, /* @__PURE__ */ new Set());
      this.listeners.get(type).delete(callback);
      this.removeEventListener(type, callback, options);
    }
    destroy() {
      for (let type of this.listeners.keys()) {
        for (let callback of this.listeners.get(type)) {
          this.remove(type, callback);
        }
      }
    }
    listenOnce(type, callback) {
      this.listen(type, callback, { once: true });
    }
    listenOnceOnly(type, callback, only) {
      const wrapper = (e) => {
        if (only(e)) {
          this.remove(type, wrapper);
          callback(e);
        }
      };
      this.listen(type, wrapper);
    }
    listenDebounce(type, callback, options = { timeout: 100, mode: "last" }) {
      switch (options.mode) {
        case "first":
          return this.listenDebounceFirst(type, callback, options);
        case "last":
          return this.listenDebounceLast(type, callback, options);
      }
    }
    listenDebounceFirst(type, callback, options = { timeout: 100 }) {
      let lastMs = 0;
      this.listen(
        type,
        (e) => {
          const currentMs = Date.now();
          if (currentMs - lastMs > options.timeout) {
            callback(e);
          }
          lastMs = currentMs;
        },
        options
      );
    }
    listenDebounceLast(type, callback, options = { timeout: 100 }) {
      let timoutInstance;
      this.listen(
        type,
        (e) => {
          clearTimeout(timoutInstance);
          timoutInstance = window.setTimeout(() => callback(e), options.timeout);
        },
        options
      );
    }
    enableBubble(type) {
      if (this._bubbleMap.has(type)) return;
      const dispatcher = (e) => {
        var _a;
        (_a = this.parent) == null ? void 0 : _a.dispatch(e.type, e.detail);
      };
      this.listen(type, dispatcher);
      this._bubbleMap.set(type, dispatcher);
    }
    disableBubble(type) {
      if (!this._bubbleMap.has(type)) return;
      const dispatcher = this._bubbleMap.get(type);
      this.remove(type, dispatcher);
      this._bubbleMap.delete(type);
    }
    _atomicInit(type) {
      this.atomicQueue.set(type, []);
      const atomicLoop = async () => {
        const queue = this.atomicQueue.get(type);
        while (true) {
          const task = queue.shift();
          if (task) {
            await task();
          } else {
            await this.waitFor("__atomic-add", type);
          }
        }
      };
      atomicLoop();
    }
    atomic(type, func) {
      return new Promise((resolve) => {
        const wrap = async () => resolve(await func());
        if (!this.atomicQueue.has(type)) this._atomicInit(type);
        this.atomicQueue.get(type).push(wrap);
        this.dispatch("__atomic-add", type);
      });
    }
  };
  var EventTarget2$1 = class EventTarget2 extends EventTarget {
    constructor() {
      super(...arguments);
      this.listeners = /* @__PURE__ */ new Map();
      this._bubbleMap = /* @__PURE__ */ new Map();
      this.atomicQueue = /* @__PURE__ */ new Map();
    }
    async waitFor(type, compareValue) {
      return new Promise((resolve) => {
        if (compareValue !== void 0) {
          this.listenOnceOnly(type, (e) => resolve(e.detail), (e) => e.detail === compareValue);
        } else {
          this.listenOnce(type, (e) => resolve(e.detail));
        }
      });
    }
    callback(type, callback) {
      this.waitFor(type).then(callback);
    }
    dispatch(type, detail) {
      this.dispatchEvent(new CustomEvent(type, detail !== void 0 ? { detail } : void 0));
    }
    listen(type, callback, options) {
      if (!this.listeners.has(type)) this.listeners.set(type, /* @__PURE__ */ new Set());
      this.listeners.get(type).add(callback);
      this.addEventListener(type, callback, options);
    }
    remove(type, callback, options) {
      if (!this.listeners.has(type)) this.listeners.set(type, /* @__PURE__ */ new Set());
      this.listeners.get(type).delete(callback);
      this.removeEventListener(type, callback, options);
    }
    destroy() {
      for (let type of this.listeners.keys()) {
        for (let callback of this.listeners.get(type)) {
          this.remove(type, callback);
        }
      }
    }
    listenOnce(type, callback) {
      this.listen(type, callback, { once: true });
    }
    listenOnceOnly(type, callback, only) {
      const wrapper = (e) => {
        if (only(e)) {
          this.remove(type, wrapper);
          callback(e);
        }
      };
      this.listen(type, wrapper);
    }
    listenDebounce(type, callback, options = { timeout: 100, mode: "last" }) {
      switch (options.mode) {
        case "first":
          return this.listenDebounceFirst(type, callback, options);
        case "last":
          return this.listenDebounceLast(type, callback, options);
      }
    }
    listenDebounceFirst(type, callback, options = { timeout: 100 }) {
      let lastMs = 0;
      this.listen(
        type,
        (e) => {
          const currentMs = Date.now();
          if (currentMs - lastMs > options.timeout) {
            callback(e);
          }
          lastMs = currentMs;
        },
        options
      );
    }
    listenDebounceLast(type, callback, options = { timeout: 100 }) {
      let timoutInstance;
      this.listen(
        type,
        (e) => {
          clearTimeout(timoutInstance);
          timoutInstance = window.setTimeout(() => callback(e), options.timeout);
        },
        options
      );
    }
    enableBubble(type) {
      if (this._bubbleMap.has(type)) return;
      const dispatcher = (e) => {
        var _a;
        (_a = this.parent) == null ? void 0 : _a.dispatch(e.type, e.detail);
      };
      this.listen(type, dispatcher);
      this._bubbleMap.set(type, dispatcher);
    }
    disableBubble(type) {
      if (!this._bubbleMap.has(type)) return;
      const dispatcher = this._bubbleMap.get(type);
      this.remove(type, dispatcher);
      this._bubbleMap.delete(type);
    }
    _atomicInit(type) {
      this.atomicQueue.set(type, []);
      const atomicLoop = async () => {
        const queue = this.atomicQueue.get(type);
        while (true) {
          const task = queue.shift();
          if (task) {
            await task();
          } else {
            await this.waitFor("__atomic-add", type);
          }
        }
      };
      atomicLoop();
    }
    atomic(type, func) {
      return new Promise((resolve) => {
        const wrap = async () => resolve(await func());
        if (!this.atomicQueue.has(type)) this._atomicInit(type);
        this.atomicQueue.get(type).push(wrap);
        this.dispatch("__atomic-add", type);
      });
    }
  };
  function generateId() {
    return crypto.randomUUID();
  }
  var IDENTIFIER$1 = "post-together";
  function isMessage(data) {
    return data.id && data.type && data.__identifier === IDENTIFIER$1;
  }
  function isMessageCustomEvent(e) {
    return "data" in e && isMessage(e.data);
  }
  function unwrapMessage(e) {
    if (isMessageCustomEvent(e)) {
      return e.data;
    }
  }
  var Messenger = class {
    constructor(listenFrom, sendTo) {
      this.listenFrom = listenFrom;
      this.sendTo = sendTo;
      this.activated = true;
      this.listenerWeakMap = /* @__PURE__ */ new WeakMap();
      this.listenerSet = /* @__PURE__ */ new Set();
    }
    // create request message from type and payload
    createRequest(type, payload, transfer) {
      const id = generateId();
      return { id, type, payload, transfer, __type: "request", __identifier: IDENTIFIER$1 };
    }
    // create response message from request message and payload
    createResponse(request, payload, transfer) {
      const { id, type, __identifier } = request;
      return { id, type, payload, transfer, __type: "response", __identifier };
    }
    // inject informations to message
    async _inject(message) {
    }
    // listen for response
    responseCallback(request, callback) {
      const listener = async (e) => {
        const response = unwrapMessage(e);
        if (response && response.id === request.id && response.type === request.type && response.__type === "response") {
          await this._inject(response);
          this.listenFrom.removeEventListener("message", listener);
          callback(response.payload);
        }
      };
      this.listenFrom.addEventListener("message", listener);
      return () => this.listenFrom.removeEventListener("message", listener);
    }
    _getSendTo(event) {
      let sendTo = this.sendTo;
      if (event) {
        const source = event.source;
        if (source) sendTo = source;
      }
      return sendTo;
    }
    // send message
    async _send(message, event) {
      const option = { transfer: message.transfer };
      if (isIframe()) Object.assign(option, { targetOrigin: "*" });
      this._getSendTo(event).postMessage(message, option);
    }
    // send message and get response
    request(type, payload, transfer, timeout = 5e3) {
      return new Promise(async (resolve, reject) => {
        const message = this.createRequest(type, payload, transfer);
        const rejector = this.responseCallback(message, resolve);
        await this._send(message);
        setTimeout(() => {
          rejector();
          reject(`MessengerRequestTimeoutError: request timeout reached: ${timeout}ms`);
        }, timeout);
      });
    }
    wrapMessageHandler(type, handler) {
      return async (e) => {
        const request = unwrapMessage(e);
        if (request && request.type === type && request.__type === "request" && this.activated) {
          await this._inject(request);
          const result = await handler(request.payload);
          let response;
          if (result instanceof Object && "payload" in result && "transfer" in result) {
            const { payload, transfer } = result;
            response = this.createResponse(request, payload, transfer);
          } else {
            response = this.createResponse(request, result);
          }
          await this._send(response, e);
        }
      };
    }
    // get request and give response
    response(type, handler) {
      if (this.listenerSet.has(handler)) throw new Error("MessengerAddEventListenerError: this message handler already attached");
      const wrapped = this.wrapMessageHandler(type, handler);
      this.listenerWeakMap.set(handler, wrapped);
      this.listenerSet.add(handler);
      this.listenFrom.addEventListener("message", wrapped);
    }
    // remove response handler
    deresponse(handler) {
      const iterator = handler ? [handler] : this.listenerSet;
      for (let handler2 of iterator) {
        const wrapped = this.listenerWeakMap.get(handler2);
        if (wrapped) {
          this.listenFrom.removeEventListener("message", wrapped);
          this.listenerWeakMap.delete(handler2);
        }
        this.listenerSet.delete(handler2);
      }
    }
    // re-activate message handling
    activate() {
      if (this.activated) return;
      this.activated = true;
    }
    // deactivate message handling
    deactivate() {
      if (!this.activated) return;
      this.activated = false;
    }
  };
  var CrossOriginWindowMessenger = class extends Messenger {
    constructor(listenFrom, sendTo, sendToOrigin) {
      super(listenFrom, sendTo);
      this.listenFrom = listenFrom;
      this.sendTo = sendTo;
      this.sendToOrigin = sendToOrigin;
    }
    async _send(message, event) {
      this._getSendTo(event).postMessage(message, { transfer: message.transfer, targetOrigin: this.sendToOrigin });
    }
  };
  var MessageHubCrossOriginIframeURL = "https://freezm-ltd.github.io/post-together/iframe/";
  var MessageHubCrossOriginIframeOrigin = new URL(MessageHubCrossOriginIframeURL).origin;
  function isIframe(origin) {
    if (globalThis.constructor === globalThis.Window) {
      if (!origin) origin = window.origin;
      return origin === MessageHubCrossOriginIframeOrigin;
    }
    return false;
  }
  var MessageStoreMessageType = `${IDENTIFIER$1}:__store`;
  var MessageFetchMessageType = `${IDENTIFIER$1}:__fetch`;
  var BroadcastChannelMessenger = class extends Messenger {
    async _inject(message) {
      if (!("metadata" in message)) return;
      const { id } = message;
      const response = await MessageHub.fetch(id);
      if (!response.ok) throw new Error("BroadcastChannelMessengerFetchPayloadError: MessageHub fetch failed.");
      message.payload = response.message.payload;
      message.transfer = response.message.transfer;
    }
    async _send(message) {
      if (message.transfer) {
        const { payload, transfer, ...metadata } = message;
        const result = await MessageHub.store(message);
        if (!result.ok) throw new Error("BroadcastChannelMessengerSendError: MessageHub store failed.");
        Object.assign(metadata, { metadata: true });
        this._getSendTo().postMessage(metadata);
      } else {
        this._getSendTo().postMessage(message);
      }
    }
  };
  var AbstractMessageHub = class extends EventTarget2$1 {
    constructor() {
      super();
      this.state = "off";
      this.listenFroms = /* @__PURE__ */ new Set();
      this.init();
    }
    async init() {
      if (this.state === "on") return;
      if (this.state === "initializing") return await this.waitFor("done");
      this.state = "initializing";
      await this._init();
      this.state = "on";
      this.dispatch("done");
    }
    async _init() {
    }
    async store(message) {
      await this.init();
      return await this.target.request(MessageStoreMessageType, message, message.transfer);
    }
    async fetch(id) {
      await this.init();
      return await this.target.request(MessageFetchMessageType, id);
    }
    // listen request
    async addListen(listenFrom) {
      await this.init();
      if (this.listenFroms.has(listenFrom)) return;
      const listenTarget = MessengerFactory.new(listenFrom);
      this.listenFroms.add(listenFrom);
      listenTarget.response(MessageStoreMessageType, async (message) => {
        return await this.store(message);
      });
      listenTarget.response(MessageFetchMessageType, async (id) => {
        const result = await this.fetch(id);
        if (result.ok) {
          return { payload: result, transfer: result.message.transfer };
        }
        return result;
      });
    }
  };
  var ServiceWorkerMessageHub = class extends AbstractMessageHub {
    constructor() {
      super(...arguments);
      this.storage = /* @__PURE__ */ new Map();
    }
    // add listen; requests from windows -> serviceworker
    async _init() {
      this.addListen(self);
    }
    // service worker is MessageHub storage itself
    async store(message) {
      try {
        this.storage.set(message.id, message);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e };
      }
    }
    async fetch(id) {
      let message = this.storage.get(id);
      if (!message) return { ok: false, error: "Not Found" };
      this.storage.delete(id);
      return { ok: true, message };
    }
  };
  var DedicatedWorkerMessageHub = class extends AbstractMessageHub {
    // worker -> parent window
    async _init() {
      this.target = MessengerFactory.new(self);
    }
  };
  var WindowMessageHub = class extends AbstractMessageHub {
    async _initSameOrigin() {
      if (!globalThis.navigator.serviceWorker.controller) {
        setTimeout(() => {
          window.location.assign(window.location.href);
        }, 1e3);
        await new Promise(() => {
        });
      } else {
        this.target = MessengerFactory.new(globalThis.navigator.serviceWorker);
        window.parent.postMessage("loadend", { targetOrigin: "*" });
      }
    }
    async _initCrossOrigin() {
      let iframeload = false;
      const iframe = document.createElement("iframe");
      const listener = (e) => {
        if (isIframe(e.origin) && e.data === "loadend") {
          iframeload = true;
          this.dispatch("iframeloadend");
          window.removeEventListener("message", listener);
        }
      };
      window.addEventListener("message", listener);
      iframe.setAttribute("src", MessageHubCrossOriginIframeURL);
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      if (!iframeload) await this.waitFor("iframeloadend");
      this.target = new CrossOriginWindowMessenger(window, iframe.contentWindow, MessageHubCrossOriginIframeOrigin);
    }
    // worker/window -> window -> iframe/serviceworker -> window -> worker/window
    async _init() {
      if (isIframe()) await this._initSameOrigin();
      else await this._initCrossOrigin();
      this.addListen(window);
    }
  };
  var MessageHub = class _MessageHub {
    constructor() {
      this.changeHub();
    }
    changeHub() {
      switch (globalThis.constructor) {
        case globalThis.ServiceWorkerGlobalScope:
          this.hub = new ServiceWorkerMessageHub();
          break;
        case globalThis.Window:
          this.hub = new WindowMessageHub();
          break;
        case globalThis.DedicatedWorkerGlobalScope:
          this.hub = new DedicatedWorkerMessageHub();
          break;
        default:
          throw new Error("MessageHubConstructError: Cannot create MessageHub instance in this scope.");
      }
    }
    static init() {
      if (!_MessageHub._instance) _MessageHub._instance = new _MessageHub();
    }
    static get instance() {
      this.init();
      return _MessageHub._instance;
    }
    static async store(message) {
      return this.instance.hub.store(message);
    }
    static async fetch(id) {
      return this.instance.hub.fetch(id);
    }
    static async addListen(listenFrom) {
      return this.instance.hub.addListen(listenFrom);
    }
  };
  var MessengerFactory = class {
    constructor() {
    }
    static new(option) {
      if (!option) throw new Error("MessengerFactoryNoOptionError: Cannot create Messenger, argument 'option' is not provided");
      let send;
      let listen;
      switch (option.constructor) {
        case globalThis.ServiceWorker: {
          listen = window.navigator.serviceWorker;
          send = option;
          break;
        }
        case globalThis.ServiceWorkerContainer: {
          listen = option;
          send = option.controller;
          break;
        }
        case globalThis.ServiceWorkerGlobalScope: {
          listen = option;
          send = void 0;
          break;
        }
        case globalThis.Worker: {
          listen = send = option;
          MessageHub.addListen(option);
          break;
        }
        case globalThis.DedicatedWorkerGlobalScope: {
          listen = send = option;
          break;
        }
        case globalThis.Window: {
          const targetWindow = option;
          listen = window;
          send = targetWindow;
          break;
        }
        case globalThis.Client: {
          listen = self;
          send = option;
          break;
        }
        case globalThis.BroadcastChannel: {
          const name = option.name;
          return new BroadcastChannelMessenger(new BroadcastChannel(name), new BroadcastChannel(name));
        }
        case globalThis.MessagePort: {
          listen = send = option;
          break;
        }
      }
      if (listen) {
        return new Messenger(listen, send);
      } else {
        throw new Error("MessengerFactoryError: Cannot create Messenger, arguments not supported");
      }
    }
  };
  MessageHub.init();
  function path2array(path) {
    return path.split("/").filter(Boolean);
  }
  function normalizePath(path) {
    return path2array(path).join("/");
  }
  const encodedJs = "KGZ1bmN0aW9uKCkgewogICJ1c2Ugc3RyaWN0IjsKICB2YXIgRXZlbnRUYXJnZXQyJDIgPSBjbGFzcyBFdmVudFRhcmdldDIgZXh0ZW5kcyBFdmVudFRhcmdldCB7CiAgICBjb25zdHJ1Y3RvcigpIHsKICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTsKICAgICAgdGhpcy5saXN0ZW5lcnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICB0aGlzLl9idWJibGVNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgICB0aGlzLmF0b21pY1F1ZXVlID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIH0KICAgIGFzeW5jIHdhaXRGb3IodHlwZSwgY29tcGFyZVZhbHVlKSB7CiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gewogICAgICAgIGlmIChjb21wYXJlVmFsdWUgIT09IHZvaWQgMCkgewogICAgICAgICAgdGhpcy5saXN0ZW5PbmNlT25seSh0eXBlLCAoZSkgPT4gcmVzb2x2ZShlLmRldGFpbCksIChlKSA9PiBlLmRldGFpbCA9PT0gY29tcGFyZVZhbHVlKTsKICAgICAgICB9IGVsc2UgewogICAgICAgICAgdGhpcy5saXN0ZW5PbmNlKHR5cGUsIChlKSA9PiByZXNvbHZlKGUuZGV0YWlsKSk7CiAgICAgICAgfQogICAgICB9KTsKICAgIH0KICAgIGNhbGxiYWNrKHR5cGUsIGNhbGxiYWNrKSB7CiAgICAgIHRoaXMud2FpdEZvcih0eXBlKS50aGVuKGNhbGxiYWNrKTsKICAgIH0KICAgIGRpc3BhdGNoKHR5cGUsIGRldGFpbCkgewogICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KHR5cGUsIGRldGFpbCAhPT0gdm9pZCAwID8geyBkZXRhaWwgfSA6IHZvaWQgMCkpOwogICAgfQogICAgbGlzdGVuKHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zKSB7CiAgICAgIGlmICghdGhpcy5saXN0ZW5lcnMuaGFzKHR5cGUpKSB0aGlzLmxpc3RlbmVycy5zZXQodHlwZSwgLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSk7CiAgICAgIHRoaXMubGlzdGVuZXJzLmdldCh0eXBlKS5hZGQoY2FsbGJhY2spOwogICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMpOwogICAgfQogICAgcmVtb3ZlKHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zKSB7CiAgICAgIGlmICghdGhpcy5saXN0ZW5lcnMuaGFzKHR5cGUpKSB0aGlzLmxpc3RlbmVycy5zZXQodHlwZSwgLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSk7CiAgICAgIHRoaXMubGlzdGVuZXJzLmdldCh0eXBlKS5kZWxldGUoY2FsbGJhY2spOwogICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMpOwogICAgfQogICAgZGVzdHJveSgpIHsKICAgICAgZm9yIChsZXQgdHlwZSBvZiB0aGlzLmxpc3RlbmVycy5rZXlzKCkpIHsKICAgICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiB0aGlzLmxpc3RlbmVycy5nZXQodHlwZSkpIHsKICAgICAgICAgIHRoaXMucmVtb3ZlKHR5cGUsIGNhbGxiYWNrKTsKICAgICAgICB9CiAgICAgIH0KICAgIH0KICAgIGxpc3Rlbk9uY2UodHlwZSwgY2FsbGJhY2spIHsKICAgICAgdGhpcy5saXN0ZW4odHlwZSwgY2FsbGJhY2ssIHsgb25jZTogdHJ1ZSB9KTsKICAgIH0KICAgIGxpc3Rlbk9uY2VPbmx5KHR5cGUsIGNhbGxiYWNrLCBvbmx5KSB7CiAgICAgIGNvbnN0IHdyYXBwZXIgPSAoZSkgPT4gewogICAgICAgIGlmIChvbmx5KGUpKSB7CiAgICAgICAgICB0aGlzLnJlbW92ZSh0eXBlLCB3cmFwcGVyKTsKICAgICAgICAgIGNhbGxiYWNrKGUpOwogICAgICAgIH0KICAgICAgfTsKICAgICAgdGhpcy5saXN0ZW4odHlwZSwgd3JhcHBlcik7CiAgICB9CiAgICBsaXN0ZW5EZWJvdW5jZSh0eXBlLCBjYWxsYmFjaywgb3B0aW9ucyA9IHsgdGltZW91dDogMTAwLCBtb2RlOiAibGFzdCIgfSkgewogICAgICBzd2l0Y2ggKG9wdGlvbnMubW9kZSkgewogICAgICAgIGNhc2UgImZpcnN0IjoKICAgICAgICAgIHJldHVybiB0aGlzLmxpc3RlbkRlYm91bmNlRmlyc3QodHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMpOwogICAgICAgIGNhc2UgImxhc3QiOgogICAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuRGVib3VuY2VMYXN0KHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zKTsKICAgICAgfQogICAgfQogICAgbGlzdGVuRGVib3VuY2VGaXJzdCh0eXBlLCBjYWxsYmFjaywgb3B0aW9ucyA9IHsgdGltZW91dDogMTAwIH0pIHsKICAgICAgbGV0IGxhc3RNcyA9IDA7CiAgICAgIHRoaXMubGlzdGVuKAogICAgICAgIHR5cGUsCiAgICAgICAgKGUpID0+IHsKICAgICAgICAgIGNvbnN0IGN1cnJlbnRNcyA9IERhdGUubm93KCk7CiAgICAgICAgICBpZiAoY3VycmVudE1zIC0gbGFzdE1zID4gb3B0aW9ucy50aW1lb3V0KSB7CiAgICAgICAgICAgIGNhbGxiYWNrKGUpOwogICAgICAgICAgfQogICAgICAgICAgbGFzdE1zID0gY3VycmVudE1zOwogICAgICAgIH0sCiAgICAgICAgb3B0aW9ucwogICAgICApOwogICAgfQogICAgbGlzdGVuRGVib3VuY2VMYXN0KHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zID0geyB0aW1lb3V0OiAxMDAgfSkgewogICAgICBsZXQgdGltb3V0SW5zdGFuY2U7CiAgICAgIHRoaXMubGlzdGVuKAogICAgICAgIHR5cGUsCiAgICAgICAgKGUpID0+IHsKICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1vdXRJbnN0YW5jZSk7CiAgICAgICAgICB0aW1vdXRJbnN0YW5jZSA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IGNhbGxiYWNrKGUpLCBvcHRpb25zLnRpbWVvdXQpOwogICAgICAgIH0sCiAgICAgICAgb3B0aW9ucwogICAgICApOwogICAgfQogICAgZW5hYmxlQnViYmxlKHR5cGUpIHsKICAgICAgaWYgKHRoaXMuX2J1YmJsZU1hcC5oYXModHlwZSkpIHJldHVybjsKICAgICAgY29uc3QgZGlzcGF0Y2hlciA9IChlKSA9PiB7CiAgICAgICAgdmFyIF9hOwogICAgICAgIChfYSA9IHRoaXMucGFyZW50KSA9PSBudWxsID8gdm9pZCAwIDogX2EuZGlzcGF0Y2goZS50eXBlLCBlLmRldGFpbCk7CiAgICAgIH07CiAgICAgIHRoaXMubGlzdGVuKHR5cGUsIGRpc3BhdGNoZXIpOwogICAgICB0aGlzLl9idWJibGVNYXAuc2V0KHR5cGUsIGRpc3BhdGNoZXIpOwogICAgfQogICAgZGlzYWJsZUJ1YmJsZSh0eXBlKSB7CiAgICAgIGlmICghdGhpcy5fYnViYmxlTWFwLmhhcyh0eXBlKSkgcmV0dXJuOwogICAgICBjb25zdCBkaXNwYXRjaGVyID0gdGhpcy5fYnViYmxlTWFwLmdldCh0eXBlKTsKICAgICAgdGhpcy5yZW1vdmUodHlwZSwgZGlzcGF0Y2hlcik7CiAgICAgIHRoaXMuX2J1YmJsZU1hcC5kZWxldGUodHlwZSk7CiAgICB9CiAgICBfYXRvbWljSW5pdCh0eXBlKSB7CiAgICAgIHRoaXMuYXRvbWljUXVldWUuc2V0KHR5cGUsIFtdKTsKICAgICAgY29uc3QgYXRvbWljTG9vcCA9IGFzeW5jICgpID0+IHsKICAgICAgICBjb25zdCBxdWV1ZSA9IHRoaXMuYXRvbWljUXVldWUuZ2V0KHR5cGUpOwogICAgICAgIHdoaWxlICh0cnVlKSB7CiAgICAgICAgICBjb25zdCB0YXNrID0gcXVldWUuc2hpZnQoKTsKICAgICAgICAgIGlmICh0YXNrKSB7CiAgICAgICAgICAgIGF3YWl0IHRhc2soKTsKICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgIGF3YWl0IHRoaXMud2FpdEZvcigiX19hdG9taWMtYWRkIiwgdHlwZSk7CiAgICAgICAgICB9CiAgICAgICAgfQogICAgICB9OwogICAgICBhdG9taWNMb29wKCk7CiAgICB9CiAgICBhdG9taWModHlwZSwgZnVuYykgewogICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHsKICAgICAgICBjb25zdCB3cmFwID0gYXN5bmMgKCkgPT4gcmVzb2x2ZShhd2FpdCBmdW5jKCkpOwogICAgICAgIGlmICghdGhpcy5hdG9taWNRdWV1ZS5oYXModHlwZSkpIHRoaXMuX2F0b21pY0luaXQodHlwZSk7CiAgICAgICAgdGhpcy5hdG9taWNRdWV1ZS5nZXQodHlwZSkucHVzaCh3cmFwKTsKICAgICAgICB0aGlzLmRpc3BhdGNoKCJfX2F0b21pYy1hZGQiLCB0eXBlKTsKICAgICAgfSk7CiAgICB9CiAgfTsKICBmdW5jdGlvbiBnZW5lcmF0ZUlkKCkgewogICAgcmV0dXJuIGNyeXB0by5yYW5kb21VVUlEKCk7CiAgfQogIHZhciBJREVOVElGSUVSJDEgPSAicG9zdC10b2dldGhlciI7CiAgZnVuY3Rpb24gaXNNZXNzYWdlKGRhdGEpIHsKICAgIHJldHVybiBkYXRhLmlkICYmIGRhdGEudHlwZSAmJiBkYXRhLl9faWRlbnRpZmllciA9PT0gSURFTlRJRklFUiQxOwogIH0KICBmdW5jdGlvbiBpc01lc3NhZ2VDdXN0b21FdmVudChlKSB7CiAgICByZXR1cm4gImRhdGEiIGluIGUgJiYgaXNNZXNzYWdlKGUuZGF0YSk7CiAgfQogIGZ1bmN0aW9uIHVud3JhcE1lc3NhZ2UoZSkgewogICAgaWYgKGlzTWVzc2FnZUN1c3RvbUV2ZW50KGUpKSB7CiAgICAgIHJldHVybiBlLmRhdGE7CiAgICB9CiAgfQogIHZhciBNZXNzZW5nZXIgPSBjbGFzcyB7CiAgICBjb25zdHJ1Y3RvcihsaXN0ZW5Gcm9tLCBzZW5kVG8pIHsKICAgICAgdGhpcy5saXN0ZW5Gcm9tID0gbGlzdGVuRnJvbTsKICAgICAgdGhpcy5zZW5kVG8gPSBzZW5kVG87CiAgICAgIHRoaXMuYWN0aXZhdGVkID0gdHJ1ZTsKICAgICAgdGhpcy5saXN0ZW5lcldlYWtNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTsKICAgICAgdGhpcy5saXN0ZW5lclNldCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7CiAgICB9CiAgICAvLyBjcmVhdGUgcmVxdWVzdCBtZXNzYWdlIGZyb20gdHlwZSBhbmQgcGF5bG9hZAogICAgY3JlYXRlUmVxdWVzdCh0eXBlLCBwYXlsb2FkLCB0cmFuc2ZlcikgewogICAgICBjb25zdCBpZCA9IGdlbmVyYXRlSWQoKTsKICAgICAgcmV0dXJuIHsgaWQsIHR5cGUsIHBheWxvYWQsIHRyYW5zZmVyLCBfX3R5cGU6ICJyZXF1ZXN0IiwgX19pZGVudGlmaWVyOiBJREVOVElGSUVSJDEgfTsKICAgIH0KICAgIC8vIGNyZWF0ZSByZXNwb25zZSBtZXNzYWdlIGZyb20gcmVxdWVzdCBtZXNzYWdlIGFuZCBwYXlsb2FkCiAgICBjcmVhdGVSZXNwb25zZShyZXF1ZXN0LCBwYXlsb2FkLCB0cmFuc2ZlcikgewogICAgICBjb25zdCB7IGlkLCB0eXBlLCBfX2lkZW50aWZpZXIgfSA9IHJlcXVlc3Q7CiAgICAgIHJldHVybiB7IGlkLCB0eXBlLCBwYXlsb2FkLCB0cmFuc2ZlciwgX190eXBlOiAicmVzcG9uc2UiLCBfX2lkZW50aWZpZXIgfTsKICAgIH0KICAgIC8vIGluamVjdCBpbmZvcm1hdGlvbnMgdG8gbWVzc2FnZQogICAgYXN5bmMgX2luamVjdChtZXNzYWdlKSB7CiAgICB9CiAgICAvLyBsaXN0ZW4gZm9yIHJlc3BvbnNlCiAgICByZXNwb25zZUNhbGxiYWNrKHJlcXVlc3QsIGNhbGxiYWNrKSB7CiAgICAgIGNvbnN0IGxpc3RlbmVyID0gYXN5bmMgKGUpID0+IHsKICAgICAgICBjb25zdCByZXNwb25zZSA9IHVud3JhcE1lc3NhZ2UoZSk7CiAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmlkID09PSByZXF1ZXN0LmlkICYmIHJlc3BvbnNlLnR5cGUgPT09IHJlcXVlc3QudHlwZSAmJiByZXNwb25zZS5fX3R5cGUgPT09ICJyZXNwb25zZSIpIHsKICAgICAgICAgIGF3YWl0IHRoaXMuX2luamVjdChyZXNwb25zZSk7CiAgICAgICAgICB0aGlzLmxpc3RlbkZyb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsIGxpc3RlbmVyKTsKICAgICAgICAgIGNhbGxiYWNrKHJlc3BvbnNlLnBheWxvYWQpOwogICAgICAgIH0KICAgICAgfTsKICAgICAgdGhpcy5saXN0ZW5Gcm9tLmFkZEV2ZW50TGlzdGVuZXIoIm1lc3NhZ2UiLCBsaXN0ZW5lcik7CiAgICAgIHJldHVybiAoKSA9PiB0aGlzLmxpc3RlbkZyb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsIGxpc3RlbmVyKTsKICAgIH0KICAgIF9nZXRTZW5kVG8oZXZlbnQpIHsKICAgICAgbGV0IHNlbmRUbyA9IHRoaXMuc2VuZFRvOwogICAgICBpZiAoZXZlbnQpIHsKICAgICAgICBjb25zdCBzb3VyY2UgPSBldmVudC5zb3VyY2U7CiAgICAgICAgaWYgKHNvdXJjZSkgc2VuZFRvID0gc291cmNlOwogICAgICB9CiAgICAgIHJldHVybiBzZW5kVG87CiAgICB9CiAgICAvLyBzZW5kIG1lc3NhZ2UKICAgIGFzeW5jIF9zZW5kKG1lc3NhZ2UsIGV2ZW50KSB7CiAgICAgIGNvbnN0IG9wdGlvbiA9IHsgdHJhbnNmZXI6IG1lc3NhZ2UudHJhbnNmZXIgfTsKICAgICAgaWYgKGlzSWZyYW1lKCkpIE9iamVjdC5hc3NpZ24ob3B0aW9uLCB7IHRhcmdldE9yaWdpbjogIioiIH0pOwogICAgICB0aGlzLl9nZXRTZW5kVG8oZXZlbnQpLnBvc3RNZXNzYWdlKG1lc3NhZ2UsIG9wdGlvbik7CiAgICB9CiAgICAvLyBzZW5kIG1lc3NhZ2UgYW5kIGdldCByZXNwb25zZQogICAgcmVxdWVzdCh0eXBlLCBwYXlsb2FkLCB0cmFuc2ZlciwgdGltZW91dCA9IDVlMykgewogICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4gewogICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLmNyZWF0ZVJlcXVlc3QodHlwZSwgcGF5bG9hZCwgdHJhbnNmZXIpOwogICAgICAgIGNvbnN0IHJlamVjdG9yID0gdGhpcy5yZXNwb25zZUNhbGxiYWNrKG1lc3NhZ2UsIHJlc29sdmUpOwogICAgICAgIGF3YWl0IHRoaXMuX3NlbmQobWVzc2FnZSk7CiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7CiAgICAgICAgICByZWplY3RvcigpOwogICAgICAgICAgcmVqZWN0KGBNZXNzZW5nZXJSZXF1ZXN0VGltZW91dEVycm9yOiByZXF1ZXN0IHRpbWVvdXQgcmVhY2hlZDogJHt0aW1lb3V0fW1zYCk7CiAgICAgICAgfSwgdGltZW91dCk7CiAgICAgIH0pOwogICAgfQogICAgd3JhcE1lc3NhZ2VIYW5kbGVyKHR5cGUsIGhhbmRsZXIpIHsKICAgICAgcmV0dXJuIGFzeW5jIChlKSA9PiB7CiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHVud3JhcE1lc3NhZ2UoZSk7CiAgICAgICAgaWYgKHJlcXVlc3QgJiYgcmVxdWVzdC50eXBlID09PSB0eXBlICYmIHJlcXVlc3QuX190eXBlID09PSAicmVxdWVzdCIgJiYgdGhpcy5hY3RpdmF0ZWQpIHsKICAgICAgICAgIGF3YWl0IHRoaXMuX2luamVjdChyZXF1ZXN0KTsKICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZXIocmVxdWVzdC5wYXlsb2FkKTsKICAgICAgICAgIGxldCByZXNwb25zZTsKICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBPYmplY3QgJiYgInBheWxvYWQiIGluIHJlc3VsdCAmJiAidHJhbnNmZXIiIGluIHJlc3VsdCkgewogICAgICAgICAgICBjb25zdCB7IHBheWxvYWQsIHRyYW5zZmVyIH0gPSByZXN1bHQ7CiAgICAgICAgICAgIHJlc3BvbnNlID0gdGhpcy5jcmVhdGVSZXNwb25zZShyZXF1ZXN0LCBwYXlsb2FkLCB0cmFuc2Zlcik7CiAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICByZXNwb25zZSA9IHRoaXMuY3JlYXRlUmVzcG9uc2UocmVxdWVzdCwgcmVzdWx0KTsKICAgICAgICAgIH0KICAgICAgICAgIGF3YWl0IHRoaXMuX3NlbmQocmVzcG9uc2UsIGUpOwogICAgICAgIH0KICAgICAgfTsKICAgIH0KICAgIC8vIGdldCByZXF1ZXN0IGFuZCBnaXZlIHJlc3BvbnNlCiAgICByZXNwb25zZSh0eXBlLCBoYW5kbGVyKSB7CiAgICAgIGlmICh0aGlzLmxpc3RlbmVyU2V0LmhhcyhoYW5kbGVyKSkgdGhyb3cgbmV3IEVycm9yKCJNZXNzZW5nZXJBZGRFdmVudExpc3RlbmVyRXJyb3I6IHRoaXMgbWVzc2FnZSBoYW5kbGVyIGFscmVhZHkgYXR0YWNoZWQiKTsKICAgICAgY29uc3Qgd3JhcHBlZCA9IHRoaXMud3JhcE1lc3NhZ2VIYW5kbGVyKHR5cGUsIGhhbmRsZXIpOwogICAgICB0aGlzLmxpc3RlbmVyV2Vha01hcC5zZXQoaGFuZGxlciwgd3JhcHBlZCk7CiAgICAgIHRoaXMubGlzdGVuZXJTZXQuYWRkKGhhbmRsZXIpOwogICAgICB0aGlzLmxpc3RlbkZyb20uYWRkRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsIHdyYXBwZWQpOwogICAgfQogICAgLy8gcmVtb3ZlIHJlc3BvbnNlIGhhbmRsZXIKICAgIGRlcmVzcG9uc2UoaGFuZGxlcikgewogICAgICBjb25zdCBpdGVyYXRvciA9IGhhbmRsZXIgPyBbaGFuZGxlcl0gOiB0aGlzLmxpc3RlbmVyU2V0OwogICAgICBmb3IgKGxldCBoYW5kbGVyMiBvZiBpdGVyYXRvcikgewogICAgICAgIGNvbnN0IHdyYXBwZWQgPSB0aGlzLmxpc3RlbmVyV2Vha01hcC5nZXQoaGFuZGxlcjIpOwogICAgICAgIGlmICh3cmFwcGVkKSB7CiAgICAgICAgICB0aGlzLmxpc3RlbkZyb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsIHdyYXBwZWQpOwogICAgICAgICAgdGhpcy5saXN0ZW5lcldlYWtNYXAuZGVsZXRlKGhhbmRsZXIyKTsKICAgICAgICB9CiAgICAgICAgdGhpcy5saXN0ZW5lclNldC5kZWxldGUoaGFuZGxlcjIpOwogICAgICB9CiAgICB9CiAgICAvLyByZS1hY3RpdmF0ZSBtZXNzYWdlIGhhbmRsaW5nCiAgICBhY3RpdmF0ZSgpIHsKICAgICAgaWYgKHRoaXMuYWN0aXZhdGVkKSByZXR1cm47CiAgICAgIHRoaXMuYWN0aXZhdGVkID0gdHJ1ZTsKICAgIH0KICAgIC8vIGRlYWN0aXZhdGUgbWVzc2FnZSBoYW5kbGluZwogICAgZGVhY3RpdmF0ZSgpIHsKICAgICAgaWYgKCF0aGlzLmFjdGl2YXRlZCkgcmV0dXJuOwogICAgICB0aGlzLmFjdGl2YXRlZCA9IGZhbHNlOwogICAgfQogIH07CiAgdmFyIENyb3NzT3JpZ2luV2luZG93TWVzc2VuZ2VyID0gY2xhc3MgZXh0ZW5kcyBNZXNzZW5nZXIgewogICAgY29uc3RydWN0b3IobGlzdGVuRnJvbSwgc2VuZFRvLCBzZW5kVG9PcmlnaW4pIHsKICAgICAgc3VwZXIobGlzdGVuRnJvbSwgc2VuZFRvKTsKICAgICAgdGhpcy5saXN0ZW5Gcm9tID0gbGlzdGVuRnJvbTsKICAgICAgdGhpcy5zZW5kVG8gPSBzZW5kVG87CiAgICAgIHRoaXMuc2VuZFRvT3JpZ2luID0gc2VuZFRvT3JpZ2luOwogICAgfQogICAgYXN5bmMgX3NlbmQobWVzc2FnZSwgZXZlbnQpIHsKICAgICAgdGhpcy5fZ2V0U2VuZFRvKGV2ZW50KS5wb3N0TWVzc2FnZShtZXNzYWdlLCB7IHRyYW5zZmVyOiBtZXNzYWdlLnRyYW5zZmVyLCB0YXJnZXRPcmlnaW46IHRoaXMuc2VuZFRvT3JpZ2luIH0pOwogICAgfQogIH07CiAgdmFyIE1lc3NhZ2VIdWJDcm9zc09yaWdpbklmcmFtZVVSTCA9ICJodHRwczovL2ZyZWV6bS1sdGQuZ2l0aHViLmlvL3Bvc3QtdG9nZXRoZXIvaWZyYW1lLyI7CiAgdmFyIE1lc3NhZ2VIdWJDcm9zc09yaWdpbklmcmFtZU9yaWdpbiA9IG5ldyBVUkwoTWVzc2FnZUh1YkNyb3NzT3JpZ2luSWZyYW1lVVJMKS5vcmlnaW47CiAgZnVuY3Rpb24gaXNJZnJhbWUob3JpZ2luKSB7CiAgICBpZiAoZ2xvYmFsVGhpcy5jb25zdHJ1Y3RvciA9PT0gZ2xvYmFsVGhpcy5XaW5kb3cpIHsKICAgICAgaWYgKCFvcmlnaW4pIG9yaWdpbiA9IHdpbmRvdy5vcmlnaW47CiAgICAgIHJldHVybiBvcmlnaW4gPT09IE1lc3NhZ2VIdWJDcm9zc09yaWdpbklmcmFtZU9yaWdpbjsKICAgIH0KICAgIHJldHVybiBmYWxzZTsKICB9CiAgdmFyIE1lc3NhZ2VTdG9yZU1lc3NhZ2VUeXBlID0gYCR7SURFTlRJRklFUiQxfTpfX3N0b3JlYDsKICB2YXIgTWVzc2FnZUZldGNoTWVzc2FnZVR5cGUgPSBgJHtJREVOVElGSUVSJDF9Ol9fZmV0Y2hgOwogIHZhciBCcm9hZGNhc3RDaGFubmVsTWVzc2VuZ2VyID0gY2xhc3MgZXh0ZW5kcyBNZXNzZW5nZXIgewogICAgYXN5bmMgX2luamVjdChtZXNzYWdlKSB7CiAgICAgIGlmICghKCJtZXRhZGF0YSIgaW4gbWVzc2FnZSkpIHJldHVybjsKICAgICAgY29uc3QgeyBpZCB9ID0gbWVzc2FnZTsKICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBNZXNzYWdlSHViLmZldGNoKGlkKTsKICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKCJCcm9hZGNhc3RDaGFubmVsTWVzc2VuZ2VyRmV0Y2hQYXlsb2FkRXJyb3I6IE1lc3NhZ2VIdWIgZmV0Y2ggZmFpbGVkLiIpOwogICAgICBtZXNzYWdlLnBheWxvYWQgPSByZXNwb25zZS5tZXNzYWdlLnBheWxvYWQ7CiAgICAgIG1lc3NhZ2UudHJhbnNmZXIgPSByZXNwb25zZS5tZXNzYWdlLnRyYW5zZmVyOwogICAgfQogICAgYXN5bmMgX3NlbmQobWVzc2FnZSkgewogICAgICBpZiAobWVzc2FnZS50cmFuc2ZlcikgewogICAgICAgIGNvbnN0IHsgcGF5bG9hZCwgdHJhbnNmZXIsIC4uLm1ldGFkYXRhIH0gPSBtZXNzYWdlOwogICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IE1lc3NhZ2VIdWIuc3RvcmUobWVzc2FnZSk7CiAgICAgICAgaWYgKCFyZXN1bHQub2spIHRocm93IG5ldyBFcnJvcigiQnJvYWRjYXN0Q2hhbm5lbE1lc3NlbmdlclNlbmRFcnJvcjogTWVzc2FnZUh1YiBzdG9yZSBmYWlsZWQuIik7CiAgICAgICAgT2JqZWN0LmFzc2lnbihtZXRhZGF0YSwgeyBtZXRhZGF0YTogdHJ1ZSB9KTsKICAgICAgICB0aGlzLl9nZXRTZW5kVG8oKS5wb3N0TWVzc2FnZShtZXRhZGF0YSk7CiAgICAgIH0gZWxzZSB7CiAgICAgICAgdGhpcy5fZ2V0U2VuZFRvKCkucG9zdE1lc3NhZ2UobWVzc2FnZSk7CiAgICAgIH0KICAgIH0KICB9OwogIHZhciBBYnN0cmFjdE1lc3NhZ2VIdWIgPSBjbGFzcyBleHRlbmRzIEV2ZW50VGFyZ2V0MiQyIHsKICAgIGNvbnN0cnVjdG9yKCkgewogICAgICBzdXBlcigpOwogICAgICB0aGlzLnN0YXRlID0gIm9mZiI7CiAgICAgIHRoaXMubGlzdGVuRnJvbXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpOwogICAgICB0aGlzLmluaXQoKTsKICAgIH0KICAgIGFzeW5jIGluaXQoKSB7CiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAib24iKSByZXR1cm47CiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAiaW5pdGlhbGl6aW5nIikgcmV0dXJuIGF3YWl0IHRoaXMud2FpdEZvcigiZG9uZSIpOwogICAgICB0aGlzLnN0YXRlID0gImluaXRpYWxpemluZyI7CiAgICAgIGF3YWl0IHRoaXMuX2luaXQoKTsKICAgICAgdGhpcy5zdGF0ZSA9ICJvbiI7CiAgICAgIHRoaXMuZGlzcGF0Y2goImRvbmUiKTsKICAgIH0KICAgIGFzeW5jIF9pbml0KCkgewogICAgfQogICAgYXN5bmMgc3RvcmUobWVzc2FnZSkgewogICAgICBhd2FpdCB0aGlzLmluaXQoKTsKICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudGFyZ2V0LnJlcXVlc3QoTWVzc2FnZVN0b3JlTWVzc2FnZVR5cGUsIG1lc3NhZ2UsIG1lc3NhZ2UudHJhbnNmZXIpOwogICAgfQogICAgYXN5bmMgZmV0Y2goaWQpIHsKICAgICAgYXdhaXQgdGhpcy5pbml0KCk7CiAgICAgIHJldHVybiBhd2FpdCB0aGlzLnRhcmdldC5yZXF1ZXN0KE1lc3NhZ2VGZXRjaE1lc3NhZ2VUeXBlLCBpZCk7CiAgICB9CiAgICAvLyBsaXN0ZW4gcmVxdWVzdAogICAgYXN5bmMgYWRkTGlzdGVuKGxpc3RlbkZyb20pIHsKICAgICAgYXdhaXQgdGhpcy5pbml0KCk7CiAgICAgIGlmICh0aGlzLmxpc3RlbkZyb21zLmhhcyhsaXN0ZW5Gcm9tKSkgcmV0dXJuOwogICAgICBjb25zdCBsaXN0ZW5UYXJnZXQgPSBNZXNzZW5nZXJGYWN0b3J5Lm5ldyhsaXN0ZW5Gcm9tKTsKICAgICAgdGhpcy5saXN0ZW5Gcm9tcy5hZGQobGlzdGVuRnJvbSk7CiAgICAgIGxpc3RlblRhcmdldC5yZXNwb25zZShNZXNzYWdlU3RvcmVNZXNzYWdlVHlwZSwgYXN5bmMgKG1lc3NhZ2UpID0+IHsKICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdG9yZShtZXNzYWdlKTsKICAgICAgfSk7CiAgICAgIGxpc3RlblRhcmdldC5yZXNwb25zZShNZXNzYWdlRmV0Y2hNZXNzYWdlVHlwZSwgYXN5bmMgKGlkKSA9PiB7CiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5mZXRjaChpZCk7CiAgICAgICAgaWYgKHJlc3VsdC5vaykgewogICAgICAgICAgcmV0dXJuIHsgcGF5bG9hZDogcmVzdWx0LCB0cmFuc2ZlcjogcmVzdWx0Lm1lc3NhZ2UudHJhbnNmZXIgfTsKICAgICAgICB9CiAgICAgICAgcmV0dXJuIHJlc3VsdDsKICAgICAgfSk7CiAgICB9CiAgfTsKICB2YXIgU2VydmljZVdvcmtlck1lc3NhZ2VIdWIgPSBjbGFzcyBleHRlbmRzIEFic3RyYWN0TWVzc2FnZUh1YiB7CiAgICBjb25zdHJ1Y3RvcigpIHsKICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTsKICAgICAgdGhpcy5zdG9yYWdlID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgIH0KICAgIC8vIGFkZCBsaXN0ZW47IHJlcXVlc3RzIGZyb20gd2luZG93cyAtPiBzZXJ2aWNld29ya2VyCiAgICBhc3luYyBfaW5pdCgpIHsKICAgICAgdGhpcy5hZGRMaXN0ZW4oc2VsZik7CiAgICB9CiAgICAvLyBzZXJ2aWNlIHdvcmtlciBpcyBNZXNzYWdlSHViIHN0b3JhZ2UgaXRzZWxmCiAgICBhc3luYyBzdG9yZShtZXNzYWdlKSB7CiAgICAgIHRyeSB7CiAgICAgICAgdGhpcy5zdG9yYWdlLnNldChtZXNzYWdlLmlkLCBtZXNzYWdlKTsKICAgICAgICByZXR1cm4geyBvazogdHJ1ZSB9OwogICAgICB9IGNhdGNoIChlKSB7CiAgICAgICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSB9OwogICAgICB9CiAgICB9CiAgICBhc3luYyBmZXRjaChpZCkgewogICAgICBsZXQgbWVzc2FnZSA9IHRoaXMuc3RvcmFnZS5nZXQoaWQpOwogICAgICBpZiAoIW1lc3NhZ2UpIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6ICJOb3QgRm91bmQiIH07CiAgICAgIHRoaXMuc3RvcmFnZS5kZWxldGUoaWQpOwogICAgICByZXR1cm4geyBvazogdHJ1ZSwgbWVzc2FnZSB9OwogICAgfQogIH07CiAgdmFyIERlZGljYXRlZFdvcmtlck1lc3NhZ2VIdWIgPSBjbGFzcyBleHRlbmRzIEFic3RyYWN0TWVzc2FnZUh1YiB7CiAgICAvLyB3b3JrZXIgLT4gcGFyZW50IHdpbmRvdwogICAgYXN5bmMgX2luaXQoKSB7CiAgICAgIHRoaXMudGFyZ2V0ID0gTWVzc2VuZ2VyRmFjdG9yeS5uZXcoc2VsZik7CiAgICB9CiAgfTsKICB2YXIgV2luZG93TWVzc2FnZUh1YiA9IGNsYXNzIGV4dGVuZHMgQWJzdHJhY3RNZXNzYWdlSHViIHsKICAgIGFzeW5jIF9pbml0U2FtZU9yaWdpbigpIHsKICAgICAgaWYgKCFnbG9iYWxUaGlzLm5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLmNvbnRyb2xsZXIpIHsKICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsKICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5hc3NpZ24od2luZG93LmxvY2F0aW9uLmhyZWYpOwogICAgICAgIH0sIDFlMyk7CiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKCkgPT4gewogICAgICAgIH0pOwogICAgICB9IGVsc2UgewogICAgICAgIHRoaXMudGFyZ2V0ID0gTWVzc2VuZ2VyRmFjdG9yeS5uZXcoZ2xvYmFsVGhpcy5uYXZpZ2F0b3Iuc2VydmljZVdvcmtlcik7CiAgICAgICAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSgibG9hZGVuZCIsIHsgdGFyZ2V0T3JpZ2luOiAiKiIgfSk7CiAgICAgIH0KICAgIH0KICAgIGFzeW5jIF9pbml0Q3Jvc3NPcmlnaW4oKSB7CiAgICAgIGxldCBpZnJhbWVsb2FkID0gZmFsc2U7CiAgICAgIGNvbnN0IGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImlmcmFtZSIpOwogICAgICBjb25zdCBsaXN0ZW5lciA9IChlKSA9PiB7CiAgICAgICAgaWYgKGlzSWZyYW1lKGUub3JpZ2luKSAmJiBlLmRhdGEgPT09ICJsb2FkZW5kIikgewogICAgICAgICAgaWZyYW1lbG9hZCA9IHRydWU7CiAgICAgICAgICB0aGlzLmRpc3BhdGNoKCJpZnJhbWVsb2FkZW5kIik7CiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsIGxpc3RlbmVyKTsKICAgICAgICB9CiAgICAgIH07CiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJtZXNzYWdlIiwgbGlzdGVuZXIpOwogICAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCJzcmMiLCBNZXNzYWdlSHViQ3Jvc3NPcmlnaW5JZnJhbWVVUkwpOwogICAgICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICJub25lIjsKICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpZnJhbWUpOwogICAgICBpZiAoIWlmcmFtZWxvYWQpIGF3YWl0IHRoaXMud2FpdEZvcigiaWZyYW1lbG9hZGVuZCIpOwogICAgICB0aGlzLnRhcmdldCA9IG5ldyBDcm9zc09yaWdpbldpbmRvd01lc3Nlbmdlcih3aW5kb3csIGlmcmFtZS5jb250ZW50V2luZG93LCBNZXNzYWdlSHViQ3Jvc3NPcmlnaW5JZnJhbWVPcmlnaW4pOwogICAgfQogICAgLy8gd29ya2VyL3dpbmRvdyAtPiB3aW5kb3cgLT4gaWZyYW1lL3NlcnZpY2V3b3JrZXIgLT4gd2luZG93IC0+IHdvcmtlci93aW5kb3cKICAgIGFzeW5jIF9pbml0KCkgewogICAgICBpZiAoaXNJZnJhbWUoKSkgYXdhaXQgdGhpcy5faW5pdFNhbWVPcmlnaW4oKTsKICAgICAgZWxzZSBhd2FpdCB0aGlzLl9pbml0Q3Jvc3NPcmlnaW4oKTsKICAgICAgdGhpcy5hZGRMaXN0ZW4od2luZG93KTsKICAgIH0KICB9OwogIHZhciBNZXNzYWdlSHViID0gY2xhc3MgX01lc3NhZ2VIdWIgewogICAgY29uc3RydWN0b3IoKSB7CiAgICAgIHRoaXMuY2hhbmdlSHViKCk7CiAgICB9CiAgICBjaGFuZ2VIdWIoKSB7CiAgICAgIHN3aXRjaCAoZ2xvYmFsVGhpcy5jb25zdHJ1Y3RvcikgewogICAgICAgIGNhc2UgZ2xvYmFsVGhpcy5TZXJ2aWNlV29ya2VyR2xvYmFsU2NvcGU6CiAgICAgICAgICB0aGlzLmh1YiA9IG5ldyBTZXJ2aWNlV29ya2VyTWVzc2FnZUh1YigpOwogICAgICAgICAgYnJlYWs7CiAgICAgICAgY2FzZSBnbG9iYWxUaGlzLldpbmRvdzoKICAgICAgICAgIHRoaXMuaHViID0gbmV3IFdpbmRvd01lc3NhZ2VIdWIoKTsKICAgICAgICAgIGJyZWFrOwogICAgICAgIGNhc2UgZ2xvYmFsVGhpcy5EZWRpY2F0ZWRXb3JrZXJHbG9iYWxTY29wZToKICAgICAgICAgIHRoaXMuaHViID0gbmV3IERlZGljYXRlZFdvcmtlck1lc3NhZ2VIdWIoKTsKICAgICAgICAgIGJyZWFrOwogICAgICAgIGRlZmF1bHQ6CiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIk1lc3NhZ2VIdWJDb25zdHJ1Y3RFcnJvcjogQ2Fubm90IGNyZWF0ZSBNZXNzYWdlSHViIGluc3RhbmNlIGluIHRoaXMgc2NvcGUuIik7CiAgICAgIH0KICAgIH0KICAgIHN0YXRpYyBpbml0KCkgewogICAgICBpZiAoIV9NZXNzYWdlSHViLl9pbnN0YW5jZSkgX01lc3NhZ2VIdWIuX2luc3RhbmNlID0gbmV3IF9NZXNzYWdlSHViKCk7CiAgICB9CiAgICBzdGF0aWMgZ2V0IGluc3RhbmNlKCkgewogICAgICB0aGlzLmluaXQoKTsKICAgICAgcmV0dXJuIF9NZXNzYWdlSHViLl9pbnN0YW5jZTsKICAgIH0KICAgIHN0YXRpYyBhc3luYyBzdG9yZShtZXNzYWdlKSB7CiAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlLmh1Yi5zdG9yZShtZXNzYWdlKTsKICAgIH0KICAgIHN0YXRpYyBhc3luYyBmZXRjaChpZCkgewogICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZS5odWIuZmV0Y2goaWQpOwogICAgfQogICAgc3RhdGljIGFzeW5jIGFkZExpc3RlbihsaXN0ZW5Gcm9tKSB7CiAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlLmh1Yi5hZGRMaXN0ZW4obGlzdGVuRnJvbSk7CiAgICB9CiAgfTsKICB2YXIgTWVzc2VuZ2VyRmFjdG9yeSA9IGNsYXNzIHsKICAgIGNvbnN0cnVjdG9yKCkgewogICAgfQogICAgc3RhdGljIG5ldyhvcHRpb24pIHsKICAgICAgaWYgKCFvcHRpb24pIHRocm93IG5ldyBFcnJvcigiTWVzc2VuZ2VyRmFjdG9yeU5vT3B0aW9uRXJyb3I6IENhbm5vdCBjcmVhdGUgTWVzc2VuZ2VyLCBhcmd1bWVudCAnb3B0aW9uJyBpcyBub3QgcHJvdmlkZWQiKTsKICAgICAgbGV0IHNlbmQ7CiAgICAgIGxldCBsaXN0ZW47CiAgICAgIHN3aXRjaCAob3B0aW9uLmNvbnN0cnVjdG9yKSB7CiAgICAgICAgY2FzZSBnbG9iYWxUaGlzLlNlcnZpY2VXb3JrZXI6IHsKICAgICAgICAgIGxpc3RlbiA9IHdpbmRvdy5uYXZpZ2F0b3Iuc2VydmljZVdvcmtlcjsKICAgICAgICAgIHNlbmQgPSBvcHRpb247CiAgICAgICAgICBicmVhazsKICAgICAgICB9CiAgICAgICAgY2FzZSBnbG9iYWxUaGlzLlNlcnZpY2VXb3JrZXJDb250YWluZXI6IHsKICAgICAgICAgIGxpc3RlbiA9IG9wdGlvbjsKICAgICAgICAgIHNlbmQgPSBvcHRpb24uY29udHJvbGxlcjsKICAgICAgICAgIGJyZWFrOwogICAgICAgIH0KICAgICAgICBjYXNlIGdsb2JhbFRoaXMuU2VydmljZVdvcmtlckdsb2JhbFNjb3BlOiB7CiAgICAgICAgICBsaXN0ZW4gPSBvcHRpb247CiAgICAgICAgICBzZW5kID0gdm9pZCAwOwogICAgICAgICAgYnJlYWs7CiAgICAgICAgfQogICAgICAgIGNhc2UgZ2xvYmFsVGhpcy5Xb3JrZXI6IHsKICAgICAgICAgIGxpc3RlbiA9IHNlbmQgPSBvcHRpb247CiAgICAgICAgICBNZXNzYWdlSHViLmFkZExpc3RlbihvcHRpb24pOwogICAgICAgICAgYnJlYWs7CiAgICAgICAgfQogICAgICAgIGNhc2UgZ2xvYmFsVGhpcy5EZWRpY2F0ZWRXb3JrZXJHbG9iYWxTY29wZTogewogICAgICAgICAgbGlzdGVuID0gc2VuZCA9IG9wdGlvbjsKICAgICAgICAgIGJyZWFrOwogICAgICAgIH0KICAgICAgICBjYXNlIGdsb2JhbFRoaXMuV2luZG93OiB7CiAgICAgICAgICBjb25zdCB0YXJnZXRXaW5kb3cgPSBvcHRpb247CiAgICAgICAgICBsaXN0ZW4gPSB3aW5kb3c7CiAgICAgICAgICBzZW5kID0gdGFyZ2V0V2luZG93OwogICAgICAgICAgYnJlYWs7CiAgICAgICAgfQogICAgICAgIGNhc2UgZ2xvYmFsVGhpcy5DbGllbnQ6IHsKICAgICAgICAgIGxpc3RlbiA9IHNlbGY7CiAgICAgICAgICBzZW5kID0gb3B0aW9uOwogICAgICAgICAgYnJlYWs7CiAgICAgICAgfQogICAgICAgIGNhc2UgZ2xvYmFsVGhpcy5Ccm9hZGNhc3RDaGFubmVsOiB7CiAgICAgICAgICBjb25zdCBuYW1lID0gb3B0aW9uLm5hbWU7CiAgICAgICAgICByZXR1cm4gbmV3IEJyb2FkY2FzdENoYW5uZWxNZXNzZW5nZXIobmV3IEJyb2FkY2FzdENoYW5uZWwobmFtZSksIG5ldyBCcm9hZGNhc3RDaGFubmVsKG5hbWUpKTsKICAgICAgICB9CiAgICAgICAgY2FzZSBnbG9iYWxUaGlzLk1lc3NhZ2VQb3J0OiB7CiAgICAgICAgICBsaXN0ZW4gPSBzZW5kID0gb3B0aW9uOwogICAgICAgICAgYnJlYWs7CiAgICAgICAgfQogICAgICB9CiAgICAgIGlmIChsaXN0ZW4pIHsKICAgICAgICByZXR1cm4gbmV3IE1lc3NlbmdlcihsaXN0ZW4sIHNlbmQpOwogICAgICB9IGVsc2UgewogICAgICAgIHRocm93IG5ldyBFcnJvcigiTWVzc2VuZ2VyRmFjdG9yeUVycm9yOiBDYW5ub3QgY3JlYXRlIE1lc3NlbmdlciwgYXJndW1lbnRzIG5vdCBzdXBwb3J0ZWQiKTsKICAgICAgfQogICAgfQogIH07CiAgTWVzc2FnZUh1Yi5pbml0KCk7CiAgdmFyIEV2ZW50VGFyZ2V0MiQxID0gY2xhc3MgRXZlbnRUYXJnZXQyIGV4dGVuZHMgRXZlbnRUYXJnZXQgewogICAgY29uc3RydWN0b3IoKSB7CiAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7CiAgICAgIHRoaXMubGlzdGVuZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgICAgdGhpcy5fYnViYmxlTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICAgICAgdGhpcy5hdG9taWNRdWV1ZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICB9CiAgICBhc3luYyB3YWl0Rm9yKHR5cGUsIGNvbXBhcmVWYWx1ZSkgewogICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHsKICAgICAgICBpZiAoY29tcGFyZVZhbHVlICE9PSB2b2lkIDApIHsKICAgICAgICAgIHRoaXMubGlzdGVuT25jZU9ubHkodHlwZSwgKGUpID0+IHJlc29sdmUoZS5kZXRhaWwpLCAoZSkgPT4gZS5kZXRhaWwgPT09IGNvbXBhcmVWYWx1ZSk7CiAgICAgICAgfSBlbHNlIHsKICAgICAgICAgIHRoaXMubGlzdGVuT25jZSh0eXBlLCAoZSkgPT4gcmVzb2x2ZShlLmRldGFpbCkpOwogICAgICAgIH0KICAgICAgfSk7CiAgICB9CiAgICBjYWxsYmFjayh0eXBlLCBjYWxsYmFjaykgewogICAgICB0aGlzLndhaXRGb3IodHlwZSkudGhlbihjYWxsYmFjayk7CiAgICB9CiAgICBkaXNwYXRjaCh0eXBlLCBkZXRhaWwpIHsKICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCh0eXBlLCBkZXRhaWwgIT09IHZvaWQgMCA/IHsgZGV0YWlsIH0gOiB2b2lkIDApKTsKICAgIH0KICAgIGxpc3Rlbih0eXBlLCBjYWxsYmFjaywgb3B0aW9ucykgewogICAgICBpZiAoIXRoaXMubGlzdGVuZXJzLmhhcyh0eXBlKSkgdGhpcy5saXN0ZW5lcnMuc2V0KHR5cGUsIC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCkpOwogICAgICB0aGlzLmxpc3RlbmVycy5nZXQodHlwZSkuYWRkKGNhbGxiYWNrKTsKICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zKTsKICAgIH0KICAgIHJlbW92ZSh0eXBlLCBjYWxsYmFjaywgb3B0aW9ucykgewogICAgICBpZiAoIXRoaXMubGlzdGVuZXJzLmhhcyh0eXBlKSkgdGhpcy5saXN0ZW5lcnMuc2V0KHR5cGUsIC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCkpOwogICAgICB0aGlzLmxpc3RlbmVycy5nZXQodHlwZSkuZGVsZXRlKGNhbGxiYWNrKTsKICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zKTsKICAgIH0KICAgIGRlc3Ryb3koKSB7CiAgICAgIGZvciAobGV0IHR5cGUgb2YgdGhpcy5saXN0ZW5lcnMua2V5cygpKSB7CiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5saXN0ZW5lcnMuZ2V0KHR5cGUpKSB7CiAgICAgICAgICB0aGlzLnJlbW92ZSh0eXBlLCBjYWxsYmFjayk7CiAgICAgICAgfQogICAgICB9CiAgICB9CiAgICBsaXN0ZW5PbmNlKHR5cGUsIGNhbGxiYWNrKSB7CiAgICAgIHRoaXMubGlzdGVuKHR5cGUsIGNhbGxiYWNrLCB7IG9uY2U6IHRydWUgfSk7CiAgICB9CiAgICBsaXN0ZW5PbmNlT25seSh0eXBlLCBjYWxsYmFjaywgb25seSkgewogICAgICBjb25zdCB3cmFwcGVyID0gKGUpID0+IHsKICAgICAgICBpZiAob25seShlKSkgewogICAgICAgICAgdGhpcy5yZW1vdmUodHlwZSwgd3JhcHBlcik7CiAgICAgICAgICBjYWxsYmFjayhlKTsKICAgICAgICB9CiAgICAgIH07CiAgICAgIHRoaXMubGlzdGVuKHR5cGUsIHdyYXBwZXIpOwogICAgfQogICAgbGlzdGVuRGVib3VuY2UodHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMgPSB7IHRpbWVvdXQ6IDEwMCwgbW9kZTogImxhc3QiIH0pIHsKICAgICAgc3dpdGNoIChvcHRpb25zLm1vZGUpIHsKICAgICAgICBjYXNlICJmaXJzdCI6CiAgICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5EZWJvdW5jZUZpcnN0KHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zKTsKICAgICAgICBjYXNlICJsYXN0IjoKICAgICAgICAgIHJldHVybiB0aGlzLmxpc3RlbkRlYm91bmNlTGFzdCh0eXBlLCBjYWxsYmFjaywgb3B0aW9ucyk7CiAgICAgIH0KICAgIH0KICAgIGxpc3RlbkRlYm91bmNlRmlyc3QodHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMgPSB7IHRpbWVvdXQ6IDEwMCB9KSB7CiAgICAgIGxldCBsYXN0TXMgPSAwOwogICAgICB0aGlzLmxpc3RlbigKICAgICAgICB0eXBlLAogICAgICAgIChlKSA9PiB7CiAgICAgICAgICBjb25zdCBjdXJyZW50TXMgPSBEYXRlLm5vdygpOwogICAgICAgICAgaWYgKGN1cnJlbnRNcyAtIGxhc3RNcyA+IG9wdGlvbnMudGltZW91dCkgewogICAgICAgICAgICBjYWxsYmFjayhlKTsKICAgICAgICAgIH0KICAgICAgICAgIGxhc3RNcyA9IGN1cnJlbnRNczsKICAgICAgICB9LAogICAgICAgIG9wdGlvbnMKICAgICAgKTsKICAgIH0KICAgIGxpc3RlbkRlYm91bmNlTGFzdCh0eXBlLCBjYWxsYmFjaywgb3B0aW9ucyA9IHsgdGltZW91dDogMTAwIH0pIHsKICAgICAgbGV0IHRpbW91dEluc3RhbmNlOwogICAgICB0aGlzLmxpc3RlbigKICAgICAgICB0eXBlLAogICAgICAgIChlKSA9PiB7CiAgICAgICAgICBjbGVhclRpbWVvdXQodGltb3V0SW5zdGFuY2UpOwogICAgICAgICAgdGltb3V0SW5zdGFuY2UgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBjYWxsYmFjayhlKSwgb3B0aW9ucy50aW1lb3V0KTsKICAgICAgICB9LAogICAgICAgIG9wdGlvbnMKICAgICAgKTsKICAgIH0KICAgIGVuYWJsZUJ1YmJsZSh0eXBlKSB7CiAgICAgIGlmICh0aGlzLl9idWJibGVNYXAuaGFzKHR5cGUpKSByZXR1cm47CiAgICAgIGNvbnN0IGRpc3BhdGNoZXIgPSAoZSkgPT4gewogICAgICAgIHZhciBfYTsKICAgICAgICAoX2EgPSB0aGlzLnBhcmVudCkgPT0gbnVsbCA/IHZvaWQgMCA6IF9hLmRpc3BhdGNoKGUudHlwZSwgZS5kZXRhaWwpOwogICAgICB9OwogICAgICB0aGlzLmxpc3Rlbih0eXBlLCBkaXNwYXRjaGVyKTsKICAgICAgdGhpcy5fYnViYmxlTWFwLnNldCh0eXBlLCBkaXNwYXRjaGVyKTsKICAgIH0KICAgIGRpc2FibGVCdWJibGUodHlwZSkgewogICAgICBpZiAoIXRoaXMuX2J1YmJsZU1hcC5oYXModHlwZSkpIHJldHVybjsKICAgICAgY29uc3QgZGlzcGF0Y2hlciA9IHRoaXMuX2J1YmJsZU1hcC5nZXQodHlwZSk7CiAgICAgIHRoaXMucmVtb3ZlKHR5cGUsIGRpc3BhdGNoZXIpOwogICAgICB0aGlzLl9idWJibGVNYXAuZGVsZXRlKHR5cGUpOwogICAgfQogICAgX2F0b21pY0luaXQodHlwZSkgewogICAgICB0aGlzLmF0b21pY1F1ZXVlLnNldCh0eXBlLCBbXSk7CiAgICAgIGNvbnN0IGF0b21pY0xvb3AgPSBhc3luYyAoKSA9PiB7CiAgICAgICAgY29uc3QgcXVldWUgPSB0aGlzLmF0b21pY1F1ZXVlLmdldCh0eXBlKTsKICAgICAgICB3aGlsZSAodHJ1ZSkgewogICAgICAgICAgY29uc3QgdGFzayA9IHF1ZXVlLnNoaWZ0KCk7CiAgICAgICAgICBpZiAodGFzaykgewogICAgICAgICAgICBhd2FpdCB0YXNrKCk7CiAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICBhd2FpdCB0aGlzLndhaXRGb3IoIl9fYXRvbWljLWFkZCIsIHR5cGUpOwogICAgICAgICAgfQogICAgICAgIH0KICAgICAgfTsKICAgICAgYXRvbWljTG9vcCgpOwogICAgfQogICAgYXRvbWljKHR5cGUsIGZ1bmMpIHsKICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7CiAgICAgICAgY29uc3Qgd3JhcCA9IGFzeW5jICgpID0+IHJlc29sdmUoYXdhaXQgZnVuYygpKTsKICAgICAgICBpZiAoIXRoaXMuYXRvbWljUXVldWUuaGFzKHR5cGUpKSB0aGlzLl9hdG9taWNJbml0KHR5cGUpOwogICAgICAgIHRoaXMuYXRvbWljUXVldWUuZ2V0KHR5cGUpLnB1c2god3JhcCk7CiAgICAgICAgdGhpcy5kaXNwYXRjaCgiX19hdG9taWMtYWRkIiwgdHlwZSk7CiAgICAgIH0pOwogICAgfQogIH07CiAgYXN5bmMgZnVuY3Rpb24gc2xlZXAkMShtcykgewogICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7CiAgICAgIHNldFRpbWVvdXQoKCkgPT4gewogICAgICAgIHJlc29sdmUoKTsKICAgICAgfSwgbXMpOwogICAgfSk7CiAgfQogIGZ1bmN0aW9uIHBhdGgyYXJyYXkocGF0aCkgewogICAgcmV0dXJuIHBhdGguc3BsaXQoIi8iKS5maWx0ZXIoQm9vbGVhbik7CiAgfQogIHZhciBFdmVudFRhcmdldDIgPSBjbGFzcyBleHRlbmRzIEV2ZW50VGFyZ2V0IHsKICAgIGNvbnN0cnVjdG9yKCkgewogICAgICBzdXBlciguLi5hcmd1bWVudHMpOwogICAgICB0aGlzLmxpc3RlbmVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICAgIHRoaXMuX2J1YmJsZU1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgICAgIHRoaXMuYXRvbWljUXVldWUgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpOwogICAgfQogICAgYXN5bmMgd2FpdEZvcih0eXBlLCBjb21wYXJlVmFsdWUpIHsKICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7CiAgICAgICAgaWYgKGNvbXBhcmVWYWx1ZSAhPT0gdm9pZCAwKSB7CiAgICAgICAgICB0aGlzLmxpc3Rlbk9uY2VPbmx5KHR5cGUsIChlKSA9PiByZXNvbHZlKGUuZGV0YWlsKSwgKGUpID0+IGUuZGV0YWlsID09PSBjb21wYXJlVmFsdWUpOwogICAgICAgIH0gZWxzZSB7CiAgICAgICAgICB0aGlzLmxpc3Rlbk9uY2UodHlwZSwgKGUpID0+IHJlc29sdmUoZS5kZXRhaWwpKTsKICAgICAgICB9CiAgICAgIH0pOwogICAgfQogICAgY2FsbGJhY2sodHlwZSwgY2FsbGJhY2spIHsKICAgICAgdGhpcy53YWl0Rm9yKHR5cGUpLnRoZW4oY2FsbGJhY2spOwogICAgfQogICAgZGlzcGF0Y2godHlwZSwgZGV0YWlsKSB7CiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQodHlwZSwgZGV0YWlsICE9PSB2b2lkIDAgPyB7IGRldGFpbCB9IDogdm9pZCAwKSk7CiAgICB9CiAgICBsaXN0ZW4odHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMpIHsKICAgICAgaWYgKCF0aGlzLmxpc3RlbmVycy5oYXModHlwZSkpIHRoaXMubGlzdGVuZXJzLnNldCh0eXBlLCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKTsKICAgICAgdGhpcy5saXN0ZW5lcnMuZ2V0KHR5cGUpLmFkZChjYWxsYmFjayk7CiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaywgb3B0aW9ucyk7CiAgICB9CiAgICByZW1vdmUodHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMpIHsKICAgICAgaWYgKCF0aGlzLmxpc3RlbmVycy5oYXModHlwZSkpIHRoaXMubGlzdGVuZXJzLnNldCh0eXBlLCAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKTsKICAgICAgdGhpcy5saXN0ZW5lcnMuZ2V0KHR5cGUpLmRlbGV0ZShjYWxsYmFjayk7CiAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaywgb3B0aW9ucyk7CiAgICB9CiAgICBkZXN0cm95KCkgewogICAgICBmb3IgKGxldCB0eXBlIG9mIHRoaXMubGlzdGVuZXJzLmtleXMoKSkgewogICAgICAgIGZvciAobGV0IGNhbGxiYWNrIG9mIHRoaXMubGlzdGVuZXJzLmdldCh0eXBlKSkgewogICAgICAgICAgdGhpcy5yZW1vdmUodHlwZSwgY2FsbGJhY2spOwogICAgICAgIH0KICAgICAgfQogICAgfQogICAgbGlzdGVuT25jZSh0eXBlLCBjYWxsYmFjaykgewogICAgICB0aGlzLmxpc3Rlbih0eXBlLCBjYWxsYmFjaywgeyBvbmNlOiB0cnVlIH0pOwogICAgfQogICAgbGlzdGVuT25jZU9ubHkodHlwZSwgY2FsbGJhY2ssIG9ubHkpIHsKICAgICAgY29uc3Qgd3JhcHBlciA9IChlKSA9PiB7CiAgICAgICAgaWYgKG9ubHkoZSkpIHsKICAgICAgICAgIHRoaXMucmVtb3ZlKHR5cGUsIHdyYXBwZXIpOwogICAgICAgICAgY2FsbGJhY2soZSk7CiAgICAgICAgfQogICAgICB9OwogICAgICB0aGlzLmxpc3Rlbih0eXBlLCB3cmFwcGVyKTsKICAgIH0KICAgIGxpc3RlbkRlYm91bmNlKHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zID0geyB0aW1lb3V0OiAxMDAsIG1vZGU6ICJsYXN0IiB9KSB7CiAgICAgIHN3aXRjaCAob3B0aW9ucy5tb2RlKSB7CiAgICAgICAgY2FzZSAiZmlyc3QiOgogICAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuRGVib3VuY2VGaXJzdCh0eXBlLCBjYWxsYmFjaywgb3B0aW9ucyk7CiAgICAgICAgY2FzZSAibGFzdCI6CiAgICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5EZWJvdW5jZUxhc3QodHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMpOwogICAgICB9CiAgICB9CiAgICBsaXN0ZW5EZWJvdW5jZUZpcnN0KHR5cGUsIGNhbGxiYWNrLCBvcHRpb25zID0geyB0aW1lb3V0OiAxMDAgfSkgewogICAgICBsZXQgbGFzdE1zID0gMDsKICAgICAgdGhpcy5saXN0ZW4oCiAgICAgICAgdHlwZSwKICAgICAgICAoZSkgPT4gewogICAgICAgICAgY29uc3QgY3VycmVudE1zID0gRGF0ZS5ub3coKTsKICAgICAgICAgIGlmIChjdXJyZW50TXMgLSBsYXN0TXMgPiBvcHRpb25zLnRpbWVvdXQpIHsKICAgICAgICAgICAgY2FsbGJhY2soZSk7CiAgICAgICAgICB9CiAgICAgICAgICBsYXN0TXMgPSBjdXJyZW50TXM7CiAgICAgICAgfSwKICAgICAgICBvcHRpb25zCiAgICAgICk7CiAgICB9CiAgICBsaXN0ZW5EZWJvdW5jZUxhc3QodHlwZSwgY2FsbGJhY2ssIG9wdGlvbnMgPSB7IHRpbWVvdXQ6IDEwMCB9KSB7CiAgICAgIGxldCB0aW1vdXRJbnN0YW5jZTsKICAgICAgdGhpcy5saXN0ZW4oCiAgICAgICAgdHlwZSwKICAgICAgICAoZSkgPT4gewogICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbW91dEluc3RhbmNlKTsKICAgICAgICAgIHRpbW91dEluc3RhbmNlID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4gY2FsbGJhY2soZSksIG9wdGlvbnMudGltZW91dCk7CiAgICAgICAgfSwKICAgICAgICBvcHRpb25zCiAgICAgICk7CiAgICB9CiAgICBlbmFibGVCdWJibGUodHlwZSkgewogICAgICBpZiAodGhpcy5fYnViYmxlTWFwLmhhcyh0eXBlKSkgcmV0dXJuOwogICAgICBjb25zdCBkaXNwYXRjaGVyID0gKGUpID0+IHsKICAgICAgICB2YXIgX2E7CiAgICAgICAgKF9hID0gdGhpcy5wYXJlbnQpID09IG51bGwgPyB2b2lkIDAgOiBfYS5kaXNwYXRjaChlLnR5cGUsIGUuZGV0YWlsKTsKICAgICAgfTsKICAgICAgdGhpcy5saXN0ZW4odHlwZSwgZGlzcGF0Y2hlcik7CiAgICAgIHRoaXMuX2J1YmJsZU1hcC5zZXQodHlwZSwgZGlzcGF0Y2hlcik7CiAgICB9CiAgICBkaXNhYmxlQnViYmxlKHR5cGUpIHsKICAgICAgaWYgKCF0aGlzLl9idWJibGVNYXAuaGFzKHR5cGUpKSByZXR1cm47CiAgICAgIGNvbnN0IGRpc3BhdGNoZXIgPSB0aGlzLl9idWJibGVNYXAuZ2V0KHR5cGUpOwogICAgICB0aGlzLnJlbW92ZSh0eXBlLCBkaXNwYXRjaGVyKTsKICAgICAgdGhpcy5fYnViYmxlTWFwLmRlbGV0ZSh0eXBlKTsKICAgIH0KICAgIF9hdG9taWNJbml0KHR5cGUpIHsKICAgICAgdGhpcy5hdG9taWNRdWV1ZS5zZXQodHlwZSwgW10pOwogICAgICBjb25zdCBhdG9taWNMb29wID0gYXN5bmMgKCkgPT4gewogICAgICAgIGNvbnN0IHF1ZXVlID0gdGhpcy5hdG9taWNRdWV1ZS5nZXQodHlwZSk7CiAgICAgICAgd2hpbGUgKHRydWUpIHsKICAgICAgICAgIGNvbnN0IHRhc2sgPSBxdWV1ZS5zaGlmdCgpOwogICAgICAgICAgaWYgKHRhc2spIHsKICAgICAgICAgICAgYXdhaXQgdGFzaygpOwogICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgYXdhaXQgdGhpcy53YWl0Rm9yKCJfX2F0b21pYy1hZGQiLCB0eXBlKTsKICAgICAgICAgIH0KICAgICAgICB9CiAgICAgIH07CiAgICAgIGF0b21pY0xvb3AoKTsKICAgIH0KICAgIGF0b21pYyh0eXBlLCBmdW5jKSB7CiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gewogICAgICAgIGNvbnN0IHdyYXAgPSBhc3luYyAoKSA9PiByZXNvbHZlKGF3YWl0IGZ1bmMoKSk7CiAgICAgICAgaWYgKCF0aGlzLmF0b21pY1F1ZXVlLmhhcyh0eXBlKSkgdGhpcy5fYXRvbWljSW5pdCh0eXBlKTsKICAgICAgICB0aGlzLmF0b21pY1F1ZXVlLmdldCh0eXBlKS5wdXNoKHdyYXApOwogICAgICAgIHRoaXMuZGlzcGF0Y2goIl9fYXRvbWljLWFkZCIsIHR5cGUpOwogICAgICB9KTsKICAgIH0KICB9OwogIGFzeW5jIGZ1bmN0aW9uIHNsZWVwKG1zKSB7CiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTsKICB9CiAgZnVuY3Rpb24gbm9vcCguLi5fKSB7CiAgfQogIHZhciBBYnN0cmFjdFN3aXRjaGFibGVTdHJlYW0gPSBjbGFzcyBleHRlbmRzIEV2ZW50VGFyZ2V0MiB7CiAgICAvLyB0byBpZGVudGlmeSBpbnRlbmRlZCBhYm9ydAogICAgY29uc3RydWN0b3IoZ2VuZXJhdG9yLCBjb250ZXh0KSB7CiAgICAgIHN1cGVyKCk7CiAgICAgIHRoaXMuZ2VuZXJhdG9yID0gZ2VuZXJhdG9yOwogICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0OwogICAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7CiAgICAgIHRoaXMuYWJvcnRSZWFzb24gPSAiU3dpdGNoYWJsZVN0cmVhbUFib3J0Rm9yU3dpdGNoaW5nIjsKICAgICAgdGhpcy5pc1N3aXRjaGluZyA9IGZhbHNlOwogICAgfQogICAgc3dpdGNoKHRvKSB7CiAgICAgIGxldCBnZW5lcmF0b3I7CiAgICAgIGlmICghdG8pIHsKICAgICAgICBpZiAodGhpcy5pc1N3aXRjaGluZykgcmV0dXJuOwogICAgICAgIGlmICh0aGlzLmdlbmVyYXRvcikgZ2VuZXJhdG9yID0gdGhpcy5nZW5lcmF0b3I7CiAgICAgICAgZWxzZSByZXR1cm47CiAgICAgIH0KICAgICAgcmV0dXJuIHRoaXMuYXRvbWljKCJzd2l0Y2giLCBhc3luYyAoKSA9PiB7CiAgICAgICAgdGhpcy5pc1N3aXRjaGluZyA9IHRydWU7CiAgICAgICAgYXdhaXQgdGhpcy5hYm9ydCgpOwogICAgICAgIHRoaXMuY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTsKICAgICAgICBpZiAoIXRvKSB0byA9IGF3YWl0IGdlbmVyYXRvcih0aGlzLmNvbnRleHQsIHRoaXMuY29udHJvbGxlci5zaWduYWwpOwogICAgICAgIGNvbnN0IHsgcmVhZGFibGUsIHdyaXRhYmxlIH0gPSB0aGlzLnRhcmdldCh0bywgdGhpcy5jb250cm9sbGVyLnNpZ25hbCk7CiAgICAgICAgZm9yIChsZXQgaSA9IDA7IHJlYWRhYmxlLmxvY2tlZCB8fCB3cml0YWJsZS5sb2NrZWQ7IGkgKz0gMTApIGF3YWl0IHNsZWVwKGkpOwogICAgICAgIHJlYWRhYmxlLnBpcGVUbyh3cml0YWJsZSwgeyBwcmV2ZW50QWJvcnQ6IHRydWUsIHByZXZlbnRDYW5jZWw6IHRydWUsIHByZXZlbnRDbG9zZTogdHJ1ZSwgc2lnbmFsOiB0aGlzLmNvbnRyb2xsZXIuc2lnbmFsIH0pLnRoZW4oKCkgPT4gewogICAgICAgICAgaWYgKHdyaXRhYmxlLmxvY2tlZCkgd3JpdGFibGUuY2xvc2UoKTsKICAgICAgICB9KS5jYXRjaCgoZSkgPT4gewogICAgICAgICAgaWYgKGUgIT09IHRoaXMuYWJvcnRSZWFzb24pIHRoaXMuc3dpdGNoKCk7CiAgICAgICAgfSk7CiAgICAgICAgdGhpcy5pc1N3aXRjaGluZyA9IGZhbHNlOwogICAgICAgIHRoaXMuZGlzcGF0Y2goInN3aXRjaC1kb25lIik7CiAgICAgIH0pOwogICAgfQogICAgYXN5bmMgYWJvcnQoKSB7CiAgICAgIHRoaXMuY29udHJvbGxlci5hYm9ydCh0aGlzLmFib3J0UmVhc29uKTsKICAgICAgZm9yIChsZXQgaSA9IDA7IHRoaXMubG9ja2VkOyBpICs9IDEwKSB7CiAgICAgICAgYXdhaXQgc2xlZXAoaSk7CiAgICAgIH0KICAgIH0KICB9OwogIHZhciBTd2l0Y2hhYmxlUmVhZGFibGVTdHJlYW0gPSBjbGFzcyBleHRlbmRzIEFic3RyYWN0U3dpdGNoYWJsZVN0cmVhbSB7CiAgICBjb25zdHJ1Y3RvcihnZW5lcmF0b3IsIGNvbnRleHQpIHsKICAgICAgc3VwZXIoKTsKICAgICAgdGhpcy5nZW5lcmF0b3IgPSBnZW5lcmF0b3I7CiAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7CiAgICAgIGNvbnN0IF90aGlzID0gdGhpczsKICAgICAgY29uc3QgeyByZWFkYWJsZSwgd3JpdGFibGUgfSA9IG5ldyBUcmFuc2Zvcm1TdHJlYW0oewogICAgICAgIGFzeW5jIHRyYW5zZm9ybShjaHVuaywgY29udHJvbGxlcikgewogICAgICAgICAgaWYgKF90aGlzLmlzU3dpdGNoaW5nKSBhd2FpdCBfdGhpcy53YWl0Rm9yKCJzd2l0Y2gtZG9uZSIpOwogICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGNodW5rKTsKICAgICAgICB9CiAgICAgIH0pOwogICAgICB0aGlzLnN0cmVhbSA9IHJlYWRhYmxlOwogICAgICBjb25zdCBidWZmZXIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKCk7CiAgICAgIHRoaXMud3JpdGFibGUgPSBidWZmZXIud3JpdGFibGU7CiAgICAgIGJ1ZmZlci5yZWFkYWJsZS5waXBlVG8od3JpdGFibGUpOwogICAgICBpZiAoZ2VuZXJhdG9yKSB0aGlzLnN3aXRjaCgpOwogICAgfQogICAgdGFyZ2V0KHRvLCBzaWduYWwpIHsKICAgICAgY29uc3QgeyByZWFkYWJsZSwgd3JpdGFibGUgfSA9IG5ldyBUcmFuc2Zvcm1TdHJlYW0oKTsKICAgICAgcmVhZGFibGUucGlwZVRvKHRoaXMud3JpdGFibGUsIHsgcHJldmVudENhbmNlbDogdHJ1ZSwgcHJldmVudEFib3J0OiB0cnVlLCBzaWduYWwgfSkuY2F0Y2gobm9vcCk7CiAgICAgIHJldHVybiB7CiAgICAgICAgcmVhZGFibGU6IHRvLAogICAgICAgIHdyaXRhYmxlCiAgICAgIH07CiAgICB9CiAgICBnZXQgbG9ja2VkKCkgewogICAgICByZXR1cm4gdGhpcy53cml0YWJsZS5sb2NrZWQ7CiAgICB9CiAgfTsKICB2YXIgU3dpdGNoYWJsZVdyaXRhYmxlU3RyZWFtID0gY2xhc3MgZXh0ZW5kcyBBYnN0cmFjdFN3aXRjaGFibGVTdHJlYW0gewogICAgY29uc3RydWN0b3IoZ2VuZXJhdG9yLCBjb250ZXh0KSB7CiAgICAgIHN1cGVyKCk7CiAgICAgIHRoaXMuZ2VuZXJhdG9yID0gZ2VuZXJhdG9yOwogICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0OwogICAgICBjb25zdCBfdGhpcyA9IHRoaXM7CiAgICAgIGNvbnN0IHsgcmVhZGFibGUsIHdyaXRhYmxlIH0gPSBuZXcgVHJhbnNmb3JtU3RyZWFtKHsKICAgICAgICBhc3luYyB0cmFuc2Zvcm0oY2h1bmssIGNvbnRyb2xsZXIpIHsKICAgICAgICAgIGlmIChfdGhpcy5pc1N3aXRjaGluZykgYXdhaXQgX3RoaXMud2FpdEZvcigic3dpdGNoLWRvbmUiKTsKICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjaHVuayk7CiAgICAgICAgfQogICAgICB9KTsKICAgICAgdGhpcy5zdHJlYW0gPSB3cml0YWJsZTsKICAgICAgdGhpcy5yZWFkYWJsZSA9IHJlYWRhYmxlOwogICAgICBpZiAoZ2VuZXJhdG9yKSB0aGlzLnN3aXRjaCgpOwogICAgfQogICAgdGFyZ2V0KHRvLCBzaWduYWwpIHsKICAgICAgY29uc3QgeyByZWFkYWJsZSwgd3JpdGFibGUgfSA9IG5ldyBUcmFuc2Zvcm1TdHJlYW0oKTsKICAgICAgdGhpcy5yZWFkYWJsZS5waXBlVG8od3JpdGFibGUsIHsgcHJldmVudENhbmNlbDogdHJ1ZSwgcHJldmVudEFib3J0OiB0cnVlLCBzaWduYWwgfSkuY2F0Y2gobm9vcCk7CiAgICAgIHJldHVybiB7CiAgICAgICAgcmVhZGFibGUsCiAgICAgICAgd3JpdGFibGU6IHRvCiAgICAgIH07CiAgICB9CiAgICBnZXQgbG9ja2VkKCkgewogICAgICByZXR1cm4gdGhpcy5yZWFkYWJsZS5sb2NrZWQ7CiAgICB9CiAgfTsKICB2YXIgRHVwbGV4ID0gY2xhc3MgewogICAgY29uc3RydWN0b3IoKSB7CiAgICAgIGNvbnN0IHN0cmVhbUEgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKCk7CiAgICAgIGNvbnN0IHN0cmVhbUIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKCk7CiAgICAgIHRoaXMuZW5kcG9pbnQxID0gbmV3IER1cGxleEVuZHBvaW50KHN0cmVhbUEucmVhZGFibGUsIHN0cmVhbUIud3JpdGFibGUpOwogICAgICB0aGlzLmVuZHBvaW50MiA9IG5ldyBEdXBsZXhFbmRwb2ludChzdHJlYW1CLnJlYWRhYmxlLCBzdHJlYW1BLndyaXRhYmxlKTsKICAgIH0KICB9OwogIHZhciBEdXBsZXhFbmRwb2ludCA9IGNsYXNzIF9EdXBsZXhFbmRwb2ludCBleHRlbmRzIEV2ZW50VGFyZ2V0MiB7CiAgICBjb25zdHJ1Y3RvcihyZWFkYWJsZSwgd3JpdGFibGUpIHsKICAgICAgc3VwZXIoKTsKICAgICAgdGhpcy5yZWFkYWJsZSA9IHJlYWRhYmxlOwogICAgICB0aGlzLndyaXRhYmxlID0gd3JpdGFibGU7CiAgICB9CiAgICAvLyB0cmFuc2ZlciBkdXBsZXggYnkgcG9zdE1lc3NhZ2UKICAgIHN0YXRpYyB0cmFuc2ZlcmlmeShlbmRwb2ludCkgewogICAgICBjb25zdCB7IHJlYWRhYmxlLCB3cml0YWJsZSB9ID0gZW5kcG9pbnQ7CiAgICAgIHJldHVybiB7CiAgICAgICAgZW5kcG9pbnQ6IHsgcmVhZGFibGUsIHdyaXRhYmxlIH0sCiAgICAgICAgdHJhbnNmZXI6IFtyZWFkYWJsZSwgd3JpdGFibGVdCiAgICAgIH07CiAgICB9CiAgICAvLyByZXN0b3JlIGR1cGxleCBmcm9tIHBvc3RNZXNzYWdlCiAgICBzdGF0aWMgaW5zdGFuY2lmeShvYmplY3RpZmllZEVuZHBvaW50KSB7CiAgICAgIHJldHVybiBuZXcgX0R1cGxleEVuZHBvaW50KG9iamVjdGlmaWVkRW5kcG9pbnQucmVhZGFibGUsIG9iamVjdGlmaWVkRW5kcG9pbnQud3JpdGFibGUpOwogICAgfQogIH07CiAgdmFyIFN3aXRjaGFibGVEdXBsZXhFbmRwb2ludCA9IGNsYXNzIGV4dGVuZHMgRHVwbGV4RW5kcG9pbnQgewogICAgY29uc3RydWN0b3IoZ2VuZXJhdG9yLCBjb250ZXh0KSB7CiAgICAgIGNvbnN0IHN3aXRjaGFibGVSZWFkYWJsZSA9IG5ldyBTd2l0Y2hhYmxlUmVhZGFibGVTdHJlYW0oKTsKICAgICAgY29uc3Qgc3dpdGNoYWJsZVdyaXRhYmxlID0gbmV3IFN3aXRjaGFibGVXcml0YWJsZVN0cmVhbSgpOwogICAgICBzdXBlcihzd2l0Y2hhYmxlUmVhZGFibGUuc3RyZWFtLCBzd2l0Y2hhYmxlV3JpdGFibGUuc3RyZWFtKTsKICAgICAgdGhpcy5nZW5lcmF0b3IgPSBnZW5lcmF0b3I7CiAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7CiAgICAgIHRoaXMuaXNTd2l0Y2hpbmcgPSBmYWxzZTsKICAgICAgdGhpcy5zd2l0Y2hhYmxlUmVhZGFibGUgPSBzd2l0Y2hhYmxlUmVhZGFibGU7CiAgICAgIHRoaXMuc3dpdGNoYWJsZVdyaXRhYmxlID0gc3dpdGNoYWJsZVdyaXRhYmxlOwogICAgICBpZiAoZ2VuZXJhdG9yKSB0aGlzLnN3aXRjaCgpOwogICAgfQogICAgc3dpdGNoKGVuZHBvaW50KSB7CiAgICAgIGlmICghZW5kcG9pbnQgJiYgdGhpcy5pc1N3aXRjaGluZykgcmV0dXJuOwogICAgICByZXR1cm4gdGhpcy5hdG9taWMoInN3aXRjaCIsIGFzeW5jICgpID0+IHsKICAgICAgICB0aGlzLmlzU3dpdGNoaW5nID0gdHJ1ZTsKICAgICAgICBpZiAoIWVuZHBvaW50ICYmIHRoaXMuZ2VuZXJhdG9yKSBlbmRwb2ludCA9IGF3YWl0IHRoaXMuZ2VuZXJhdG9yKHRoaXMuY29udGV4dCk7CiAgICAgICAgaWYgKCFlbmRwb2ludCkgcmV0dXJuOwogICAgICAgIGNvbnN0IHsgcmVhZGFibGUsIHdyaXRhYmxlIH0gPSBlbmRwb2ludDsKICAgICAgICBhd2FpdCB0aGlzLnN3aXRjaGFibGVXcml0YWJsZS5zd2l0Y2god3JpdGFibGUpOwogICAgICAgIGF3YWl0IHRoaXMuc3dpdGNoYWJsZVJlYWRhYmxlLnN3aXRjaChyZWFkYWJsZSk7CiAgICAgICAgdGhpcy5pc1N3aXRjaGluZyA9IGZhbHNlOwogICAgICB9KTsKICAgIH0KICB9OwogIHZhciBDb250cm9sbGVkV3JpdGFibGVTdHJlYW0gPSBjbGFzcyBleHRlbmRzIEV2ZW50VGFyZ2V0MiB7CiAgICBjb25zdHJ1Y3Rvcihjb25zdW1lciwgZW5kcG9pbnQsIHN0cmF0ZWd5KSB7CiAgICAgIHN1cGVyKCk7CiAgICAgIGxldCB3cml0ZXIgPSB7IGNsb3NlOiBub29wLCBhYm9ydDogbm9vcCB9OwogICAgICBpZiAoY29uc3VtZXIgaW5zdGFuY2VvZiBXcml0YWJsZVN0cmVhbSkgewogICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbnN1bWVyaWZ5KGNvbnN1bWVyKTsKICAgICAgICBjb25zdW1lciA9IHJlc3VsdC5jb25zdW1lcjsKICAgICAgICB3cml0ZXIgPSByZXN1bHQud3JpdGVyOwogICAgICB9CiAgICAgIHRoaXMuZW5kcG9pbnQgPSBlbmRwb2ludCA/IGVuZHBvaW50IDogbmV3IFN3aXRjaGFibGVEdXBsZXhFbmRwb2ludCgpOwogICAgICBjb25zdCBzaWduYWwgPSB0aGlzLmVuZHBvaW50LndyaXRhYmxlLmdldFdyaXRlcigpOwogICAgICBsZXQgY29uc3VtZWQgPSAtMTsKICAgICAgbGV0IGludGVydmFsOwogICAgICBjb25zdCBzdHJlYW0gPSBuZXcgV3JpdGFibGVTdHJlYW0oewogICAgICAgIHN0YXJ0KCkgewogICAgICAgICAgc2lnbmFsLndyaXRlKC0xKTsKICAgICAgICB9LAogICAgICAgIGFzeW5jIHdyaXRlKGJsb2NrKSB7CiAgICAgICAgICBpZiAoaW50ZXJ2YWwpIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpOwogICAgICAgICAgaWYgKGJsb2NrLmlkID4gY29uc3VtZWQpIHsKICAgICAgICAgICAgYXdhaXQgY29uc3VtZXIoYmxvY2suY2h1bmspOwogICAgICAgICAgICBjb25zdW1lZCA9IGJsb2NrLmlkOwogICAgICAgICAgfQogICAgICAgICAgc2lnbmFsLndyaXRlKGJsb2NrLmlkKTsKICAgICAgICAgIGludGVydmFsID0gZ2xvYmFsVGhpcy5zZXRJbnRlcnZhbCgoKSA9PiB7CiAgICAgICAgICAgIHNpZ25hbC53cml0ZShibG9jay5pZCkuY2F0Y2goYXN5bmMgKCkgPT4gewogICAgICAgICAgICAgIGlmIChhd2FpdCBzaWduYWwuY2xvc2VkKSBjbGVhckludGVydmFsKGludGVydmFsKTsKICAgICAgICAgICAgfSk7CiAgICAgICAgICB9LCAxZTMpOwogICAgICAgIH0sCiAgICAgICAgYXN5bmMgY2xvc2UoKSB7CiAgICAgICAgICBpZiAoaW50ZXJ2YWwpIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpOwogICAgICAgICAgc2lnbmFsLmNsb3NlKCk7CiAgICAgICAgICB3cml0ZXIuY2xvc2UoKTsKICAgICAgICB9LAogICAgICAgIGFzeW5jIGFib3J0KHJlYXNvbikgewogICAgICAgICAgaWYgKGludGVydmFsKSBjbGVhckludGVydmFsKGludGVydmFsKTsKICAgICAgICAgIHNpZ25hbC5hYm9ydChyZWFzb24pOwogICAgICAgICAgd3JpdGVyLmFib3J0KHJlYXNvbik7CiAgICAgICAgfQogICAgICB9LCB3cmFwUXVldWluZ1N0cmF0ZWd5KHN0cmF0ZWd5KSk7CiAgICAgIHRoaXMuZW5kcG9pbnQucmVhZGFibGUucGlwZVRvKHN0cmVhbSkudGhlbigoKSA9PiB0aGlzLmRpc3BhdGNoKCJjbG9zZSIpKTsKICAgIH0KICB9OwogIGZ1bmN0aW9uIHdyYXBRdWV1aW5nU3RyYXRlZ3koc3RyYXRlZ3kpIHsKICAgIGlmIChzdHJhdGVneSkgewogICAgICBjb25zdCBzaXplID0gc3RyYXRlZ3kuc2l6ZTsKICAgICAgcmV0dXJuIHsKICAgICAgICBoaWdoV2F0ZXJNYXJrOiBzdHJhdGVneS5oaWdoV2F0ZXJNYXJrLAogICAgICAgIHNpemU6IHNpemUgPyAoYmxvY2spID0+IHNpemUoYmxvY2suY2h1bmspIDogdm9pZCAwCiAgICAgIH07CiAgICB9CiAgICByZXR1cm4gdm9pZCAwOwogIH0KICBmdW5jdGlvbiBjb25zdW1lcmlmeSh3cml0YWJsZSkgewogICAgY29uc3Qgd3JpdGVyID0gd3JpdGFibGUuZ2V0V3JpdGVyKCk7CiAgICByZXR1cm4geyBjb25zdW1lcjogYXN5bmMgKGNodW5rKSA9PiB7CiAgICAgIHJldHVybiBhd2FpdCB3cml0ZXIud3JpdGUoY2h1bmspOwogICAgfSwgd3JpdGVyIH07CiAgfQogIGNvbnN0IElERU5USUZJRVIgPSAiZWFzeS1vcGZzIjsKICBmdW5jdGlvbiBnZXRLZXlXaXRoSWRlbnRpZmllciguLi5rZXkpIHsKICAgIHJldHVybiBgJHtJREVOVElGSUVSfToke2tleS5qb2luKCI6Iil9YDsKICB9CiAgY29uc3QgcHVibGljSGVhZEJyb2FkY2FzdENoYW5uZWwgPSBuZXcgQnJvYWRjYXN0Q2hhbm5lbChnZXRLZXlXaXRoSWRlbnRpZmllcigicHVibGljLWhlYWQiKSk7CiAgZnVuY3Rpb24gZ2V0T3Bmc0ZpbGVDaGFubmVsKHBhdGgpIHsKICAgIHJldHVybiBuZXcgQnJvYWRjYXN0Q2hhbm5lbChnZXRLZXlXaXRoSWRlbnRpZmllcihwYXRoKSk7CiAgfQogIGFzeW5jIGZ1bmN0aW9uIGdldFBhcmVudERpcmVjdG9yeUhhbmRsZShwYXRoLCBjcmVhdGUgPSBmYWxzZSkgewogICAgY29uc3QgX3BhdGggPSBwYXRoMmFycmF5KHBhdGgpOwogICAgbGV0IGN1cnNvciA9IGF3YWl0IG5hdmlnYXRvci5zdG9yYWdlLmdldERpcmVjdG9yeSgpOwogICAgZm9yIChsZXQgaSA9IDA7IGkgPCBfcGF0aC5sZW5ndGggLSAxOyBpKyspIHsKICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLmdldERpcmVjdG9yeUhhbmRsZShfcGF0aFtpXSwgeyBjcmVhdGUgfSk7CiAgICB9CiAgICByZXR1cm4gY3Vyc29yOwogIH0KICBhc3luYyBmdW5jdGlvbiBnZXRPcGZzSGFuZGxlKHBhdGgsIGNyZWF0ZSA9IGZhbHNlKSB7CiAgICBjb25zdCBwYXJlbnQgPSBhd2FpdCBnZXRQYXJlbnREaXJlY3RvcnlIYW5kbGUocGF0aCwgY3JlYXRlKTsKICAgIHJldHVybiBhd2FpdCBwYXJlbnQuZ2V0RmlsZUhhbmRsZShwYXRoMmFycmF5KHBhdGgpLnBvcCgpLCB7IGNyZWF0ZSB9KTsKICB9CiAgYXN5bmMgZnVuY3Rpb24gZGVsZXRlT3Bmc0ZpbGUocGF0aCkgewogICAgY29uc3QgcGFyZW50ID0gYXdhaXQgZ2V0UGFyZW50RGlyZWN0b3J5SGFuZGxlKHBhdGgpOwogICAgcmV0dXJuIGF3YWl0IHBhcmVudC5yZW1vdmVFbnRyeShwYXRoMmFycmF5KHBhdGgpLnBvcCgpKTsKICB9CiAgY2xhc3MgT3Bmc0hhbmRsZSBleHRlbmRzIEV2ZW50VGFyZ2V0MiQxIHsKICAgIGNvbnN0cnVjdG9yKGV4dGVybmFsSGFuZGxlTWFwKSB7CiAgICAgIHN1cGVyKCk7CiAgICAgIHRoaXMuZXh0ZXJuYWxIYW5kbGVNYXAgPSBleHRlcm5hbEhhbmRsZU1hcDsKICAgICAgdGhpcy5jaHVuayA9IDA7CiAgICAgIHRoaXMud3JpdHRlbiA9IDA7CiAgICAgIHRoaXMucGF0aCA9ICIiOwogICAgICB0aGlzLnN0YXRlID0gIm9mZiI7CiAgICB9CiAgICBhc3luYyBpbml0KHJlcXVlc3QpIHsKICAgICAgdmFyIF9hOwogICAgICB0cnkgewogICAgICAgIHRoaXMucGF0aCA9IHJlcXVlc3QucGF0aDsKICAgICAgICB0aGlzLnN0YXRlID0gImluaXRpYWxpemluZyI7CiAgICAgICAgdGhpcy5oYW5kbGUgPSBhd2FpdCAoYXdhaXQgZ2V0T3Bmc0hhbmRsZSh0aGlzLnBhdGgsIHRydWUpKS5jcmVhdGVTeW5jQWNjZXNzSGFuZGxlKCk7CiAgICAgICAgdGhpcy53cml0dGVuID0gdGhpcy5oYW5kbGUuZ2V0U2l6ZSgpOwogICAgICAgIHRoaXMuc3RhdGUgPSAib24iOwogICAgICAgIGNvbnN0IGJyb2FkY2FzdE1lc3NlbmdlciA9IE1lc3NlbmdlckZhY3RvcnkubmV3KHB1YmxpY0hlYWRCcm9hZGNhc3RDaGFubmVsKTsKICAgICAgICBicm9hZGNhc3RNZXNzZW5nZXIucmVzcG9uc2UodGhpcy5wYXRoLCAoKSA9PiB7CiAgICAgICAgICByZXR1cm4gdGhpcy5oZWFkKCk7CiAgICAgICAgfSk7CiAgICAgICAgdGhpcy5tZXNzZW5nZXIgPSBNZXNzZW5nZXJGYWN0b3J5Lm5ldyhnZXRPcGZzRmlsZUNoYW5uZWwodGhpcy5wYXRoKSk7CiAgICAgICAgdGhpcy5tZXNzZW5nZXIucmVzcG9uc2UoImhlYWQiLCAoXykgPT4gewogICAgICAgICAgcmV0dXJuIHRoaXMuaGVhZCgpOwogICAgICAgIH0pOwogICAgICAgIHRoaXMubWVzc2VuZ2VyLnJlc3BvbnNlKCJyZWFkIiwgKHJlcXVlc3QyKSA9PiB7CiAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnJlYWQocmVxdWVzdDIpOwogICAgICAgICAgbGV0IHRyYW5zZmVyOwogICAgICAgICAgaWYgKHJlc3VsdC5vayAmJiByZXN1bHQuZGF0YSkgdHJhbnNmZXIgPSBbcmVzdWx0LmRhdGFdOwogICAgICAgICAgcmV0dXJuIHRyYW5zZmVyID8geyBwYXlsb2FkOiByZXN1bHQsIHRyYW5zZmVyIH0gOiByZXN1bHQ7CiAgICAgICAgfSk7CiAgICAgICAgdGhpcy5tZXNzZW5nZXIucmVzcG9uc2UoIndyaXRlIiwgKHJlcXVlc3QyKSA9PiB7CiAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLndyaXRlKHJlcXVlc3QyKTsKICAgICAgICAgIGxldCB0cmFuc2ZlcjsKICAgICAgICAgIGlmIChyZXN1bHQub2sgJiYgcmVzdWx0LmVuZHBvaW50KSB0cmFuc2ZlciA9IFtyZXN1bHQuZW5kcG9pbnQucmVhZGFibGUsIHJlc3VsdC5lbmRwb2ludC53cml0YWJsZV07CiAgICAgICAgICByZXR1cm4gdHJhbnNmZXIgPyB7IHBheWxvYWQ6IHJlc3VsdCwgdHJhbnNmZXIgfSA6IHJlc3VsdDsKICAgICAgICB9KTsKICAgICAgICB0aGlzLm1lc3Nlbmdlci5yZXNwb25zZSgiZGVsZXRlIiwgYXN5bmMgKF8pID0+IHsKICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmRlbGV0ZSgpOwogICAgICAgIH0pOwogICAgICAgIHRoaXMubWVzc2VuZ2VyLnJlc3BvbnNlKCJjbG9zZSIsIGFzeW5jIChfKSA9PiB7CiAgICAgICAgICByZXR1cm4gdGhpcy5jbG9zZSgpOwogICAgICAgIH0pOwogICAgICAgIChfYSA9IHRoaXMuZXh0ZXJuYWxIYW5kbGVNYXApID09IG51bGwgPyB2b2lkIDAgOiBfYS5zZXQodGhpcy5wYXRoLCB0aGlzKTsKICAgICAgICByZXR1cm4geyBvazogdHJ1ZSB9OwogICAgICB9IGNhdGNoIChlKSB7CiAgICAgICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogZSB9OwogICAgICB9CiAgICB9CiAgICB3cml0ZShyZXF1ZXN0KSB7CiAgICAgIGNvbnN0IF90aGlzID0gdGhpczsKICAgICAgY29uc3QgaGFuZGxlID0gdGhpcy5oYW5kbGU7CiAgICAgIGxldCBhdCA9IHJlcXVlc3QuYXQgfHwgcmVxdWVzdC5rZWVwRXhpc3RpbmdEYXRhID8gdGhpcy53cml0dGVuIDogMDsKICAgICAgaWYgKHJlcXVlc3Quc291cmNlKSB7CiAgICAgICAgaGFuZGxlLndyaXRlKHJlcXVlc3Quc291cmNlLCB7IGF0IH0pOwogICAgICAgIGlmIChfdGhpcy53cml0dGVuIDwgYXQpIF90aGlzLndyaXR0ZW4gPSBhdDsKICAgICAgICByZXR1cm4geyBvazogdHJ1ZSB9OwogICAgICB9CiAgICAgIGNvbnN0IGNvbnN1bWVyID0gYXN5bmMgKGRhdGEpID0+IHsKICAgICAgICBoYW5kbGUud3JpdGUoZGF0YSwgeyBhdCB9KTsKICAgICAgICBhdCArPSBkYXRhLmxlbmd0aDsKICAgICAgICBpZiAoX3RoaXMud3JpdHRlbiA8IGF0KSBfdGhpcy53cml0dGVuID0gYXQ7CiAgICAgIH07CiAgICAgIGNvbnN0IHsgZW5kcG9pbnQxLCBlbmRwb2ludDIgfSA9IG5ldyBEdXBsZXgoKTsKICAgICAgY29uc3Qgd3JpdGFibGUgPSBuZXcgQ29udHJvbGxlZFdyaXRhYmxlU3RyZWFtKGNvbnN1bWVyKTsKICAgICAgd3JpdGFibGUuZW5kcG9pbnQuc3dpdGNoKGVuZHBvaW50MSk7CiAgICAgIGNvbnN0IHsgZW5kcG9pbnQgfSA9IER1cGxleEVuZHBvaW50LnRyYW5zZmVyaWZ5KGVuZHBvaW50Mik7CiAgICAgIHJldHVybiB7IG9rOiB0cnVlLCBlbmRwb2ludCB9OwogICAgfQogICAgcmVhZChyZXF1ZXN0KSB7CiAgICAgIGNvbnN0IHN0YXJ0ID0gcmVxdWVzdC5hdCB8fCAwOwogICAgICBjb25zdCBsZW5ndGggPSByZXF1ZXN0Lmxlbmd0aCB8fCB0aGlzLndyaXR0ZW4gLSBzdGFydDsKICAgICAgY29uc3QgZW5kID0gbGVuZ3RoICsgc3RhcnQ7CiAgICAgIGNvbnN0IGhhbmRsZSA9IHRoaXMuaGFuZGxlOwogICAgICBjb25zdCBfdGhpcyA9IHRoaXM7CiAgICAgIGxldCBhdCA9IHN0YXJ0OwogICAgICBpZiAocmVxdWVzdC5ub1N0cmVhbSkgewogICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgQXJyYXlCdWZmZXIobGVuZ3RoKTsKICAgICAgICBoYW5kbGUucmVhZChkYXRhLCB7IGF0IH0pOwogICAgICAgIHJldHVybiB7IG9rOiB0cnVlLCBkYXRhIH07CiAgICAgIH0KICAgICAgY29uc3Qgc3RyZWFtID0gbmV3IFJlYWRhYmxlU3RyZWFtKHsKICAgICAgICBhc3luYyBzdGFydChjb250cm9sbGVyKSB7CiAgICAgICAgICB0cnkgewogICAgICAgICAgICB3aGlsZSAoYXQgPCBlbmQpIHsKICAgICAgICAgICAgICBpZiAoYXQgPj0gX3RoaXMud3JpdHRlbikgewogICAgICAgICAgICAgICAgYXdhaXQgc2xlZXAkMSgxMDApOwogICAgICAgICAgICAgICAgY29udGludWU7CiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIGNvbnN0IHZpZXdTaXplID0gTWF0aC5taW4oTWF0aC5taW4oX3RoaXMud3JpdHRlbiwgZW5kKSAtIGF0LCAxMCAqIDEwMjQgKiAxMDI0KTsKICAgICAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkodmlld1NpemUpOwogICAgICAgICAgICAgIGhhbmRsZS5yZWFkKGRhdGEuYnVmZmVyLCB7IGF0IH0pOwogICAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShkYXRhKTsKICAgICAgICAgICAgICBhdCArPSB2aWV3U2l6ZTsKICAgICAgICAgICAgfQogICAgICAgICAgfSBmaW5hbGx5IHsKICAgICAgICAgICAgY29udHJvbGxlci5jbG9zZSgpOwogICAgICAgICAgfQogICAgICAgIH0KICAgICAgfSk7CiAgICAgIHJldHVybiB7IG9rOiB0cnVlLCBkYXRhOiBzdHJlYW0gfTsKICAgIH0KICAgIGhlYWQoKSB7CiAgICAgIHJldHVybiB7IG9rOiB0cnVlLCBzaXplOiB0aGlzLndyaXR0ZW4gfTsKICAgIH0KICAgIGNsb3NlKCkgewogICAgICB2YXIgX2EsIF9iOwogICAgICBpZiAodGhpcy5oYW5kbGUpIHsKICAgICAgICB0cnkgewogICAgICAgICAgdGhpcy5oYW5kbGUuZmx1c2goKTsKICAgICAgICAgIHRoaXMuaGFuZGxlLmNsb3NlKCk7CiAgICAgICAgICAoX2EgPSB0aGlzLm1lc3NlbmdlcikgPT0gbnVsbCA/IHZvaWQgMCA6IF9hLmRlcmVzcG9uc2UoKTsKICAgICAgICAgIChfYiA9IHRoaXMuZXh0ZXJuYWxIYW5kbGVNYXApID09IG51bGwgPyB2b2lkIDAgOiBfYi5kZWxldGUodGhpcy5wYXRoKTsKICAgICAgICAgIHRoaXMuaGFuZGxlID0gdm9pZCAwOwogICAgICAgICAgcmV0dXJuIHsgb2s6IHRydWUgfTsKICAgICAgICB9IGNhdGNoIChlcnJvcikgewogICAgICAgICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvciB9OwogICAgICAgIH0KICAgICAgfQogICAgICByZXR1cm4geyBvazogdHJ1ZSB9OwogICAgfQogICAgYXN5bmMgZGVsZXRlKCkgewogICAgICBjb25zdCBjbG9zZSA9IHRoaXMuY2xvc2UoKTsKICAgICAgaWYgKGNsb3NlLm9rKSB7CiAgICAgICAgdHJ5IHsKICAgICAgICAgIGF3YWl0IGRlbGV0ZU9wZnNGaWxlKHRoaXMucGF0aCk7CiAgICAgICAgICByZXR1cm4geyBvazogdHJ1ZSB9OwogICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yIH07CiAgICAgICAgfQogICAgICB9CiAgICAgIHJldHVybiBjbG9zZTsKICAgIH0KICB9CiAgY29uc3QgaGFuZGxlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgYXN5bmMgZnVuY3Rpb24gYWRkSGFuZGxlKHJlcXVlc3QpIHsKICAgIGlmIChoYW5kbGVzLmhhcyhyZXF1ZXN0LnBhdGgpKSByZXR1cm4geyBvazogdHJ1ZSB9OwogICAgcmV0dXJuIGF3YWl0IG5ldyBPcGZzSGFuZGxlKGhhbmRsZXMpLmluaXQocmVxdWVzdCk7CiAgfQogIGNvbnN0IG1lc3NlbmdlciA9IE1lc3NlbmdlckZhY3RvcnkubmV3KHNlbGYpOwogIG1lc3Nlbmdlci5yZXNwb25zZSgiaW5pdCIsIGFzeW5jIChyZXF1ZXN0KSA9PiB7CiAgICByZXR1cm4gYXdhaXQgYWRkSGFuZGxlKHJlcXVlc3QpOwogIH0pOwp9KSgpOwo=";
  const decodeBase64 = (base64) => Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = typeof self !== "undefined" && self.Blob && new Blob([decodeBase64(encodedJs)], { type: "text/javascript;charset=utf-8" });
  function WorkerWrapper(options) {
    let objURL;
    try {
      objURL = blob && (self.URL || self.webkitURL).createObjectURL(blob);
      if (!objURL) throw "";
      const worker = new Worker(objURL, {
        name: options == null ? void 0 : options.name
      });
      worker.addEventListener("error", () => {
        (self.URL || self.webkitURL).revokeObjectURL(objURL);
      });
      return worker;
    } catch (e) {
      return new Worker(
        "data:text/javascript;base64," + encodedJs,
        {
          name: options == null ? void 0 : options.name
        }
      );
    } finally {
      objURL && (self.URL || self.webkitURL).revokeObjectURL(objURL);
    }
  }
  var EventTarget2 = class extends EventTarget {
    constructor() {
      super(...arguments);
      this.listeners = /* @__PURE__ */ new Map();
      this._bubbleMap = /* @__PURE__ */ new Map();
      this.atomicQueue = /* @__PURE__ */ new Map();
    }
    async waitFor(type, compareValue) {
      return new Promise((resolve) => {
        if (compareValue !== void 0) {
          this.listenOnceOnly(type, (e) => resolve(e.detail), (e) => e.detail === compareValue);
        } else {
          this.listenOnce(type, (e) => resolve(e.detail));
        }
      });
    }
    callback(type, callback) {
      this.waitFor(type).then(callback);
    }
    dispatch(type, detail) {
      this.dispatchEvent(new CustomEvent(type, detail !== void 0 ? { detail } : void 0));
    }
    listen(type, callback, options) {
      if (!this.listeners.has(type)) this.listeners.set(type, /* @__PURE__ */ new Set());
      this.listeners.get(type).add(callback);
      this.addEventListener(type, callback, options);
    }
    remove(type, callback, options) {
      if (!this.listeners.has(type)) this.listeners.set(type, /* @__PURE__ */ new Set());
      this.listeners.get(type).delete(callback);
      this.removeEventListener(type, callback, options);
    }
    destroy() {
      for (let type of this.listeners.keys()) {
        for (let callback of this.listeners.get(type)) {
          this.remove(type, callback);
        }
      }
    }
    listenOnce(type, callback) {
      this.listen(type, callback, { once: true });
    }
    listenOnceOnly(type, callback, only) {
      const wrapper = (e) => {
        if (only(e)) {
          this.remove(type, wrapper);
          callback(e);
        }
      };
      this.listen(type, wrapper);
    }
    listenDebounce(type, callback, options = { timeout: 100, mode: "last" }) {
      switch (options.mode) {
        case "first":
          return this.listenDebounceFirst(type, callback, options);
        case "last":
          return this.listenDebounceLast(type, callback, options);
      }
    }
    listenDebounceFirst(type, callback, options = { timeout: 100 }) {
      let lastMs = 0;
      this.listen(
        type,
        (e) => {
          const currentMs = Date.now();
          if (currentMs - lastMs > options.timeout) {
            callback(e);
          }
          lastMs = currentMs;
        },
        options
      );
    }
    listenDebounceLast(type, callback, options = { timeout: 100 }) {
      let timoutInstance;
      this.listen(
        type,
        (e) => {
          clearTimeout(timoutInstance);
          timoutInstance = window.setTimeout(() => callback(e), options.timeout);
        },
        options
      );
    }
    enableBubble(type) {
      if (this._bubbleMap.has(type)) return;
      const dispatcher = (e) => {
        var _a;
        (_a = this.parent) == null ? void 0 : _a.dispatch(e.type, e.detail);
      };
      this.listen(type, dispatcher);
      this._bubbleMap.set(type, dispatcher);
    }
    disableBubble(type) {
      if (!this._bubbleMap.has(type)) return;
      const dispatcher = this._bubbleMap.get(type);
      this.remove(type, dispatcher);
      this._bubbleMap.delete(type);
    }
    _atomicInit(type) {
      this.atomicQueue.set(type, []);
      const atomicLoop = async () => {
        const queue = this.atomicQueue.get(type);
        while (true) {
          const task = queue.shift();
          if (task) {
            await task();
          } else {
            await this.waitFor("__atomic-add", type);
          }
        }
      };
      atomicLoop();
    }
    atomic(type, func) {
      return new Promise((resolve) => {
        const wrap = async () => resolve(await func());
        if (!this.atomicQueue.has(type)) this._atomicInit(type);
        this.atomicQueue.get(type).push(wrap);
        this.dispatch("__atomic-add", type);
      });
    }
  };
  var Flowmeter = class extends EventTarget2 {
    constructor(sensor, interval = 1e3) {
      super();
      this.sensor = sensor;
      this.interval = interval;
      this.buffer = [];
      this.listenerWeakMap = /* @__PURE__ */ new WeakMap();
      this.closed = false;
      this.lastWatchInfo = { time: Date.now(), value: 0, delta: 0, interval: 0, flow: 0 };
      setInterval(() => this.watch(), interval);
      const _this = this;
      const { readable, writable } = new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(chunk);
          _this.process(chunk);
        },
        flush() {
          _this.closed = true;
          _this.destroy();
        }
      });
      this.readable = readable;
      this.writable = writable;
    }
    // custom trigger depends on flow info
    // callback if trigger===true duration overs triggerDuration
    // if trigger fired, other triggers skipped while slowDown
    addTrigger(trigger, callback, triggerDuration = 1e3, slowDown = 0) {
      if (this.listenerWeakMap.has(trigger)) throw new Error("FlowmeterAddTriggerError: Duplication of trigger is not allowed");
      let timeout = null;
      let skip = false;
      const setTimeout2 = globalThis.setTimeout;
      const listener = async (e) => {
        const info = e.detail;
        if (await trigger(info)) {
          if (!timeout && !skip) {
            const handler = () => {
              if (!this.closed) callback();
              timeout = null;
              skip = true;
              setTimeout2(() => {
                skip = false;
              }, slowDown);
            };
            timeout = setTimeout2(handler, triggerDuration);
          }
        } else {
          if (timeout) clearTimeout(timeout);
          timeout = null;
        }
      };
      this.listen("flow", listener);
      this.listenerWeakMap.set(trigger, listener);
    }
    delTrigger(trigger) {
      if (!this.listenerWeakMap.has(trigger)) throw new Error("FlowmeterDelTriggerError: This trigger is not attached");
      this.remove("flow", this.listenerWeakMap.get(trigger));
      this.listenerWeakMap.delete(trigger);
    }
    watch() {
      const buffer = this.buffer;
      this.buffer = [];
      const time = Date.now();
      const value = buffer.reduce((a, b) => a + b.value, 0);
      const delta = value - this.lastWatchInfo.value;
      const interval = time - this.lastWatchInfo.time;
      const flow = delta / interval;
      const info = { time, value, delta, interval, flow };
      this.lastWatchInfo = info;
      this.dispatch("flow", info);
    }
    process(chunk) {
      const time = Date.now();
      const value = this.sensor(chunk);
      this.buffer.push({ time, value });
    }
  };
  function lengthCallback(callback, key = "length") {
    return new TransformStream({
      transform(chunk, controller) {
        callback(chunk[key]);
        controller.enqueue(chunk);
      }
    });
  }
  async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function mergeSignal(signal1, signal2) {
    const controller = new AbortController();
    signal1.onabort = (e) => controller.abort(e.target.reason);
    signal2.onabort = (e) => controller.abort(e.target.reason);
    return controller.signal;
  }
  function noop(..._) {
  }
  var AbstractSwitchableStream = class extends EventTarget2 {
    // to identify intended abort
    constructor(generator, context) {
      super();
      this.generator = generator;
      this.context = context;
      this.controller = new AbortController();
      this.abortReason = "SwitchableStreamAbortForSwitching";
      this.isSwitching = false;
    }
    switch(to) {
      let generator;
      if (!to) {
        if (this.isSwitching) return;
        if (this.generator) generator = this.generator;
        else return;
      }
      return this.atomic("switch", async () => {
        this.isSwitching = true;
        await this.abort();
        this.controller = new AbortController();
        if (!to) to = await generator(this.context, this.controller.signal);
        const { readable, writable } = this.target(to, this.controller.signal);
        for (let i = 0; readable.locked || writable.locked; i += 10) await sleep(i);
        readable.pipeTo(writable, { preventAbort: true, preventCancel: true, preventClose: true, signal: this.controller.signal }).then(() => {
          if (writable.locked) writable.close();
        }).catch((e) => {
          if (e !== this.abortReason) this.switch();
        });
        this.isSwitching = false;
        this.dispatch("switch-done");
      });
    }
    async abort() {
      this.controller.abort(this.abortReason);
      for (let i = 0; this.locked; i += 10) {
        await sleep(i);
      }
    }
  };
  var SwitchableReadableStream = class extends AbstractSwitchableStream {
    constructor(generator, context) {
      super();
      this.generator = generator;
      this.context = context;
      const _this = this;
      const { readable, writable } = new TransformStream({
        async transform(chunk, controller) {
          if (_this.isSwitching) await _this.waitFor("switch-done");
          controller.enqueue(chunk);
        }
      });
      this.stream = readable;
      const buffer = new TransformStream();
      this.writable = buffer.writable;
      buffer.readable.pipeTo(writable);
      if (generator) this.switch();
    }
    target(to, signal) {
      const { readable, writable } = new TransformStream();
      readable.pipeTo(this.writable, { preventCancel: true, preventAbort: true, signal }).catch(noop);
      return {
        readable: to,
        writable
      };
    }
    get locked() {
      return this.writable.locked;
    }
  };
  var SwitchableWritableStream = class extends AbstractSwitchableStream {
    constructor(generator, context) {
      super();
      this.generator = generator;
      this.context = context;
      const _this = this;
      const { readable, writable } = new TransformStream({
        async transform(chunk, controller) {
          if (_this.isSwitching) await _this.waitFor("switch-done");
          controller.enqueue(chunk);
        }
      });
      this.stream = writable;
      this.readable = readable;
      if (generator) this.switch();
    }
    target(to, signal) {
      const { readable, writable } = new TransformStream();
      this.readable.pipeTo(writable, { preventCancel: true, preventAbort: true, signal }).catch(noop);
      return {
        readable,
        writable: to
      };
    }
    get locked() {
      return this.readable.locked;
    }
  };
  function sliceStream(start, end = Number.POSITIVE_INFINITY, measurer, slicer) {
    let index = 0;
    return new TransformStream({
      transform(chunk, controller) {
        const size = measurer(chunk);
        const nextIndex = index + size;
        if (start <= index && nextIndex <= end) {
          controller.enqueue(chunk);
        } else if (index <= start && end <= nextIndex) {
          controller.enqueue(slicer(chunk, start - index, end - index));
        } else if (index <= start && start < nextIndex) {
          controller.enqueue(slicer(chunk, start - index, size));
        } else if (index < end && end <= nextIndex) {
          controller.enqueue(slicer(chunk, 0, end - index));
        } else ;
        index = nextIndex;
      }
    });
  }
  function sliceByteStream(start, end) {
    return sliceStream(
      start,
      end,
      (chunk) => chunk.length,
      (chunk, start2, end2) => chunk.slice(start2, end2)
    );
  }
  function retryableStream(readableGenerator, context, option, sensor) {
    let _option = { slowDown: 0, minSpeed: 0, minDuration: 1e3 };
    Object.assign(_option, option);
    option = _option;
    if (!sensor) sensor = (any) => any.length;
    const flowmeter = new Flowmeter(sensor);
    const { readable, writable } = flowmeter;
    const switchable = new SwitchableReadableStream(readableGenerator, context);
    switchable.stream.pipeTo(writable);
    flowmeter.addTrigger((info) => option.minSpeed ? info.flow <= option.minSpeed : false, () => switchable.switch(), option.minDuration, option.slowDown);
    return readable;
  }
  function retryableFetchStream(input, init, option) {
    let _option = { slowDown: 5e3, minSpeed: 5120, minDuration: 1e4 };
    Object.assign(_option, option);
    option = _option;
    const context = { start: 0, end: 0 };
    if (init && init.headers) {
      const headers = init.headers;
      let range = "";
      if (headers instanceof Headers) range = headers.get("Range") || "";
      else if (headers instanceof Array) range = (headers.find(([key, _]) => key.toLocaleLowerCase() === "range") || [, ""])[1];
      else range = headers["Range"] || headers["range"] || "";
      if (range) {
        const [_, start, end] = /bytes=(\d+)-(\d+)?/.exec(range) || [];
        if (start) context.start = Number(start);
        if (end) context.end = Number(end);
      }
    }
    const readableGenerator = async (context2, signal) => {
      const { start, end } = context2;
      if (!init) init = {};
      if (start !== 0) {
        const Range = `bytes=${start}-${end !== 0 ? end : ""}`;
        if (!init.headers) init.headers = new Headers({ Range });
        else if (init.headers instanceof Headers) init.headers.set("Range", Range);
        else if (init.headers instanceof Array) {
          const found = init.headers.find(([key, _]) => key.toLocaleLowerCase() === "range");
          if (found) found[1] = Range;
          else init.headers.push(["Range", Range]);
        } else if (init.headers) init.headers["Range"] = Range;
      }
      init.signal = signal ? init.signal ? mergeSignal(init.signal, signal) : signal : init.signal;
      const response = await fetch(input, init);
      let stream = response.body;
      if (!stream) throw new Error("Error: Cannot find response body");
      if (response.status !== 206 && !response.headers.get("Content-Range") && start !== 0) {
        stream = stream.pipeThrough(sliceByteStream(start, end !== 0 ? end : void 0));
      }
      stream = stream.pipeThrough(lengthCallback((delta) => {
        context2.start += delta;
      }));
      return stream;
    };
    return retryableStream(readableGenerator, context, option);
  }
  var DuplexEndpoint = class _DuplexEndpoint extends EventTarget2 {
    constructor(readable, writable) {
      super();
      this.readable = readable;
      this.writable = writable;
    }
    // transfer duplex by postMessage
    static transferify(endpoint) {
      const { readable, writable } = endpoint;
      return {
        endpoint: { readable, writable },
        transfer: [readable, writable]
      };
    }
    // restore duplex from postMessage
    static instancify(objectifiedEndpoint) {
      return new _DuplexEndpoint(objectifiedEndpoint.readable, objectifiedEndpoint.writable);
    }
  };
  var SwitchableDuplexEndpoint = class extends DuplexEndpoint {
    constructor(generator, context) {
      const switchableReadable = new SwitchableReadableStream();
      const switchableWritable = new SwitchableWritableStream();
      super(switchableReadable.stream, switchableWritable.stream);
      this.generator = generator;
      this.context = context;
      this.isSwitching = false;
      this.switchableReadable = switchableReadable;
      this.switchableWritable = switchableWritable;
      if (generator) this.switch();
    }
    switch(endpoint) {
      if (!endpoint && this.isSwitching) return;
      return this.atomic("switch", async () => {
        this.isSwitching = true;
        if (!endpoint && this.generator) endpoint = await this.generator(this.context);
        if (!endpoint) return;
        const { readable, writable } = endpoint;
        await this.switchableWritable.switch(writable);
        await this.switchableReadable.switch(readable);
        this.isSwitching = false;
      });
    }
  };
  var SWITCH_DUPLEX_ENDPOINT_TIMEOUT = 1e3;
  var ControlledReadableStream = class extends EventTarget2 {
    constructor(generator, endpoint, strategy, chunkCallback2) {
      super();
      if (generator instanceof ReadableStream) generator = generatorify(generator);
      this.endpoint = endpoint ? endpoint : new SwitchableDuplexEndpoint();
      const switchEndpoint = () => this.endpoint.switch();
      const signal = this.endpoint.readable.getReader();
      let enqueued = 0;
      let consumed = -1;
      let interval = void 0;
      const stream = new ReadableStream({
        async pull(controller) {
          const { value, done } = await generator();
          if (done) {
            controller.close();
          } else {
            const block = { id: enqueued, chunk: value };
            while (consumed < enqueued) {
              controller.enqueue(block);
              interval = globalThis.setInterval(switchEndpoint, SWITCH_DUPLEX_ENDPOINT_TIMEOUT);
              const result = await signal.read();
              clearInterval(interval);
              if (result.done) return;
              consumed = result.value;
            }
            enqueued++;
            if (chunkCallback2) chunkCallback2(value);
          }
        }
      }, wrapQueuingStrategy(strategy));
      stream.pipeTo(this.endpoint.writable).then(() => this.dispatch("close"));
    }
  };
  function wrapQueuingStrategy(strategy) {
    if (strategy) {
      const size = strategy.size;
      return {
        highWaterMark: strategy.highWaterMark,
        size: size ? (block) => size(block.chunk) : void 0
      };
    }
    return void 0;
  }
  function generatorify(readable) {
    const reader = readable.getReader();
    return async () => {
      return await reader.read();
    };
  }
  const IDENTIFIER = "easy-opfs";
  function getKeyWithIdentifier(...key) {
    return `${IDENTIFIER}:${key.join(":")}`;
  }
  const publicHeadBroadcastChannel = new BroadcastChannel(getKeyWithIdentifier("public-head"));
  function getOpfsFileChannel(path) {
    return new BroadcastChannel(getKeyWithIdentifier(path));
  }
  class OpfsWorker {
    constructor() {
      this.worker = new WorkerWrapper();
      this.workerMessenger = MessengerFactory.new(this.worker);
      this.broadcastMessenger = MessengerFactory.new(publicHeadBroadcastChannel);
    }
    static get instance() {
      if (!OpfsWorker._instance) OpfsWorker._instance = new OpfsWorker();
      return OpfsWorker._instance;
    }
    static async checkHandle(path) {
      try {
        return (await this.instance.broadcastMessenger.request(path, null, void 0, 100)).ok;
      } catch {
        return false;
      }
    }
    static async addHandle(request) {
      if (await this.checkHandle(request.path)) return { ok: true };
      const response = await this.instance.workerMessenger.request("init", request);
      if (response.ok) return response;
      throw new Error("OpfsWorkerAddHandleError: Cannot create/request OpfsHandle.");
    }
    /*static async deleteHandle(): Promise<OpfsDeleteResponse> {
            const response = await this.instance.workerMessenger.request<null, OpfsDeleteResponse>("delete", null)
            if (response.ok) return response;
    
            throw new Error("OpfsWorkerDeleteHandleError: Cannot delete OpfsHandle.")
        }*/
  }
  class OpfsFile extends EventTarget2$2 {
    constructor(path) {
      super();
      this.state = "off";
      this.path = normalizePath(path);
      this.messenger = MessengerFactory.new(getOpfsFileChannel(this.path));
      this.init();
    }
    async _init() {
      this.state = "initializing";
      await OpfsWorker.addHandle({ path: this.path });
      this.state = "on";
      this.dispatch("done");
    }
    async init() {
      if (this.state === "on") return;
      if (this.state === "initializing") return await this.waitFor("done");
      if (this.state === "off") return await this._init();
    }
    async head() {
      const head = await this.messenger.request("head", null);
      if (!head.ok) throw new Error("OpfsHeadError: OpfsWorker returned error", { cause: head.error });
      return head;
    }
    read(at = 0, length) {
      let isChecking = true;
      const requestAsContext = { at, length };
      const generator = async (context) => {
        await this.init();
        const response = await this.messenger.request("read", context);
        if (!response.ok) throw new Error("OpfsFileReadError: OpfsWorker returned error", { cause: response.error });
        const stream2 = response.data.pipeThrough(lengthCallback((delta) => {
          context.at += delta;
          if (context.length) context.length -= delta;
        }));
        isChecking = false;
        return stream2;
      };
      const switchable = new SwitchableReadableStream(generator, requestAsContext);
      const flow = new Flowmeter((chunk) => chunk.length);
      const stream = switchable.stream.pipeThrough(flow);
      const check = async () => {
        if (isChecking) return;
        isChecking = true;
        if (!await OpfsWorker.checkHandle(this.path)) {
          await this._init();
          await switchable.switch();
        }
        isChecking = false;
      };
      flow.addTrigger((info) => info.flow === 0, check, 1e3, 0);
      return stream;
    }
    async _writeArrayBuffer(source, at) {
      while (true) {
        try {
          const response = await this.messenger.request("write", { source, at });
          if (!response.ok) throw new Error("OpfsFileWriteError: OpfsWorker returned error", { cause: response.error });
          source.transfer(0);
          return response;
        } catch (e) {
          await this._init();
        }
      }
    }
    async _writeStream(source, at) {
      const requestAsContext = { at };
      const endpointGenerator = async (context) => {
        let response;
        while (true) {
          try {
            response = await this.messenger.request("write", context);
            break;
          } catch (e) {
            await this._init();
          }
        }
        if (!response.ok) throw new Error("OpfsFileWriteError: OpfsWorker returned error", { cause: response.error });
        return DuplexEndpoint.instancify(response.endpoint);
      };
      const endpoint = new SwitchableDuplexEndpoint(endpointGenerator, requestAsContext);
      const stream = new ControlledReadableStream(source, endpoint, void 0, (chunk) => {
        requestAsContext.at += chunk.length;
      });
      return await stream.waitFor("close");
    }
    async write(source, at, keepExistingData = true) {
      await this.init();
      if (!at) {
        if (keepExistingData) {
          at = (await this.head()).size;
        } else {
          at = 0;
        }
      }
      if (source instanceof ArrayBuffer) {
        const result2 = await this._writeArrayBuffer(source, at);
        return result2;
      }
      const result = await this._writeStream(source, at);
      return result;
    }
    async delete() {
      await this.init();
      const result = await this.messenger.request("delete", null);
      if (result.ok) this.state = "off";
      return result;
    }
    async close() {
      const result = await this.messenger.request("close", null);
      if (result.ok) this.state = "off";
      return result;
    }
    // utils
    async writeText(text) {
      const encoded = new TextEncoder().encode(text);
      return await this.write(encoded.buffer);
    }
    async readText() {
      const stream = await this.read();
      const result = await new Response(stream).text();
      return result;
    }
    async writeFetch(input, init) {
      const stream = retryableFetchStream(input, init);
      return await this.write(stream);
    }
  }
  exports2.OpfsFile = OpfsFile;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
