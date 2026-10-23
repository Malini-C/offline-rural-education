import { getDB, STORE_LESSONS } from "./database.js";
import { makeRecordId } from "./schemas/lessonSchema.js";

export async function getAllLessons() {
  const db = await getDB();
  return db.getAll(STORE_LESSONS);
}

export async function getLessonsByLanguage(language) {
  const db = await getDB();
  return db.getAllFromIndex(STORE_LESSONS, "by_language", language);
}

export async function getLessonsBySubject(subject, language) {
  const db = await getDB();
  return db.getAllFromIndex(STORE_LESSONS, "by_subject_language", [
    subject,
    language,
  ]);
}

export async function getLessonByRecordId(lessonId, language) {
  const db = await getDB();
  const recordId = makeRecordId(lessonId, language);
  return db.get(STORE_LESSONS, recordId);
}

export async function getLessonGroup(lessonId) {
  const db = await getDB();
  return db.getAllFromIndex(STORE_LESSONS, "by_lessonId", lessonId);
}

// Insert or replace. Expects a validated lesson object (see lessonSchema.js).
export async function putLesson(lesson) {
  const db = await getDB();
  const recordId = makeRecordId(lesson.lessonId, lesson.language);
  const record = {
    ...lesson,
    recordId,
    grade: String(lesson.grade),
    updatedAt: new Date().toISOString(),
  };
  await db.put(STORE_LESSONS, record);
  return record;
}

export async function putLessons(lessons) {
  const db = await getDB();
  const tx = db.transaction(STORE_LESSONS, "readwrite");
  const now = new Date().toISOString();
  for (const lesson of lessons) {
    tx.store.put({
      ...lesson,
      recordId: makeRecordId(lesson.lessonId, lesson.language),
      grade: String(lesson.grade),
      updatedAt: now,
    });
  }
  await tx.done;
}

export async function deleteLesson(lessonId, language) {
  const db = await getDB();
  await db.delete(STORE_LESSONS, makeRecordId(lessonId, language));
}

export async function countLessons() {
  const db = await getDB();
  return db.count(STORE_LESSONS);
}
