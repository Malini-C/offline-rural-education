import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { clearAllData } from "../src/db/database.js";
import {
  ensureSeedLoaded,
  getSeedVersion,
  SEED_VERSION,
} from "../src/db/seed.js";
import { countLessons, getAllLessons } from "../src/db/lessonsRepository.js";
import { getAllQuizzes } from "../src/db/quizRepository.js";

describe("Seed loader", () => {
  beforeEach(async () => {
    await clearAllData();
  });

  it("loads seed data on first run", async () => {
    const result = await ensureSeedLoaded();
    expect(result.loaded).toBe(true);
    expect(await countLessons()).toBeGreaterThan(0);
    expect((await getAllQuizzes()).length).toBeGreaterThan(0);
    expect(await getSeedVersion()).toBe(SEED_VERSION);
  });

  it("does not duplicate on second run", async () => {
    await ensureSeedLoaded();
    const countAfterFirst = await countLessons();
    const second = await ensureSeedLoaded();
    expect(second.loaded).toBe(false);
    expect(await countLessons()).toBe(countAfterFirst);
  });

  it("loads both English and Tamil lessons", async () => {
    await ensureSeedLoaded();
    const lessons = await getAllLessons();
    const languages = new Set(lessons.map((l) => l.language));
    expect(languages.has("en")).toBe(true);
    expect(languages.has("ta")).toBe(true);
  });
});
