import { describe, it, expect } from "vitest";
import { answerQuestion, retrieveLessons } from "../src/ai/retrievalEngine.js";
import lessonsEn from "../src/data/seed/lessons-en.json";
import lessonsTa from "../src/data/seed/lessons-ta.json";

describe("retrieveLessons (English)", () => {
  it("ranks photosynthesis first for a photosynthesis query", () => {
    const ranked = retrieveLessons("What is photosynthesis?", lessonsEn, "en");
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].lesson.lessonId).toBe("science-photosynthesis");
  });

  it("ranks fractions first for a fractions query", () => {
    const ranked = retrieveLessons("How do I add fractions?", lessonsEn, "en");
    expect(ranked[0].lesson.lessonId).toBe("mathematics-fractions");
  });

  it("returns an empty list for an off-topic query", () => {
    const ranked = retrieveLessons(
      "quantum chromodynamics lattice",
      lessonsEn,
      "en",
    );
    expect(ranked).toEqual([]);
  });
});

describe("answerQuestion (English)", () => {
  it("answers a well-covered question with source", () => {
    const result = answerQuestion("What is photosynthesis?", lessonsEn, "en");
    expect(result.type).toBe("answer");
    expect(result.lesson.lessonId).toBe("science-photosynthesis");
    expect(result.passage.length).toBeGreaterThan(0);
  });

  it("refuses to answer an uncovered question", () => {
    const result = answerQuestion(
      "How do neural networks backpropagate gradients?",
      lessonsEn,
      "en",
    );
    expect(result.type).toBe("not-found");
  });

  it("refuses an empty query", () => {
    const result = answerQuestion("   ", lessonsEn, "en");
    expect(result.type).toBe("empty-query");
  });
});

describe("answerQuestion (Tamil)", () => {
  it("answers a Tamil photosynthesis question from the Tamil lessons", () => {
    const result = answerQuestion(
      "ஒளிச்சேர்க்கை என்றால் என்ன?",
      lessonsTa,
      "ta",
    );
    expect(result.type).toBe("answer");
    expect(result.lesson.lessonId).toBe("science-photosynthesis");
    expect(result.lesson.language).toBe("ta");
  });

  it("does not return an English lesson when the Tamil library is queried", () => {
    const result = answerQuestion(
      "ஒளிச்சேர்க்கை என்றால் என்ன?",
      lessonsTa,
      "ta",
    );
    if (result.type === "answer") {
      expect(result.lesson.language).toBe("ta");
    }
  });

  it("refuses a Tamil question outside the library", () => {
    const result = answerQuestion(
      "குவாண்டம் இயற்பியல் பற்றி கூறுங்கள்",
      lessonsTa,
      "ta",
    );
    expect(result.type).toBe("not-found");
  });
});
