// Regression tests for bugs found during development.
// Each test corresponds to a real defect fixed in an earlier phase.
// If any of these fails in the future, it means that defect has returned.

import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { tokenizeTamil, tokenizeEnglish } from "../src/ai/textProcessor.js";
import { answerQuestion } from "../src/ai/retrievalEngine.js";
import { clearAllData } from "../src/db/database.js";
import { putLesson, getLessonByRecordId } from "../src/db/lessonsRepository.js";
import lessonsEn from "../src/data/seed/lessons-en.json";
import lessonsTa from "../src/data/seed/lessons-ta.json";

describe("Regression: Tamil tokenization preserves whole words (Phase 7)", () => {
  // Bug: the original TOKEN_BOUNDARY regex used [^\p{L}\p{N}]+ and split
  // Tamil words at every combining vowel sign, producing fragments like
  // 'ஒள'. Fix: added \p{M} to the negated character class.

  it("does not split a Tamil word at combining marks", () => {
    const tokens = tokenizeTamil("ஒளிச்சேர்க்கை");
    expect(tokens).toContain("ஒளிச்சேர்க்கை");
    // Guard against the specific broken form observed before the fix.
    expect(tokens).not.toEqual(["ஒள"]);
  });

  it("preserves Tamil word integrity in a multi-word sentence", () => {
    const tokens = tokenizeTamil("தாவரங்கள் ஒளிச்சேர்க்கை செய்கின்றன");
    expect(tokens.length).toBeGreaterThanOrEqual(2);
    for (const t of tokens) {
      // A token should not be a single combining mark or a two-character
      // fragment that is really the prefix of a longer word.
      expect(t.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("Regression: uncovered English queries are refused (Phase 7)", () => {
  // Bug: BM25 returned "answer" for "How do neural networks backpropagate
  // gradients?" because the word "networks" matched the internet lesson.
  // Fix: added the coverage check requiring at least 50% of query tokens.

  it("refuses a query that only incidentally matches one token", () => {
    const result = answerQuestion(
      "How do neural networks backpropagate gradients?",
      lessonsEn,
      "en",
    );
    expect(result.type).toBe("not-found");
  });

  it("still answers a query that is well covered", () => {
    const result = answerQuestion("What is photosynthesis?", lessonsEn, "en");
    expect(result.type).toBe("answer");
    expect(result.lesson.lessonId).toBe("science-photosynthesis");
  });
});

describe("Regression: lesson repository file is plural (Phase 4)", () => {
  // Bug: file was named lessonRepository.js (singular) while the import
  // was for lessonsRepository.js (plural). Fix: renamed the file.

  it("getLessonByRecordId resolves and round-trips a record", async () => {
    await clearAllData();
    const sample = {
      lessonId: "regression-lesson",
      language: "en",
      subject: "science",
      grade: "7",
      difficulty: "beginner",
      title: "Regression sample",
      summary: "Sample summary.",
      body: "Sample body long enough to satisfy the validator requirement.",
      examples: [],
      practiceQuestions: [],
    };
    await putLesson(sample);
    const read = await getLessonByRecordId("regression-lesson", "en");
    expect(read).toBeTruthy();
    expect(read.title).toBe("Regression sample");
  });
});

describe("Regression: Tamil assistant does not return English content (Phase 7)", () => {
  // Bug: initially the assistant returned cross-language answers.
  // Fix: language-filtered retrieval; each library is tokenized in its
  // own language, and lessons were filtered by language before retrieval.

  it("a Tamil query against the Tamil library returns a Tamil lesson", () => {
    const result = answerQuestion(
      "ஒளிச்சேர்க்கை என்றால் என்ன?",
      lessonsTa,
      "ta",
    );
    expect(result.type).toBe("answer");
    expect(result.lesson.language).toBe("ta");
  });

  it("an English query against the English library returns an English lesson", () => {
    const result = answerQuestion("What is photosynthesis?", lessonsEn, "en");
    expect(result.type).toBe("answer");
    expect(result.lesson.language).toBe("en");
  });
});

describe("Regression: English tokenization still filters stopwords (Phase 7)", () => {
  // Guard against accidentally weakening the English stopword list
  // while fixing the Tamil tokenizer.

  it('removes "what", "is", and "the"', () => {
    const tokens = tokenizeEnglish("What is the process of photosynthesis?");
    expect(tokens).not.toContain("what");
    expect(tokens).not.toContain("the");
    expect(tokens).not.toContain("is");
    expect(tokens).toContain("photosynthesis");
  });
});
