import { describe, it, expect } from "vitest";
import {
  tokenizeEnglish,
  tokenizeTamil,
  tokenize,
} from "../src/ai/textProcessor.js";

describe("tokenizeEnglish", () => {
  it("lowercases and removes English stopwords", () => {
    const tokens = tokenizeEnglish("What is the process of photosynthesis?");
    expect(tokens).toContain("process");
    expect(tokens).toContain("photosynthesis");
    expect(tokens).not.toContain("what");
    expect(tokens).not.toContain("the");
    expect(tokens).not.toContain("is");
  });

  it("drops single-character tokens", () => {
    const tokens = tokenizeEnglish("a b c plant");
    expect(tokens).toEqual(["plant"]);
  });
});

describe("tokenizeTamil", () => {
  it("splits Tamil text on non-letter boundaries", () => {
    const tokens = tokenizeTamil("ஒளிச்சேர்க்கை என்பது என்ன?");
    expect(tokens.length).toBeGreaterThan(0);
    // "என்பது" and "என்ன" are stopwords, so only ஒளிச்சேர்க்கை should remain.
    expect(tokens).toContain("ஒளிச்சேர்க்கை");
    expect(tokens).not.toContain("என்பது");
    expect(tokens).not.toContain("என்ன");
  });

  it("normalises to NFC so combining marks compare equal", () => {
    // Same word, one precomposed and one decomposed.
    const precomposed = "தமிழ்";
    const decomposed = precomposed.normalize("NFD");
    expect(tokenizeTamil(precomposed)).toEqual(tokenizeTamil(decomposed));
  });
});

describe("tokenize dispatch", () => {
  it("routes ta to Tamil tokenization", () => {
    expect(tokenize("ஒளிச்சேர்க்கை", "ta")).toEqual(
      tokenizeTamil("ஒளிச்சேர்க்கை"),
    );
  });

  it("defaults to English for unknown languages", () => {
    expect(tokenize("Photosynthesis", "hi")).toEqual(
      tokenizeEnglish("Photosynthesis"),
    );
  });
});
