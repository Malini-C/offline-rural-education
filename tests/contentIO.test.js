import { describe, it, expect } from "vitest";
import {
  parseLessonsJson,
  lessonsToJson,
  makeExportFile,
} from "../src/utils/contentIO.js";

const goodLesson = {
  lessonId: "science-test-1",
  language: "en",
  subject: "science",
  grade: "7",
  difficulty: "beginner",
  title: "Test lesson",
  summary: "A summary long enough to pass validation.",
  body: "A body long enough to pass validation because it exceeds twenty characters easily.",
  examples: [],
  practiceQuestions: [],
};

describe("parseLessonsJson", () => {
  it("accepts an array", () => {
    const result = parseLessonsJson(JSON.stringify([goodLesson]));
    expect(result.valid).toBe(true);
    expect(result.lessons).toHaveLength(1);
  });

  it("accepts an object with a lessons array", () => {
    const result = parseLessonsJson(JSON.stringify({ lessons: [goodLesson] }));
    expect(result.valid).toBe(true);
    expect(result.lessons).toHaveLength(1);
  });

  it("rejects invalid JSON", () => {
    const result = parseLessonsJson("{ not json");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Invalid JSON/);
  });

  it("rejects an object with no lessons array", () => {
    const result = parseLessonsJson(JSON.stringify({ other: 1 }));
    expect(result.valid).toBe(false);
  });

  it("rejects a lesson missing required fields", () => {
    const bad = { ...goodLesson, title: "" };
    const result = parseLessonsJson(JSON.stringify([bad]));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/title/);
  });

  it("rejects a lesson with an unsupported language", () => {
    const bad = { ...goodLesson, language: "fr" };
    const result = parseLessonsJson(JSON.stringify([bad]));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/language/);
  });
});

describe("lessonsToJson", () => {
  it("round-trips a valid lesson list", () => {
    const text = lessonsToJson([goodLesson]);
    const parsed = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].lessonId).toBe("science-test-1");
  });

  it("produces deterministic output", () => {
    const a = lessonsToJson([goodLesson]);
    const b = lessonsToJson([goodLesson]);
    expect(a).toBe(b);
  });
});

describe("makeExportFile", () => {
  it("produces a filename with a timestamp", () => {
    const file = makeExportFile(
      { progress: [], bookmarks: [], quizAttempts: [] },
      new Date("2026-10-23T12:34:56Z"),
    );
    expect(file.filename).toMatch(/^rurallearn-progress-\d{8}-\d{6}\.json$/);
    expect(file.payload.appVersion).toBe(1);
    expect(file.payload.exportedAt).toBe("2026-10-23T12:34:56.000Z");
  });
});
