// Validation and serialisation helpers for the Content Manager.
// Kept independent of React so they can be tested in isolation.

import {
  validateLessonBatch,
  SUPPORTED_LANGUAGES,
  SUPPORTED_SUBJECTS,
  SUPPORTED_DIFFICULTIES,
} from "../db/schemas/lessonSchema.js";

// Accept either an array of lessons or an object { lessons: [...] }.
// Reject anything else with a clear error rather than trying to guess.
export function parseLessonsJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { valid: false, error: `Invalid JSON: ${err.message}` };
  }

  let lessons;
  if (Array.isArray(parsed)) {
    lessons = parsed;
  } else if (parsed && Array.isArray(parsed.lessons)) {
    lessons = parsed.lessons;
  } else {
    return {
      valid: false,
      error:
        'Expected a JSON array of lessons, or an object with a "lessons" array.',
    };
  }

  const validation = validateLessonBatch(lessons);
  if (!validation.valid) {
    return { valid: false, error: validation.errors.join("\n") };
  }

  return { valid: true, lessons };
}

export function lessonsToJson(lessons) {
  // Order fields deterministically so exported files are diff-friendly.
  const normalised = lessons.map((lesson) => ({
    lessonId: lesson.lessonId,
    language: lesson.language,
    subject: lesson.subject,
    grade: String(lesson.grade),
    difficulty: lesson.difficulty,
    title: lesson.title,
    summary: lesson.summary,
    body: lesson.body,
    examples: Array.isArray(lesson.examples) ? lesson.examples : [],
    practiceQuestions: Array.isArray(lesson.practiceQuestions)
      ? lesson.practiceQuestions
      : [],
  }));
  return JSON.stringify(normalised, null, 2);
}

export function makeExportFile(learningData, timestamp = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const stamp =
    timestamp.getFullYear() +
    pad(timestamp.getMonth() + 1) +
    pad(timestamp.getDate()) +
    "-" +
    pad(timestamp.getHours()) +
    pad(timestamp.getMinutes()) +
    pad(timestamp.getSeconds());
  return {
    filename: `rurallearn-progress-${stamp}.json`,
    payload: {
      exportedAt: timestamp.toISOString(),
      appVersion: 1,
      progress: learningData.progress ?? [],
      bookmarks: learningData.bookmarks ?? [],
      quizAttempts: learningData.quizAttempts ?? [],
    },
  };
}

// Exposed so the import UI can show the caller what the file claimed,
// without having to duplicate the schema constants in the component.
export const SCHEMA_INFO = {
  languages: SUPPORTED_LANGUAGES,
  subjects: SUPPORTED_SUBJECTS,
  difficulties: SUPPORTED_DIFFICULTIES,
};
