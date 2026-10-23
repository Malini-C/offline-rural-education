import { getDB, STORE_PROGRESS, STORE_BOOKMARKS } from "./database.js";

// Lesson progress is tracked per lessonId, NOT per language.
// Viewing the English version of a lesson counts as viewing the lesson.
export async function markLessonViewed(lessonId) {
  const db = await getDB();
  const now = new Date().toISOString();
  const existing = await db.get(STORE_PROGRESS, lessonId);
  const record = {
    lessonId,
    firstViewedAt: existing?.firstViewedAt ?? now,
    lastViewedAt: now,
    viewedCount: (existing?.viewedCount ?? 0) + 1,
    completed: existing?.completed ?? false,
  };
  await db.put(STORE_PROGRESS, record);
  return record;
}

export async function markLessonCompleted(lessonId) {
  const db = await getDB();
  const now = new Date().toISOString();
  const existing = await db.get(STORE_PROGRESS, lessonId);
  const record = {
    lessonId,
    firstViewedAt: existing?.firstViewedAt ?? now,
    lastViewedAt: now,
    viewedCount: existing?.viewedCount ?? 0,
    completed: true,
  };
  await db.put(STORE_PROGRESS, record);
  return record;
}

export async function getLessonProgress(lessonId) {
  const db = await getDB();
  return db.get(STORE_PROGRESS, lessonId);
}

export async function getAllProgress() {
  const db = await getDB();
  return db.getAll(STORE_PROGRESS);
}

export async function getRecentlyViewed(limit = 5) {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE_PROGRESS, "by_lastViewedAt");
  return all.reverse().slice(0, limit);
}

export async function addBookmark(lessonId) {
  const db = await getDB();
  await db.put(STORE_BOOKMARKS, {
    lessonId,
    createdAt: new Date().toISOString(),
  });
}

export async function removeBookmark(lessonId) {
  const db = await getDB();
  await db.delete(STORE_BOOKMARKS, lessonId);
}

export async function isBookmarked(lessonId) {
  const db = await getDB();
  const record = await db.get(STORE_BOOKMARKS, lessonId);
  return Boolean(record);
}

export async function getAllBookmarks() {
  const db = await getDB();
  return db.getAll(STORE_BOOKMARKS);
}

export async function clearProgress() {
  const db = await getDB();
  const tx = db.transaction([STORE_PROGRESS, STORE_BOOKMARKS], "readwrite");
  await Promise.all([
    tx.objectStore(STORE_PROGRESS).clear(),
    tx.objectStore(STORE_BOOKMARKS).clear(),
    tx.done,
  ]);
}
