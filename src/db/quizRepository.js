import { getDB, STORE_QUIZZES, STORE_QUIZ_ATTEMPTS } from "./database.js";

export async function getAllQuizzes() {
  const db = await getDB();
  return db.getAll(STORE_QUIZZES);
}

export async function getQuizzesByLanguage(language) {
  const db = await getDB();
  return db.getAllFromIndex(STORE_QUIZZES, "by_language", language);
}

export async function getQuizById(quizId) {
  const db = await getDB();
  return db.get(STORE_QUIZZES, quizId);
}

export async function getQuizzesForLessonGroup(lessonGroupId) {
  const db = await getDB();
  return db.getAllFromIndex(STORE_QUIZZES, "by_lessonGroupId", lessonGroupId);
}

export async function putQuizzes(quizzes) {
  const db = await getDB();
  const tx = db.transaction(STORE_QUIZZES, "readwrite");
  for (const quiz of quizzes) {
    tx.store.put(quiz);
  }
  await tx.done;
}

// Record a finished attempt. Returns the attemptId assigned by IndexedDB.
export async function recordAttempt({
  quizId,
  lessonGroupId,
  language,
  answers,
  score,
  totalQuestions,
}) {
  const db = await getDB();
  const attempt = {
    quizId,
    lessonGroupId,
    language,
    answers,
    score,
    totalQuestions,
    completedAt: new Date().toISOString(),
  };
  const attemptId = await db.add(STORE_QUIZ_ATTEMPTS, attempt);
  return { ...attempt, attemptId };
}

export async function getAllAttempts() {
  const db = await getDB();
  return db.getAll(STORE_QUIZ_ATTEMPTS);
}

export async function getAttemptsForQuiz(quizId) {
  const db = await getDB();
  return db.getAllFromIndex(STORE_QUIZ_ATTEMPTS, "by_quizId", quizId);
}

export async function getRecentAttempts(limit = 10) {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE_QUIZ_ATTEMPTS, "by_completedAt");
  return all.reverse().slice(0, limit);
}
