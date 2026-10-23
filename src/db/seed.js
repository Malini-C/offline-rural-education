import { getDB, STORE_META, STORE_LESSONS, STORE_QUIZZES } from "./database.js";
import { putLessons } from "./lessonsRepository.js";
import { putQuizzes } from "./quizRepository.js";
import { validateLessonBatch } from "./schemas/lessonSchema.js";
import lessonsEn from "../data/seed/lessons-en.json";
import lessonsTa from "../data/seed/lessons-ta.json";
import quizzes from "../data/seed/quizzes.json";

// Bump this whenever the seed JSON changes so the app re-imports the new data.
export const SEED_VERSION = 1;

export async function ensureSeedLoaded() {
  const db = await getDB();

  const existingMeta = await db.get(STORE_META, "seedVersion");
  if (existingMeta?.value === SEED_VERSION) {
    return { loaded: false, reason: "up-to-date" };
  }

  const allLessons = [...lessonsEn, ...lessonsTa];
  const validation = validateLessonBatch(allLessons);
  if (!validation.valid) {
    throw new Error(
      "Seed lessons failed validation: " + validation.errors.join(" | "),
    );
  }

  // Use a single write transaction across lessons + quizzes + meta so a
  // failure leaves the database in a consistent state.
  await putLessons(allLessons);
  await putQuizzes(quizzes);

  await db.put(STORE_META, { key: "seedVersion", value: SEED_VERSION });
  await db.put(STORE_META, {
    key: "seedLoadedAt",
    value: new Date().toISOString(),
  });

  const lessonCount = await db.count(STORE_LESSONS);
  const quizCount = await db.count(STORE_QUIZZES);
  return { loaded: true, reason: "seeded", lessonCount, quizCount };
}

// Used by tests: read the seed version currently stored, if any.
export async function getSeedVersion() {
  const db = await getDB();
  const meta = await db.get(STORE_META, "seedVersion");
  return meta?.value ?? null;
}
