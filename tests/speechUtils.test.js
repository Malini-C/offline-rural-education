import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetModules();
  delete globalThis.window?.speechSynthesis;
});

describe("speechUtils without SpeechSynthesis support", () => {
  it("reports SPEECH_SUPPORTED as false", async () => {
    const mod = await import("../src/utils/speechUtils.js");
    expect(mod.SPEECH_SUPPORTED).toBe(false);
  });

  it("returns unsupported reason when speaking", async () => {
    const mod = await import("../src/utils/speechUtils.js");
    const result = mod.speak("Hello", "en");
    expect(result).toEqual({ ok: false, reason: "unsupported" });
  });

  it("does not throw when stopping", async () => {
    const mod = await import("../src/utils/speechUtils.js");
    expect(() => mod.stopSpeaking()).not.toThrow();
  });
});

describe("speechUtils with SpeechSynthesis present but no voices", () => {
  beforeEach(() => {
    vi.resetModules();
    globalThis.window = globalThis.window ?? {};
    globalThis.window.speechSynthesis = {
      getVoices: () => [],
      speak: vi.fn(),
      cancel: vi.fn(),
      speaking: false,
    };
    globalThis.window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
  });

  it("returns no-voice when the language has no installed voice", async () => {
    const mod = await import("../src/utils/speechUtils.js");
    const result = mod.speak("வணக்கம்", "ta");
    expect(result).toEqual({ ok: false, reason: "no-voice" });
  });
});
