import { describe, it, expect } from "vitest";
import { searchLessons } from "../src/utils/searchLessons.js";

const lessons = [
  {
    recordId: "a::en",
    lessonId: "a",
    language: "en",
    subject: "science",
    difficulty: "beginner",
    title: "Photosynthesis",
    summary: "How plants make food.",
    body: "Plants use sunlight to convert carbon dioxide and water into glucose.",
    examples: ["Leaf in sunlight produces oxygen."],
  },
  {
    recordId: "b::en",
    lessonId: "b",
    language: "en",
    subject: "mathematics",
    difficulty: "intermediate",
    title: "Fractions",
    summary: "Parts of a whole.",
    body: "A fraction is a numerator over a denominator.",
    examples: ["1/2 is half of a pizza."],
  },
];

describe("searchLessons", () => {
  it('returns everything when query is empty and filters are "all"', () => {
    expect(searchLessons(lessons)).toHaveLength(2);
  });

  it("matches case-insensitively in title", () => {
    expect(searchLessons(lessons, { query: "PHOTO" })).toHaveLength(1);
    expect(searchLessons(lessons, { query: "photo" })[0].lessonId).toBe("a");
  });

  it("matches in body text", () => {
    const result = searchLessons(lessons, { query: "sunlight" });
    expect(result).toHaveLength(1);
    expect(result[0].lessonId).toBe("a");
  });

  it("applies subject and difficulty filters together", () => {
    const result = searchLessons(lessons, {
      subject: "mathematics",
      difficulty: "intermediate",
    });
    expect(result).toHaveLength(1);
    expect(result[0].lessonId).toBe("b");
  });

  it("returns empty when nothing matches", () => {
    expect(searchLessons(lessons, { query: "quantum" })).toHaveLength(0);
  });

  it("ignores whitespace-only queries", () => {
    expect(searchLessons(lessons, { query: "   " })).toHaveLength(2);
  });
});
