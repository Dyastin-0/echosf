import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// required for svelte5 + jsdom as jsdom does not support matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  enumerable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// polyfill for svelte transitions (jsdom lacks Web Animations API)
if (!Element.prototype.animate) {
  Element.prototype.animate = () => ({
    play: vi.fn(),
    pause: vi.fn(),
    finish: vi.fn(),
    cancel: vi.fn(),
    reverse: vi.fn(),
    playbackRate: 1,
    currentTime: 0,
    startTime: 0,
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    playState: "finished",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onfinish: null,
    oncancel: null,
    persist: vi.fn(),
  });
}

// polyfill for RTCPeerConnection used by webrtc service
globalThis.RTCPeerConnection = class {
  createDataChannel() { return {}; }
  createOffer() { return Promise.resolve({ type: "offer", sdp: "" }); }
  createAnswer() { return Promise.resolve({ type: "answer", sdp: "" }); }
  setLocalDescription() { return Promise.resolve(); }
  setRemoteDescription() { return Promise.resolve(); }
  addTrack() { return {}; }
  addTransceiver() { return {}; }
  getTransceivers() { return []; }
  close() {}
  static getDefaultIceServers() { return []; }
  static generateCertificate() { return Promise.resolve({}); }
};
globalThis.MediaStream = class {
  constructor() { this.id = "mock-stream"; }
  getTracks() { return []; }
  getAudioTracks() { return []; }
  getVideoTracks() { return []; }
  addTrack() {}
  removeTrack() {}
  clone() { return new globalThis.MediaStream(); }
};
globalThis.MediaStreamTrack = class {
  constructor() {
    this.id = "mock-track";
    this.kind = "video";
    this.enabled = true;
    this.muted = false;
    this.readyState = "live";
  }
  stop() {}
};
