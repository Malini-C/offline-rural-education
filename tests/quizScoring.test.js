import { describe, it, expect } from "vitest";
import { scoreQuiz, scorePercent } from "../src/utils/quizScoring.js";

const quiz = {
  quizId: "quiz-1",
  questions: [
    { questionId: "q1", prompt: "A", options: ["x", "y"], correctIndex: 1 },
    { questionId: "q2", prompt: "B", options: ["x", "y"], correctIndex: 0 },
  ],
};

describe("scoreQuiz", () => {
  it("scores all correct", () => {
    const r = scoreQuiz(quiz, [1, 0]);
    expect(r.score).toBe(2);
    expect(r.totalQuestions).toBe(2);
    expect(r.allAnswered).toBe(true);
    expect(r.perQuestion.every((p) => p.isCorrect)).toBe(true);
  });

  it("scores all wrong", () => {
    const r = scoreQuiz(quiz, [0, 1]);
    expect(r.score).toBe(0);
    expect(r.allAnswered).toBe(true);
  });

  it("treats null answers as unanswered and incorrect", () => {
    const r = scoreQuiz(quiz, [1, null]);
    expect(r.score).toBe(1);
    expect(r.allAnswered).toBe(false);
    expect(r.perQuestion[1].answered).toBe(false);
    expect(r.perQuestion[1].isCorrect).toBe(false);
  });

  it("treats a shorter answers array as unanswered for the remaining questions", () => {
    const r = scoreQuiz(quiz, [1]);
    expect(r.score).toBe(1);
    expect(r.allAnswered).toBe(false);
  });

  it("handles an invalid quiz gracefully", () => {
    const r = scoreQuiz(null, []);
    expect(r.score).toBe(0);
    expect(r.totalQuestions).toBe(0);
    expect(r.perQuestion).toEqual([]);
    expect(r.allAnswered).toBe(false);
  });
});

describe("scorePercent", () => {
  it("returns an integer percentage", () => {
    expect(scorePercent(1, 3)).toBe(33);
    expect(scorePercent(2, 2)).toBe(100);
    expect(scorePercent(0, 5)).toBe(0);
  });

  it("returns 0 for a zero or negative total", () => {
    expect(scorePercent(0, 0)).toBe(0);
    expect(scorePercent(1, 0)).toBe(0);
  });
});
