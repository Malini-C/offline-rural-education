import { openDB } from "idb";

export const DB_NAME = "ruralLearnDB";
export const DB_VERSION = 1;

export const STORE_LESSONS = "lessons";
export const STORE_QUIZZES = "quizzes";
export const STORE_PROGRESS = "progress";
export const STORE_QUIZ_ATTEMPTS = "quizAttempts";
export const STORE_BOOKMARKS = "bookmarks";
export const STORE_META = "meta";

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Version 0 -> 1: create all stores.
        // Future versions extend this switch with additional migrations.
        if (oldVersion < 1) {
          const lessons = db.createObjectStore(STORE_LESSONS, {
            keyPath: "recordId",
          });
          lessons.createIndex("by_lessonId", "lessonId");
          lessons.createIndex("by_subject", "subject");
          lessons.createIndex("by_language", "language");
          lessons.createIndex("by_subject_language", ["subject", "language"]);

          const quizzes = db.createObjectStore(STORE_QUIZZES, {
            keyPath: "quizId",
          });
          quizzes.createIndex("by_lessonGroupId", "lessonGroupId");
          quizzes.createIndex("by_language", "language");

          const progress = db.createObjectStore(STORE_PROGRESS, {
            keyPath: "lessonId",
          });
          progress.createIndex("by_lastViewedAt", "lastViewedAt");

          const attempts = db.createObjectStore(STORE_QUIZ_ATTEMPTS, {
            keyPath: "attemptId",
            autoIncrement: true,
          });
          attempts.createIndex("by_quizId", "quizId");
          attempts.createIndex("by_completedAt", "completedAt");

          const bookmarks = db.createObjectStore(STORE_BOOKMARKS, {
            keyPath: "lessonId",
          });
          bookmarks.createIndex("by_createdAt", "createdAt");

          db.createObjectStore(STORE_META, { keyPath: "key" });
        }
      },
      blocked() {
        console.warn("IndexedDB open was blocked by another tab.");
      },
      blocking() {
        console.warn("Another tab is upgrading the database; please reload.");
      },
      terminated() {
        console.error("IndexedDB connection was terminated unexpectedly.");
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

// True if the browser exposes a usable IndexedDB.
export function isIndexedDBAvailable() {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch {
    return false;
  }
}

// Wipe every store. Used by tests and by the "clear data" feature in Phase 9.
export async function clearAllData() {
  const db = await getDB();
  const tx = db.transaction(
    [
      STORE_LESSONS,
      STORE_QUIZZES,
      STORE_PROGRESS,
      STORE_QUIZ_ATTEMPTS,
      STORE_BOOKMARKS,
      STORE_META,
    ],
    "readwrite",
  );
  await Promise.all([
    tx.objectStore(STORE_LESSONS).clear(),
    tx.objectStore(STORE_QUIZZES).clear(),
    tx.objectStore(STORE_PROGRESS).clear(),
    tx.objectStore(STORE_QUIZ_ATTEMPTS).clear(),
    tx.objectStore(STORE_BOOKMARKS).clear(),
    tx.objectStore(STORE_META).clear(),
    tx.done,
  ]);
}
