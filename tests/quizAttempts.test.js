import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { clearAllData } from "../src/db/database.js";
import { recordAttempt, getAllAttempts } from "../src/db/quizRepository.js";

describe("quiz attempts persistence", () => {
  beforeEach(async () => {
    await clearAllData();
  });

  it("records each attempt with a distinct id", async () => {
    const first = await recordAttempt({
      quizId: "quiz-a",
      lessonGroupId: "lesson-a",
      language: "en",
      answers: [1, 0],
      score: 2,
      totalQuestions: 2,
    });
    const second = await recordAttempt({
      quizId: "quiz-a",
      lessonGroupId: "lesson-a",
      language: "en",
      answers: [0, 0],
      score: 1,
      totalQuestions: 2,
    });
    expect(first.attemptId).not.toBe(second.attemptId);
    const all = await getAllAttempts();
    expect(all).toHaveLength(2);
  });

  it("preserves the answers array and score", async () => {
    await recordAttempt({
      quizId: "quiz-b",
      lessonGroupId: "lesson-b",
      language: "ta",
      answers: [2, null, 1],
      score: 1,
      totalQuestions: 3,
    });
    const [stored] = await getAllAttempts();
    expect(stored.answers).toEqual([2, null, 1]);
    expect(stored.score).toBe(1);
    expect(stored.language).toBe("ta");
  });
});
