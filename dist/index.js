var I = class extends EventTarget {
  constructor() {
    super(...arguments), this._bubbleMap = /* @__PURE__ */ new Map();
  }
  async waitFor(e) {
    return new Promise((a) => {
      this.addEventListener(e, a, { once: !0 });
    });
  }
  callback(e, a) {
    this.waitFor(e).then((s) => a(s));
  }
  dispatch(e, a) {
    this.dispatchEvent(new CustomEvent(e, a ? { detail: a } : void 0));
  }
  listen(e, a, s) {
    this.addEventListener(e, a, s);
  }
  remove(e, a, s) {
    this.removeEventListener(e, a, s);
  }
  listenOnce(e, a) {
    this.listen(e, a, { once: !0 });
  }
  listenOnceOnly(e, a, s) {
    const l = (c) => {
      s(c) && (this.remove(e, l), a(c));
    };
    this.listen(e, l);
  }
  listenDebounce(e, a, s = { timeout: 100, mode: "last" }) {
    switch (s.mode) {
      case "first":
        return this.listenDebounceFirst(e, a, s);
      case "last":
        return this.listenDebounceLast(e, a, s);
    }
  }
  listenDebounceFirst(e, a, s = { timeout: 100 }) {
    let l = 0;
    this.listen(
      e,
      (c) => {
        const i = Date.now();
        i - l > s.timeout && a(c), l = i;
      },
      s
    );
  }
  listenDebounceLast(e, a, s = { timeout: 100 }) {
    let l;
    this.listen(
      e,
      (c) => {
        clearTimeout(l), l = window.setTimeout(() => a(c), s.timeout);
      },
      s
    );
  }
  enableBubble(e) {
    if (this._bubbleMap.has(e)) return;
    const a = (s) => {
      var l;
      (l = this.parent) == null || l.dispatch(s.type, s.detail);
    };
    this.listen(e, a), this._bubbleMap.set(e, a);
  }
  disableBubble(e) {
    if (!this._bubbleMap.has(e)) return;
    const a = this._bubbleMap.get(e);
    this.remove(e, a), this._bubbleMap.delete(e);
  }
}, g = class extends EventTarget {
  constructor() {
    super(...arguments), this._bubbleMap = /* @__PURE__ */ new Map();
  }
  async waitFor(t) {
    return new Promise((e) => {
      this.addEventListener(t, e, { once: !0 });
    });
  }
  callback(t, e) {
    this.waitFor(t).then((a) => e(a));
  }
  dispatch(t, e) {
    this.dispatchEvent(new CustomEvent(t, e ? { detail: e } : void 0));
  }
  listen(t, e, a) {
    this.addEventListener(t, e, a);
  }
  remove(t, e, a) {
    this.removeEventListener(t, e, a);
  }
  listenOnce(t, e) {
    this.listen(t, e, { once: !0 });
  }
  listenOnceOnly(t, e, a) {
    const s = (l) => {
      a(l) && (this.remove(t, s), e(l));
    };
    this.listen(t, s);
  }
  listenDebounce(t, e, a = { timeout: 100, mode: "last" }) {
    switch (a.mode) {
      case "first":
        return this.listenDebounceFirst(t, e, a);
      case "last":
        return this.listenDebounceLast(t, e, a);
    }
  }
  listenDebounceFirst(t, e, a = { timeout: 100 }) {
    let s = 0;
    this.listen(
      t,
      (l) => {
        const c = Date.now();
        c - s > a.timeout && e(l), s = c;
      },
      a
    );
  }
  listenDebounceLast(t, e, a = { timeout: 100 }) {
    let s;
    this.listen(
      t,
      (l) => {
        clearTimeout(s), s = window.setTimeout(() => e(l), a.timeout);
      },
      a
    );
  }
  enableBubble(t) {
    if (this._bubbleMap.has(t)) return;
    const e = (a) => {
      var s;
      (s = this.parent) == null || s.dispatch(a.type, a.detail);
    };
    this.listen(t, e), this._bubbleMap.set(t, e);
  }
  disableBubble(t) {
    if (!this._bubbleMap.has(t)) return;
    const e = this._bubbleMap.get(t);
    this.remove(t, e), this._bubbleMap.delete(t);
  }
};
function N() {
  return crypto.randomUUID();
}
var Z = "post-together";
function F(t) {
  return t.id && t.type && t.__identifier === Z;
}
function H(t) {
  return "data" in t && F(t.data);
}
function G(t) {
  if (H(t))
    return t.data;
}
var u = class {
  constructor(t, e) {
    this.listenFrom = t, this.sendTo = e, this.activated = !0, this.listenerWeakMap = /* @__PURE__ */ new WeakMap(), this.listenerSet = /* @__PURE__ */ new Set();
  }
  // create request message from type and payload
  createRequest(t, e) {
    return { id: N(), type: t, payload: e, __type: "request", __identifier: Z };
  }
  // create response message from request message and payload
  createResponse(t, e) {
    const { id: a, type: s, __identifier: l } = t;
    return { id: a, type: s, payload: e, __type: "response", __identifier: l };
  }
  // inject informations to message
  async _inject(t) {
  }
  // listen for response
  responseCallback(t, e) {
    const a = async (s) => {
      const l = G(s);
      l && l.id === t.id && l.type === t.type && l.__type === "response" && (await this._inject(l), this.listenFrom.removeEventListener("message", a), e(l.payload.data, l.payload.transfer));
    };
    return this.listenFrom.addEventListener("message", a), () => this.listenFrom.removeEventListener("message", a);
  }
  _getSendTo(t) {
    let e = this.sendTo;
    if (t) {
      const a = t.source;
      a && (e = a);
    }
    return e;
  }
  // send message
  async _send(t, e) {
    const a = { transfer: t.payload.transfer };
    b() && Object.assign(a, { targetOrigin: "*" }), this._getSendTo(e).postMessage(t, a);
  }
  // send message and get response
  request(t, e, a = 5e3) {
    return new Promise(async (s, l) => {
      const c = this.createRequest(t, e), i = this.responseCallback(c, (n, z) => s({ data: n, transfer: z }));
      await this._send(c), setTimeout(() => {
        i(), l(`MessengerRequestTimeoutError: request timeout reached: ${a}ms`);
      }, a);
    });
  }
  wrapMessageHandler(t, e) {
    return async (a) => {
      const s = G(a);
      if (s && s.type === t && s.__type === "request" && this.activated) {
        await this._inject(s);
        const l = await e(s.payload.data, s.payload.transfer), c = this.createResponse(s, l);
        await this._send(c, a);
      }
    };
  }
  // get request and give response
  response(t, e) {
    if (this.listenerSet.has(e)) throw new Error("MessengerAddEventListenerError: this message handler already attached");
    const a = this.wrapMessageHandler(t, e);
    this.listenerWeakMap.set(e, a), this.listenerSet.add(e), this.listenFrom.addEventListener("message", a);
  }
  // remove response handler
  deresponse(t) {
    const e = t ? [t] : this.listenerSet;
    for (let a of e) {
      const s = this.listenerWeakMap.get(a);
      s && (this.listenFrom.removeEventListener("message", s), this.listenerWeakMap.delete(a)), this.listenerSet.delete(a);
    }
  }
  // re-activate message handling
  activate() {
    this.activated || (this.activated = !0);
  }
  // deactivate message handling
  deactivate() {
    this.activated && (this.activated = !1);
  }
}, L = class extends u {
  constructor(t, e, a) {
    super(t, e), this.listenFrom = t, this.sendTo = e, this.sendToOrigin = a;
  }
  async _send(t, e) {
    this._getSendTo(e).postMessage(t, { transfer: t.payload.transfer, targetOrigin: this.sendToOrigin });
  }
}, y = "https://freezm-ltd.github.io/post-together/iframe/", Y = new URL(y).origin;
function b(t) {
  return globalThis.constructor === globalThis.Window ? (t || (t = window.origin), t === Y) : !1;
}
var m = `${Z}:__store`, p = `${Z}:__fetch`, K = class extends u {
  async _inject(t) {
    if (t.payload) return;
    const { id: e } = t, a = await h.fetch(e);
    if (a.data === "error") throw new Error("BroadcastChannelMessengerFetchPayloadError: MessageHub fetch failed.");
    t.payload = a;
  }
  async _send(t) {
    if (t.payload.transfer) {
      const { payload: e, ...a } = t;
      if ((await h.store(t)).data !== "success") throw new Error("BroadcastChannelMessengerSendError: MessageHub store failed.");
      this._getSendTo().postMessage(a);
    } else
      this._getSendTo().postMessage(t);
  }
}, X = class extends g {
  constructor() {
    super(), this.state = "off", this.listenFroms = /* @__PURE__ */ new Set(), this.init();
  }
  async init() {
    if (this.state !== "on") {
      if (this.state === "initializing") return await this.waitFor("done");
      this.state = "initializing", await this._init(), this.state = "on", this.dispatch("done");
    }
  }
  async _init() {
  }
  async store(t) {
    await this.init();
    const e = await this.target.request(m, { data: t, transfer: t.payload.transfer });
    if (e && e.data === "success")
      return e;
    throw new Error("MessageHubStoreError: MessagHub returned corrupted or unsuccessful response.");
  }
  async fetch(t) {
    await this.init();
    const e = await this.target.request(p, { data: t });
    if (e && e.data !== "error" && e.transfer)
      return e;
    throw new Error("MessageHubFetchError: MessagHub returned corrupted or unsuccessful response.");
  }
  // listen request
  async addListen(t) {
    if (await this.init(), this.listenFroms.has(t)) return;
    const e = r.new(t);
    this.listenFroms.add(t), e.response(m, async (a) => await this.store(a)), e.response(p, async (a) => await this.fetch(a));
  }
}, w = class extends X {
  constructor() {
    super(...arguments), this.storage = /* @__PURE__ */ new Map();
  }
  // add listen; requests from windows -> serviceworker
  async _init() {
    this.addListen(self);
  }
  // service worker is MessageHub storage itself
  async store(t) {
    return this.storage.set(t.id, t.payload), { data: "success" };
  }
  async fetch(t) {
    let e = this.storage.get(t);
    return e || { data: "error" };
  }
}, f = class extends X {
  // worker -> parent window
  async _init() {
    this.target = r.new(self);
  }
}, M = class extends X {
  async _initSameOrigin() {
    globalThis.navigator.serviceWorker.controller ? (this.target = r.new(globalThis.navigator.serviceWorker), window.parent.postMessage("loadend", { targetOrigin: "*" })) : (setTimeout(() => {
      window.location.assign(window.location.href);
    }, 1e3), await new Promise(() => {
    }));
  }
  async _initCrossOrigin() {
    let t = !1;
    const e = document.createElement("iframe"), a = (s) => {
      b(s.origin) && s.data === "loadend" && (t = !0, this.dispatch("iframeloadend"), window.removeEventListener("message", a));
    };
    window.addEventListener("message", a), e.setAttribute("src", y), e.style.display = "none", document.body.appendChild(e), t || await this.waitFor("iframeloadend"), this.target = new L(window, e.contentWindow, Y);
  }
  // worker/window -> window -> iframe/serviceworker -> window -> worker/window
  async _init() {
    b() ? await this._initSameOrigin() : await this._initCrossOrigin(), this.addListen(window);
  }
}, h = class o {
  constructor() {
    this.changeHub();
  }
  changeHub() {
    switch (globalThis.constructor) {
      case globalThis.ServiceWorkerGlobalScope:
        this.hub = new w();
        break;
      case globalThis.Window:
        this.hub = new M();
        break;
      case globalThis.DedicatedWorkerGlobalScope:
        this.hub = new f();
        break;
      default:
        throw new Error("MessageHubConstructError: Cannot create MessageHub instance in this scope.");
    }
  }
  static init() {
    o._instance || (o._instance = new o());
  }
  static get instance() {
    return this.init(), o._instance;
  }
  static async store(e) {
    return this.instance.hub.store(e);
  }
  static async fetch(e) {
    return this.instance.hub.fetch(e);
  }
  static async addListen(e) {
    return this.instance.hub.addListen(e);
  }
}, r = class {
  constructor() {
  }
  static new(t) {
    if (!t) throw new Error("MessengerFactoryNoOptionError: Cannot create Messenger, argument 'option' is not provided");
    let e, a;
    switch (t.constructor) {
      case globalThis.ServiceWorker: {
        a = window.navigator.serviceWorker, e = t;
        break;
      }
      case globalThis.ServiceWorkerContainer: {
        a = t, e = t.controller;
        break;
      }
      case globalThis.ServiceWorkerGlobalScope: {
        a = t, e = void 0;
        break;
      }
      case globalThis.Worker: {
        a = e = t, h.addListen(t);
        break;
      }
      case globalThis.DedicatedWorkerGlobalScope: {
        a = e = t;
        break;
      }
      case globalThis.Window: {
        const s = t;
        a = window, e = s;
        break;
      }
      case globalThis.Client: {
        a = self, e = t;
        break;
      }
      case globalThis.BroadcastChannel: {
        const s = t.name;
        return new K(new BroadcastChannel(s), new BroadcastChannel(s));
      }
      case globalThis.MessagePort: {
        a = e = t;
        break;
      }
    }
    if (a)
      return new u(a, e);
    throw new Error("MessengerFactoryError: Cannot create Messenger, arguments not supported");
  }
};
h.init();
function J(t) {
  return t.split("/").filter(Boolean);
}
function k(t) {
  return J(t).join("/");
}
const R = "KGZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO3ZhciBGPWNsYXNzIGV4dGVuZHMgRXZlbnRUYXJnZXR7Y29uc3RydWN0b3IoKXtzdXBlciguLi5hcmd1bWVudHMpLHRoaXMuX2J1YmJsZU1hcD1uZXcgTWFwfWFzeW5jIHdhaXRGb3IoZSl7cmV0dXJuIG5ldyBQcm9taXNlKHM9Pnt0aGlzLmFkZEV2ZW50TGlzdGVuZXIoZSxzLHtvbmNlOiEwfSl9KX1jYWxsYmFjayhlLHMpe3RoaXMud2FpdEZvcihlKS50aGVuKHI9PnMocikpfWRpc3BhdGNoKGUscyl7dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChlLHM/e2RldGFpbDpzfTp2b2lkIDApKX1saXN0ZW4oZSxzLHIpe3RoaXMuYWRkRXZlbnRMaXN0ZW5lcihlLHMscil9cmVtb3ZlKGUscyxyKXt0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoZSxzLHIpfWxpc3Rlbk9uY2UoZSxzKXt0aGlzLmxpc3RlbihlLHMse29uY2U6ITB9KX1saXN0ZW5PbmNlT25seShlLHMscil7Y29uc3QgYT1uPT57cihuKSYmKHRoaXMucmVtb3ZlKGUsYSkscyhuKSl9O3RoaXMubGlzdGVuKGUsYSl9bGlzdGVuRGVib3VuY2UoZSxzLHI9e3RpbWVvdXQ6MTAwLG1vZGU6Imxhc3QifSl7c3dpdGNoKHIubW9kZSl7Y2FzZSJmaXJzdCI6cmV0dXJuIHRoaXMubGlzdGVuRGVib3VuY2VGaXJzdChlLHMscik7Y2FzZSJsYXN0IjpyZXR1cm4gdGhpcy5saXN0ZW5EZWJvdW5jZUxhc3QoZSxzLHIpfX1saXN0ZW5EZWJvdW5jZUZpcnN0KGUscyxyPXt0aW1lb3V0OjEwMH0pe2xldCBhPTA7dGhpcy5saXN0ZW4oZSxuPT57Y29uc3QgaT1EYXRlLm5vdygpO2ktYT5yLnRpbWVvdXQmJnMobiksYT1pfSxyKX1saXN0ZW5EZWJvdW5jZUxhc3QoZSxzLHI9e3RpbWVvdXQ6MTAwfSl7bGV0IGE7dGhpcy5saXN0ZW4oZSxuPT57Y2xlYXJUaW1lb3V0KGEpLGE9d2luZG93LnNldFRpbWVvdXQoKCk9PnMobiksci50aW1lb3V0KX0scil9ZW5hYmxlQnViYmxlKGUpe2lmKHRoaXMuX2J1YmJsZU1hcC5oYXMoZSkpcmV0dXJuO2NvbnN0IHM9cj0+e3ZhciBhOyhhPXRoaXMucGFyZW50KT09bnVsbHx8YS5kaXNwYXRjaChyLnR5cGUsci5kZXRhaWwpfTt0aGlzLmxpc3RlbihlLHMpLHRoaXMuX2J1YmJsZU1hcC5zZXQoZSxzKX1kaXNhYmxlQnViYmxlKGUpe2lmKCF0aGlzLl9idWJibGVNYXAuaGFzKGUpKXJldHVybjtjb25zdCBzPXRoaXMuX2J1YmJsZU1hcC5nZXQoZSk7dGhpcy5yZW1vdmUoZSxzKSx0aGlzLl9idWJibGVNYXAuZGVsZXRlKGUpfX07ZnVuY3Rpb24gQygpe3JldHVybiBjcnlwdG8ucmFuZG9tVVVJRCgpfXZhciBkPSJwb3N0LXRvZ2V0aGVyIjtmdW5jdGlvbiBMKHQpe3JldHVybiB0LmlkJiZ0LnR5cGUmJnQuX19pZGVudGlmaWVyPT09ZH1mdW5jdGlvbiBXKHQpe3JldHVybiJkYXRhImluIHQmJkwodC5kYXRhKX1mdW5jdGlvbiBtKHQpe2lmKFcodCkpcmV0dXJuIHQuZGF0YX12YXIgZz1jbGFzc3tjb25zdHJ1Y3Rvcih0LGUpe3RoaXMubGlzdGVuRnJvbT10LHRoaXMuc2VuZFRvPWUsdGhpcy5hY3RpdmF0ZWQ9ITAsdGhpcy5saXN0ZW5lcldlYWtNYXA9bmV3IFdlYWtNYXAsdGhpcy5saXN0ZW5lclNldD1uZXcgU2V0fWNyZWF0ZVJlcXVlc3QodCxlKXtyZXR1cm57aWQ6QygpLHR5cGU6dCxwYXlsb2FkOmUsX190eXBlOiJyZXF1ZXN0IixfX2lkZW50aWZpZXI6ZH19Y3JlYXRlUmVzcG9uc2UodCxlKXtjb25zdHtpZDpzLHR5cGU6cixfX2lkZW50aWZpZXI6YX09dDtyZXR1cm57aWQ6cyx0eXBlOnIscGF5bG9hZDplLF9fdHlwZToicmVzcG9uc2UiLF9faWRlbnRpZmllcjphfX1hc3luYyBfaW5qZWN0KHQpe31yZXNwb25zZUNhbGxiYWNrKHQsZSl7Y29uc3Qgcz1hc3luYyByPT57Y29uc3QgYT1tKHIpO2EmJmEuaWQ9PT10LmlkJiZhLnR5cGU9PT10LnR5cGUmJmEuX190eXBlPT09InJlc3BvbnNlIiYmKGF3YWl0IHRoaXMuX2luamVjdChhKSx0aGlzLmxpc3RlbkZyb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIscyksZShhLnBheWxvYWQuZGF0YSxhLnBheWxvYWQudHJhbnNmZXIpKX07cmV0dXJuIHRoaXMubGlzdGVuRnJvbS5hZGRFdmVudExpc3RlbmVyKCJtZXNzYWdlIixzKSwoKT0+dGhpcy5saXN0ZW5Gcm9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoIm1lc3NhZ2UiLHMpfV9nZXRTZW5kVG8odCl7bGV0IGU9dGhpcy5zZW5kVG87aWYodCl7Y29uc3Qgcz10LnNvdXJjZTtzJiYoZT1zKX1yZXR1cm4gZX1hc3luYyBfc2VuZCh0LGUpe2NvbnN0IHM9e3RyYW5zZmVyOnQucGF5bG9hZC50cmFuc2Zlcn07ZigpJiZPYmplY3QuYXNzaWduKHMse3RhcmdldE9yaWdpbjoiKiJ9KSx0aGlzLl9nZXRTZW5kVG8oZSkucG9zdE1lc3NhZ2UodCxzKX1yZXF1ZXN0KHQsZSxzPTVlMyl7cmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jKHIsYSk9Pntjb25zdCBuPXRoaXMuY3JlYXRlUmVxdWVzdCh0LGUpLGk9dGhpcy5yZXNwb25zZUNhbGxiYWNrKG4sKG8sdyk9PnIoe2RhdGE6byx0cmFuc2Zlcjp3fSkpO2F3YWl0IHRoaXMuX3NlbmQobiksc2V0VGltZW91dCgoKT0+e2koKSxhKGBNZXNzZW5nZXJSZXF1ZXN0VGltZW91dEVycm9yOiByZXF1ZXN0IHRpbWVvdXQgcmVhY2hlZDogJHtzfW1zYCl9LHMpfSl9d3JhcE1lc3NhZ2VIYW5kbGVyKHQsZSl7cmV0dXJuIGFzeW5jIHM9Pntjb25zdCByPW0ocyk7aWYociYmci50eXBlPT09dCYmci5fX3R5cGU9PT0icmVxdWVzdCImJnRoaXMuYWN0aXZhdGVkKXthd2FpdCB0aGlzLl9pbmplY3Qocik7Y29uc3QgYT1hd2FpdCBlKHIucGF5bG9hZC5kYXRhLHIucGF5bG9hZC50cmFuc2Zlciksbj10aGlzLmNyZWF0ZVJlc3BvbnNlKHIsYSk7YXdhaXQgdGhpcy5fc2VuZChuLHMpfX19cmVzcG9uc2UodCxlKXtpZih0aGlzLmxpc3RlbmVyU2V0LmhhcyhlKSl0aHJvdyBuZXcgRXJyb3IoIk1lc3NlbmdlckFkZEV2ZW50TGlzdGVuZXJFcnJvcjogdGhpcyBtZXNzYWdlIGhhbmRsZXIgYWxyZWFkeSBhdHRhY2hlZCIpO2NvbnN0IHM9dGhpcy53cmFwTWVzc2FnZUhhbmRsZXIodCxlKTt0aGlzLmxpc3RlbmVyV2Vha01hcC5zZXQoZSxzKSx0aGlzLmxpc3RlbmVyU2V0LmFkZChlKSx0aGlzLmxpc3RlbkZyb20uYWRkRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIscyl9ZGVyZXNwb25zZSh0KXtjb25zdCBlPXQ/W3RdOnRoaXMubGlzdGVuZXJTZXQ7Zm9yKGxldCBzIG9mIGUpe2NvbnN0IHI9dGhpcy5saXN0ZW5lcldlYWtNYXAuZ2V0KHMpO3ImJih0aGlzLmxpc3RlbkZyb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsciksdGhpcy5saXN0ZW5lcldlYWtNYXAuZGVsZXRlKHMpKSx0aGlzLmxpc3RlbmVyU2V0LmRlbGV0ZShzKX19YWN0aXZhdGUoKXt0aGlzLmFjdGl2YXRlZHx8KHRoaXMuYWN0aXZhdGVkPSEwKX1kZWFjdGl2YXRlKCl7dGhpcy5hY3RpdmF0ZWQmJih0aGlzLmFjdGl2YXRlZD0hMSl9fSxPPWNsYXNzIGV4dGVuZHMgZ3tjb25zdHJ1Y3Rvcih0LGUscyl7c3VwZXIodCxlKSx0aGlzLmxpc3RlbkZyb209dCx0aGlzLnNlbmRUbz1lLHRoaXMuc2VuZFRvT3JpZ2luPXN9YXN5bmMgX3NlbmQodCxlKXt0aGlzLl9nZXRTZW5kVG8oZSkucG9zdE1lc3NhZ2UodCx7dHJhbnNmZXI6dC5wYXlsb2FkLnRyYW5zZmVyLHRhcmdldE9yaWdpbjp0aGlzLnNlbmRUb09yaWdpbn0pfX0seT0iaHR0cHM6Ly9mcmVlem0tbHRkLmdpdGh1Yi5pby9wb3N0LXRvZ2V0aGVyL2lmcmFtZS8iLHY9bmV3IFVSTCh5KS5vcmlnaW47ZnVuY3Rpb24gZih0KXtyZXR1cm4gZ2xvYmFsVGhpcy5jb25zdHJ1Y3Rvcj09PWdsb2JhbFRoaXMuV2luZG93Pyh0fHwodD13aW5kb3cub3JpZ2luKSx0PT09dik6ITF9dmFyIE09YCR7ZH06X19zdG9yZWAsXz1gJHtkfTpfX2ZldGNoYCxEPWNsYXNzIGV4dGVuZHMgZ3thc3luYyBfaW5qZWN0KHQpe2lmKHQucGF5bG9hZClyZXR1cm47Y29uc3R7aWQ6ZX09dCxzPWF3YWl0IHUuZmV0Y2goZSk7aWYocy5kYXRhPT09ImVycm9yIil0aHJvdyBuZXcgRXJyb3IoIkJyb2FkY2FzdENoYW5uZWxNZXNzZW5nZXJGZXRjaFBheWxvYWRFcnJvcjogTWVzc2FnZUh1YiBmZXRjaCBmYWlsZWQuIik7dC5wYXlsb2FkPXN9YXN5bmMgX3NlbmQodCl7aWYodC5wYXlsb2FkLnRyYW5zZmVyKXtjb25zdHtwYXlsb2FkOmUsLi4uc309dDtpZigoYXdhaXQgdS5zdG9yZSh0KSkuZGF0YSE9PSJzdWNjZXNzIil0aHJvdyBuZXcgRXJyb3IoIkJyb2FkY2FzdENoYW5uZWxNZXNzZW5nZXJTZW5kRXJyb3I6IE1lc3NhZ2VIdWIgc3RvcmUgZmFpbGVkLiIpO3RoaXMuX2dldFNlbmRUbygpLnBvc3RNZXNzYWdlKHMpfWVsc2UgdGhpcy5fZ2V0U2VuZFRvKCkucG9zdE1lc3NhZ2UodCl9fSxwPWNsYXNzIGV4dGVuZHMgRntjb25zdHJ1Y3Rvcigpe3N1cGVyKCksdGhpcy5zdGF0ZT0ib2ZmIix0aGlzLmxpc3RlbkZyb21zPW5ldyBTZXQsdGhpcy5pbml0KCl9YXN5bmMgaW5pdCgpe2lmKHRoaXMuc3RhdGUhPT0ib24iKXtpZih0aGlzLnN0YXRlPT09ImluaXRpYWxpemluZyIpcmV0dXJuIGF3YWl0IHRoaXMud2FpdEZvcigiZG9uZSIpO3RoaXMuc3RhdGU9ImluaXRpYWxpemluZyIsYXdhaXQgdGhpcy5faW5pdCgpLHRoaXMuc3RhdGU9Im9uIix0aGlzLmRpc3BhdGNoKCJkb25lIil9fWFzeW5jIF9pbml0KCl7fWFzeW5jIHN0b3JlKHQpe2F3YWl0IHRoaXMuaW5pdCgpO2NvbnN0IGU9YXdhaXQgdGhpcy50YXJnZXQucmVxdWVzdChNLHtkYXRhOnQsdHJhbnNmZXI6dC5wYXlsb2FkLnRyYW5zZmVyfSk7aWYoZSYmZS5kYXRhPT09InN1Y2Nlc3MiKXJldHVybiBlO3Rocm93IG5ldyBFcnJvcigiTWVzc2FnZUh1YlN0b3JlRXJyb3I6IE1lc3NhZ0h1YiByZXR1cm5lZCBjb3JydXB0ZWQgb3IgdW5zdWNjZXNzZnVsIHJlc3BvbnNlLiIpfWFzeW5jIGZldGNoKHQpe2F3YWl0IHRoaXMuaW5pdCgpO2NvbnN0IGU9YXdhaXQgdGhpcy50YXJnZXQucmVxdWVzdChfLHtkYXRhOnR9KTtpZihlJiZlLmRhdGEhPT0iZXJyb3IiJiZlLnRyYW5zZmVyKXJldHVybiBlO3Rocm93IG5ldyBFcnJvcigiTWVzc2FnZUh1YkZldGNoRXJyb3I6IE1lc3NhZ0h1YiByZXR1cm5lZCBjb3JydXB0ZWQgb3IgdW5zdWNjZXNzZnVsIHJlc3BvbnNlLiIpfWFzeW5jIGFkZExpc3Rlbih0KXtpZihhd2FpdCB0aGlzLmluaXQoKSx0aGlzLmxpc3RlbkZyb21zLmhhcyh0KSlyZXR1cm47Y29uc3QgZT1jLm5ldyh0KTt0aGlzLmxpc3RlbkZyb21zLmFkZCh0KSxlLnJlc3BvbnNlKE0sYXN5bmMgcz0+YXdhaXQgdGhpcy5zdG9yZShzKSksZS5yZXNwb25zZShfLGFzeW5jIHM9PmF3YWl0IHRoaXMuZmV0Y2gocykpfX0sQj1jbGFzcyBleHRlbmRzIHB7Y29uc3RydWN0b3IoKXtzdXBlciguLi5hcmd1bWVudHMpLHRoaXMuc3RvcmFnZT1uZXcgTWFwfWFzeW5jIF9pbml0KCl7dGhpcy5hZGRMaXN0ZW4oc2VsZil9YXN5bmMgc3RvcmUodCl7cmV0dXJuIHRoaXMuc3RvcmFnZS5zZXQodC5pZCx0LnBheWxvYWQpLHtkYXRhOiJzdWNjZXNzIn19YXN5bmMgZmV0Y2godCl7bGV0IGU9dGhpcy5zdG9yYWdlLmdldCh0KTtyZXR1cm4gZXx8e2RhdGE6ImVycm9yIn19fSxJPWNsYXNzIGV4dGVuZHMgcHthc3luYyBfaW5pdCgpe3RoaXMudGFyZ2V0PWMubmV3KHNlbGYpfX0seD1jbGFzcyBleHRlbmRzIHB7YXN5bmMgX2luaXRTYW1lT3JpZ2luKCl7Z2xvYmFsVGhpcy5uYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5jb250cm9sbGVyPyh0aGlzLnRhcmdldD1jLm5ldyhnbG9iYWxUaGlzLm5hdmlnYXRvci5zZXJ2aWNlV29ya2VyKSx3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKCJsb2FkZW5kIix7dGFyZ2V0T3JpZ2luOiIqIn0pKTooc2V0VGltZW91dCgoKT0+e3dpbmRvdy5sb2NhdGlvbi5hc3NpZ24od2luZG93LmxvY2F0aW9uLmhyZWYpfSwxZTMpLGF3YWl0IG5ldyBQcm9taXNlKCgpPT57fSkpfWFzeW5jIF9pbml0Q3Jvc3NPcmlnaW4oKXtsZXQgdD0hMTtjb25zdCBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImlmcmFtZSIpLHM9cj0+e2Yoci5vcmlnaW4pJiZyLmRhdGE9PT0ibG9hZGVuZCImJih0PSEwLHRoaXMuZGlzcGF0Y2goImlmcmFtZWxvYWRlbmQiKSx3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIscykpfTt3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIscyksZS5zZXRBdHRyaWJ1dGUoInNyYyIseSksZS5zdHlsZS5kaXNwbGF5PSJub25lIixkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGUpLHR8fGF3YWl0IHRoaXMud2FpdEZvcigiaWZyYW1lbG9hZGVuZCIpLHRoaXMudGFyZ2V0PW5ldyBPKHdpbmRvdyxlLmNvbnRlbnRXaW5kb3csdil9YXN5bmMgX2luaXQoKXtmKCk/YXdhaXQgdGhpcy5faW5pdFNhbWVPcmlnaW4oKTphd2FpdCB0aGlzLl9pbml0Q3Jvc3NPcmlnaW4oKSx0aGlzLmFkZExpc3Rlbih3aW5kb3cpfX0sdT1jbGFzcyBse2NvbnN0cnVjdG9yKCl7dGhpcy5jaGFuZ2VIdWIoKX1jaGFuZ2VIdWIoKXtzd2l0Y2goZ2xvYmFsVGhpcy5jb25zdHJ1Y3Rvcil7Y2FzZSBnbG9iYWxUaGlzLlNlcnZpY2VXb3JrZXJHbG9iYWxTY29wZTp0aGlzLmh1Yj1uZXcgQjticmVhaztjYXNlIGdsb2JhbFRoaXMuV2luZG93OnRoaXMuaHViPW5ldyB4O2JyZWFrO2Nhc2UgZ2xvYmFsVGhpcy5EZWRpY2F0ZWRXb3JrZXJHbG9iYWxTY29wZTp0aGlzLmh1Yj1uZXcgSTticmVhaztkZWZhdWx0OnRocm93IG5ldyBFcnJvcigiTWVzc2FnZUh1YkNvbnN0cnVjdEVycm9yOiBDYW5ub3QgY3JlYXRlIE1lc3NhZ2VIdWIgaW5zdGFuY2UgaW4gdGhpcyBzY29wZS4iKX19c3RhdGljIGluaXQoKXtsLl9pbnN0YW5jZXx8KGwuX2luc3RhbmNlPW5ldyBsKX1zdGF0aWMgZ2V0IGluc3RhbmNlKCl7cmV0dXJuIHRoaXMuaW5pdCgpLGwuX2luc3RhbmNlfXN0YXRpYyBhc3luYyBzdG9yZShlKXtyZXR1cm4gdGhpcy5pbnN0YW5jZS5odWIuc3RvcmUoZSl9c3RhdGljIGFzeW5jIGZldGNoKGUpe3JldHVybiB0aGlzLmluc3RhbmNlLmh1Yi5mZXRjaChlKX1zdGF0aWMgYXN5bmMgYWRkTGlzdGVuKGUpe3JldHVybiB0aGlzLmluc3RhbmNlLmh1Yi5hZGRMaXN0ZW4oZSl9fSxjPWNsYXNze2NvbnN0cnVjdG9yKCl7fXN0YXRpYyBuZXcodCl7aWYoIXQpdGhyb3cgbmV3IEVycm9yKCJNZXNzZW5nZXJGYWN0b3J5Tm9PcHRpb25FcnJvcjogQ2Fubm90IGNyZWF0ZSBNZXNzZW5nZXIsIGFyZ3VtZW50ICdvcHRpb24nIGlzIG5vdCBwcm92aWRlZCIpO2xldCBlLHM7c3dpdGNoKHQuY29uc3RydWN0b3Ipe2Nhc2UgZ2xvYmFsVGhpcy5TZXJ2aWNlV29ya2VyOntzPXdpbmRvdy5uYXZpZ2F0b3Iuc2VydmljZVdvcmtlcixlPXQ7YnJlYWt9Y2FzZSBnbG9iYWxUaGlzLlNlcnZpY2VXb3JrZXJDb250YWluZXI6e3M9dCxlPXQuY29udHJvbGxlcjticmVha31jYXNlIGdsb2JhbFRoaXMuU2VydmljZVdvcmtlckdsb2JhbFNjb3BlOntzPXQsZT12b2lkIDA7YnJlYWt9Y2FzZSBnbG9iYWxUaGlzLldvcmtlcjp7cz1lPXQsdS5hZGRMaXN0ZW4odCk7YnJlYWt9Y2FzZSBnbG9iYWxUaGlzLkRlZGljYXRlZFdvcmtlckdsb2JhbFNjb3BlOntzPWU9dDticmVha31jYXNlIGdsb2JhbFRoaXMuV2luZG93Ontjb25zdCByPXQ7cz13aW5kb3csZT1yO2JyZWFrfWNhc2UgZ2xvYmFsVGhpcy5DbGllbnQ6e3M9c2VsZixlPXQ7YnJlYWt9Y2FzZSBnbG9iYWxUaGlzLkJyb2FkY2FzdENoYW5uZWw6e2NvbnN0IHI9dC5uYW1lO3JldHVybiBuZXcgRChuZXcgQnJvYWRjYXN0Q2hhbm5lbChyKSxuZXcgQnJvYWRjYXN0Q2hhbm5lbChyKSl9Y2FzZSBnbG9iYWxUaGlzLk1lc3NhZ2VQb3J0OntzPWU9dDticmVha319aWYocylyZXR1cm4gbmV3IGcocyxlKTt0aHJvdyBuZXcgRXJyb3IoIk1lc3NlbmdlckZhY3RvcnlFcnJvcjogQ2Fubm90IGNyZWF0ZSBNZXNzZW5nZXIsIGFyZ3VtZW50cyBub3Qgc3VwcG9ydGVkIil9fTt1LmluaXQoKTt2YXIgUj1jbGFzcyBleHRlbmRzIEV2ZW50VGFyZ2V0e2NvbnN0cnVjdG9yKCl7c3VwZXIoLi4uYXJndW1lbnRzKSx0aGlzLl9idWJibGVNYXA9bmV3IE1hcH1hc3luYyB3YWl0Rm9yKHQpe3JldHVybiBuZXcgUHJvbWlzZShlPT57dGhpcy5hZGRFdmVudExpc3RlbmVyKHQsZSx7b25jZTohMH0pfSl9Y2FsbGJhY2sodCxlKXt0aGlzLndhaXRGb3IodCkudGhlbihzPT5lKHMpKX1kaXNwYXRjaCh0LGUpe3RoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQodCxlP3tkZXRhaWw6ZX06dm9pZCAwKSl9bGlzdGVuKHQsZSxzKXt0aGlzLmFkZEV2ZW50TGlzdGVuZXIodCxlLHMpfXJlbW92ZSh0LGUscyl7dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHQsZSxzKX1saXN0ZW5PbmNlKHQsZSl7dGhpcy5saXN0ZW4odCxlLHtvbmNlOiEwfSl9bGlzdGVuT25jZU9ubHkodCxlLHMpe2NvbnN0IHI9YT0+e3MoYSkmJih0aGlzLnJlbW92ZSh0LHIpLGUoYSkpfTt0aGlzLmxpc3Rlbih0LHIpfWxpc3RlbkRlYm91bmNlKHQsZSxzPXt0aW1lb3V0OjEwMCxtb2RlOiJsYXN0In0pe3N3aXRjaChzLm1vZGUpe2Nhc2UiZmlyc3QiOnJldHVybiB0aGlzLmxpc3RlbkRlYm91bmNlRmlyc3QodCxlLHMpO2Nhc2UibGFzdCI6cmV0dXJuIHRoaXMubGlzdGVuRGVib3VuY2VMYXN0KHQsZSxzKX19bGlzdGVuRGVib3VuY2VGaXJzdCh0LGUscz17dGltZW91dDoxMDB9KXtsZXQgcj0wO3RoaXMubGlzdGVuKHQsYT0+e2NvbnN0IG49RGF0ZS5ub3coKTtuLXI+cy50aW1lb3V0JiZlKGEpLHI9bn0scyl9bGlzdGVuRGVib3VuY2VMYXN0KHQsZSxzPXt0aW1lb3V0OjEwMH0pe2xldCByO3RoaXMubGlzdGVuKHQsYT0+e2NsZWFyVGltZW91dChyKSxyPXdpbmRvdy5zZXRUaW1lb3V0KCgpPT5lKGEpLHMudGltZW91dCl9LHMpfWVuYWJsZUJ1YmJsZSh0KXtpZih0aGlzLl9idWJibGVNYXAuaGFzKHQpKXJldHVybjtjb25zdCBlPXM9Pnt2YXIgcjsocj10aGlzLnBhcmVudCk9PW51bGx8fHIuZGlzcGF0Y2gocy50eXBlLHMuZGV0YWlsKX07dGhpcy5saXN0ZW4odCxlKSx0aGlzLl9idWJibGVNYXAuc2V0KHQsZSl9ZGlzYWJsZUJ1YmJsZSh0KXtpZighdGhpcy5fYnViYmxlTWFwLmhhcyh0KSlyZXR1cm47Y29uc3QgZT10aGlzLl9idWJibGVNYXAuZ2V0KHQpO3RoaXMucmVtb3ZlKHQsZSksdGhpcy5fYnViYmxlTWFwLmRlbGV0ZSh0KX19O2FzeW5jIGZ1bmN0aW9uIFAodCl7cmV0dXJuIG5ldyBQcm9taXNlKGU9PntzZXRUaW1lb3V0KCgpPT57ZSgpfSx0KX0pfWZ1bmN0aW9uIGIodCl7cmV0dXJuIHQuc3BsaXQoIi8iKS5maWx0ZXIoQm9vbGVhbil9Y29uc3Qgaj0iZWFzeS1vcGZzIjtmdW5jdGlvbiBFKC4uLnQpe3JldHVybmAke2p9OiR7dC5qb2luKCI6Iil9YH1jb25zdCB6PW5ldyBCcm9hZGNhc3RDaGFubmVsKEUoInB1YmxpYy1oZWFkIikpO2Z1bmN0aW9uIEEodCl7cmV0dXJuIG5ldyBCcm9hZGNhc3RDaGFubmVsKEUodCkpfWFzeW5jIGZ1bmN0aW9uIFQodCxlPSExKXtjb25zdCBzPWIodCk7bGV0IHI9YXdhaXQgbmF2aWdhdG9yLnN0b3JhZ2UuZ2V0RGlyZWN0b3J5KCk7Zm9yKGxldCBhPTA7YTxzLmxlbmd0aC0xO2ErKylyPWF3YWl0IHIuZ2V0RGlyZWN0b3J5SGFuZGxlKHNbYV0se2NyZWF0ZTplfSk7cmV0dXJuIHJ9YXN5bmMgZnVuY3Rpb24gJCh0LGU9ITEpe3JldHVybiBhd2FpdChhd2FpdCBUKHQsZSkpLmdldEZpbGVIYW5kbGUoYih0KS5wb3AoKSx7Y3JlYXRlOmV9KX1hc3luYyBmdW5jdGlvbiBVKHQpe3JldHVybiBhd2FpdChhd2FpdCBUKHQpKS5yZW1vdmVFbnRyeShiKHQpLnBvcCgpKX1jbGFzcyBHIGV4dGVuZHMgUntjb25zdHJ1Y3RvcihlKXtzdXBlcigpLHRoaXMuaGFuZGxlTWFwPWUsdGhpcy5jaHVuaz0wLHRoaXMud3JpdHRlbj0wLHRoaXMucGF0aD0iIix0aGlzLnN0YXRlPSJvZmYifWFzeW5jIGluaXQoZSl7dmFyIHM7dHJ5e3JldHVybiB0aGlzLnBhdGg9ZS5wYXRoLHRoaXMuc3RhdGU9ImluaXRpYWxpemluZyIsdGhpcy5oYW5kbGU9YXdhaXQoYXdhaXQgJCh0aGlzLnBhdGgsITApKS5jcmVhdGVTeW5jQWNjZXNzSGFuZGxlKCksdGhpcy53cml0dGVuPXRoaXMuaGFuZGxlLmdldFNpemUoKSx0aGlzLnN0YXRlPSJvbiIsYy5uZXcoeikucmVzcG9uc2UodGhpcy5wYXRoLGE9Pih7ZGF0YTp0aGlzLmhlYWQoKX0pKSx0aGlzLm1lc3Nlbmdlcj1jLm5ldyhBKHRoaXMucGF0aCkpLHRoaXMubWVzc2VuZ2VyLnJlc3BvbnNlKCJoZWFkIixhPT4oe2RhdGE6dGhpcy5oZWFkKCl9KSksdGhpcy5tZXNzZW5nZXIucmVzcG9uc2UoInJlYWQiLGE9Pntjb25zdCBuPXRoaXMucmVhZChhKTtsZXQgaTtyZXR1cm4gbi5vayYmbi5kYXRhJiYoaT1bbi5kYXRhXSkse2RhdGE6bix0cmFuc2ZlcjppfX0pLHRoaXMubWVzc2VuZ2VyLnJlc3BvbnNlKCJ3cml0ZSIsYT0+KHtkYXRhOnRoaXMud3JpdGUoYSl9KSksdGhpcy5tZXNzZW5nZXIucmVzcG9uc2UoImRlbGV0ZSIsYXN5bmMgYT0+KHtkYXRhOmF3YWl0IHRoaXMuZGVsZXRlKGEpfSkpLChzPXRoaXMuaGFuZGxlTWFwKT09bnVsbHx8cy5zZXQodGhpcy5wYXRoLHRoaXMpLHtvazohMH19Y2F0Y2gocil7cmV0dXJue29rOiExLGVycm9yOnJ9fX13cml0ZShlKXtjb25zdCBzPXRoaXMscj10aGlzLmhhbmRsZTtsZXQgYT1lLmF0fHxlLmtlZXBFeGlzdGluZ0RhdGE/dGhpcy53cml0dGVuOjA7Y29uc3Qgbj1lLnNvdXJjZTtpZihuIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpcmV0dXJuIHIud3JpdGUobix7YXQ6YX0pLHIuZmx1c2goKSx7b2s6ITB9O2NvbnN0IGk9bmV3IFdyaXRhYmxlU3RyZWFtKHt3cml0ZShvKXtyLndyaXRlKG8se2F0OmF9KSxhKz1vLmxlbmd0aCxzLndyaXR0ZW48YSYmKHMud3JpdHRlbj1hKX0sY2xvc2UoKXtyLmZsdXNoKCl9LGFib3J0KCl7ci5mbHVzaCgpfX0pO3JldHVybiBuLnBpcGVUbyhpKSx7b2s6ITB9fXJlYWQoZSl7Y29uc3Qgcz1lLmF0fHwwLHI9ZS5sZW5ndGh8fHRoaXMud3JpdHRlbi1zLGE9citzLG49dGhpcy5oYW5kbGUsaT10aGlzO2xldCBvPXM7aWYoIWUuc2luayYmZS5ub1N0cmVhbSl7Y29uc3QgaD1uZXcgQXJyYXlCdWZmZXIocik7cmV0dXJuIG4ucmVhZChoLHthdDpvfSkse29rOiEwLGRhdGE6aH19Y29uc3Qgdz1uZXcgUmVhZGFibGVTdHJlYW0oe2FzeW5jIHN0YXJ0KGgpe3RyeXtmb3IoO288YTspe2lmKG8+PWkud3JpdHRlbil7YXdhaXQgUCgxMDApO2NvbnRpbnVlfWNvbnN0IFM9TWF0aC5taW4oTWF0aC5taW4oaS53cml0dGVuLGEpLW8sMTAqMTAyNCoxMDI0KSxIPW5ldyBVaW50OEFycmF5KFMpO24ucmVhZChILmJ1ZmZlcix7YXQ6b30pLGguZW5xdWV1ZShIKSxvKz1TfX1maW5hbGx5e2guY2xvc2UoKX19fSk7cmV0dXJuIGUuc2luaz8ody5waXBlVG8oZS5zaW5rKSx7b2s6ITB9KTp7b2s6ITAsZGF0YTp3fX1oZWFkKCl7cmV0dXJue29rOiEwLHNpemU6dGhpcy53cml0dGVufX1hc3luYyBkZWxldGUoZSl7dmFyIHM7dHJ5e3JldHVybiB0aGlzLmhhbmRsZS5jbG9zZSgpLHRoaXMubWVzc2VuZ2VyLmRlcmVzcG9uc2UoKSwocz10aGlzLmhhbmRsZU1hcCk9PW51bGx8fHMuZGVsZXRlKHRoaXMucGF0aCksZS5vbmx5SGFuZGxlfHxhd2FpdCBVKHRoaXMucGF0aCkse29rOiEwfX1jYXRjaChyKXtyZXR1cm57b2s6ITEsZXJyb3I6cn19fX1jb25zdCBrPW5ldyBNYXA7YXN5bmMgZnVuY3Rpb24gTih0KXtyZXR1cm4gay5oYXModC5wYXRoKT97b2s6ITB9OmF3YWl0IG5ldyBHKGspLmluaXQodCl9Yy5uZXcoc2VsZikucmVzcG9uc2UoImFkZCIsYXN5bmMgdD0+KHtkYXRhOmF3YWl0IE4odCl9KSl9KSgpOwo=", S = (t) => Uint8Array.from(atob(t), (e) => e.charCodeAt(0)), W = typeof self < "u" && self.Blob && new Blob([S(R)], { type: "text/javascript;charset=utf-8" });
function x(t) {
  let e;
  try {
    if (e = W && (self.URL || self.webkitURL).createObjectURL(W), !e) throw "";
    const a = new Worker(e, {
      name: t == null ? void 0 : t.name
    });
    return a.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), a;
  } catch {
    return new Worker(
      "data:text/javascript;base64," + R,
      {
        name: t == null ? void 0 : t.name
      }
    );
  } finally {
    e && (self.URL || self.webkitURL).revokeObjectURL(e);
  }
}
const C = "easy-opfs";
function V(...t) {
  return `${C}:${t.join(":")}`;
}
const v = new BroadcastChannel(V("public-head"));
function T(t) {
  return new BroadcastChannel(V(t));
}
class d {
  constructor() {
    this.worker = new x(), this.workerMessenger = r.new(this.worker), this.broadcastMessenger = r.new(v);
  }
  static get instance() {
    return d._instance || (d._instance = new d()), d._instance;
  }
  static async checkHandle(e) {
    return (await this.instance.broadcastMessenger.request(e, { data: void 0 })).data.ok;
  }
  static async addHandle(e) {
    const a = (await this.instance.workerMessenger.request("add", { data: e })).data;
    if (a.ok) return a;
    const s = (await this.instance.broadcastMessenger.request(e.path, { data: void 0 })).data;
    if (s.ok) return s;
    throw new Error("OpfsWorkerAddHandleError: Cannot create/request OpfsHandle.");
  }
  static async deleteHandle(e) {
    const a = (await this.instance.workerMessenger.request("delete", { data: e })).data;
    if (a.ok) return a;
    throw new Error("OpfsWorkerDeleteHandleError: Cannot delete OpfsHandle.");
  }
}
class j extends I {
  constructor(e) {
    super(), this.state = "off", this.path = k(e), this.messenger = r.new(T(this.path)), this.init();
  }
  async _init() {
    this.state = "initializing", await d.addHandle({ path: this.path }), this.state = "on", this.dispatch("done");
  }
  async init() {
    if (this.state !== "on") {
      if (this.state === "initializing") return await this.waitFor("done");
      if (this.state === "off") return await this._init();
    }
  }
  _read(e, a) {
    const { readable: s, writable: l } = new TransformStream({
      transform(i, n) {
        n.enqueue(i), e += i.length, a && (a -= i.length);
      }
    });
    return (async () => {
      for (; ; )
        try {
          const i = await this.messenger.request("read", { data: { at: e, length: a } });
          if (!i.data.ok) throw new Error("OpfsFileReadError: OpfsWorker returned error: ", i.data.error);
          await i.data.data.pipeTo(l, { preventClose: !0, preventAbort: !0, preventCancel: !0 }), await l.close();
          break;
        } catch {
          await this._init();
        }
    })(), s;
  }
  async read(e = 0, a) {
    return await this.init(), this._read(e, a);
  }
  async _write(e, a) {
    for (; ; )
      try {
        const s = await this.messenger.request("write", { data: { source: e, at: a } });
        if (!s.data.ok) throw new Error("OpfsFileWriteError: OpfsWorker returned error: ", s.data.error);
        e.transfer(0);
        return;
      } catch {
        await this._init();
      }
  }
  async write(e, a, s) {
    if (await this.init(), a || (s ? a = (await this.messenger.request("head", { data: void 0 })).data.size : a = 0), e instanceof ArrayBuffer)
      return await this._write(e, a);
    const l = this;
    let c = a;
    const i = new WritableStream({
      async write(n) {
        await l._write(n.buffer, c), c += n.length;
      }
    });
    await e.pipeTo(i);
  }
  async delete() {
    return await this.messenger.request("delete", { data: { path: this.path } });
  }
  // utils
  async writeText(e) {
    const a = new TextEncoder().encode(e);
    await this.write(a.buffer);
  }
  async readText() {
    const e = await this.read();
    return await new Response(e).text();
  }
}
export {
  j as OpfsFile
};