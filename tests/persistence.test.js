import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { clearAllData, getDB } from "../src/db/database.js";
import {
  putLesson,
  getLessonByRecordId,
  countLessons,
} from "../src/db/lessonsRepository.js";
import {
  markLessonViewed,
  markLessonCompleted,
  getLessonProgress,
} from "../src/db/progressRepository.js";
import { recordAttempt, getAllAttempts } from "../src/db/quizRepository.js";

const sampleLesson = {
  lessonId: "test-lesson",
  language: "en",
  subject: "science",
  grade: "7",
  difficulty: "beginner",
  title: "Test lesson",
  summary: "A short lesson used in automated tests.",
  body: "This body is long enough to pass validation because it exceeds twenty characters.",
  examples: [],
  practiceQuestions: [],
};

describe("IndexedDB persistence", () => {
  beforeEach(async () => {
    await clearAllData();
    const db = await getDB();
    expect(db).toBeTruthy();
  });

  it("stores and reads back a lesson", async () => {
    await putLesson(sampleLesson);
    const read = await getLessonByRecordId("test-lesson", "en");
    expect(read).toBeTruthy();
    expect(read.title).toBe("Test lesson");
    expect(await countLessons()).toBe(1);
  });

  it("tracks lesson progress across multiple views", async () => {
    await markLessonViewed("test-lesson");
    await markLessonViewed("test-lesson");
    let record = await getLessonProgress("test-lesson");
    expect(record.viewedCount).toBe(2);
    expect(record.completed).toBe(false);

    await markLessonCompleted("test-lesson");
    record = await getLessonProgress("test-lesson");
    expect(record.completed).toBe(true);
    expect(record.viewedCount).toBe(2);
  });

  it("appends quiz attempts without duplicating", async () => {
    await recordAttempt({
      quizId: "quiz-a",
      lessonGroupId: "lesson-a",
      language: "en",
      answers: [1, 0],
      score: 1,
      totalQuestions: 2,
    });
    await recordAttempt({
      quizId: "quiz-a",
      lessonGroupId: "lesson-a",
      language: "en",
      answers: [1, 2],
      score: 2,
      totalQuestions: 2,
    });
    const attempts = await getAllAttempts();
    expect(attempts).toHaveLength(2);
    expect(attempts[0].attemptId).not.toBe(attempts[1].attemptId);
  });
});
