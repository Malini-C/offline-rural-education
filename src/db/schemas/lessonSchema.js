// Central definition of what a valid lesson record looks like.
// Used by the seed loader, the import path (Phase 9), and tests.

export const SUPPORTED_LANGUAGES = ["en", "ta"];
export const SUPPORTED_SUBJECTS = [
  "science",
  "mathematics",
  "english",
  "computer-basics",
];
export const SUPPORTED_DIFFICULTIES = ["beginner", "intermediate", "advanced"];
export const SUPPORTED_GRADES = ["6", "7", "8", "9", "10"];

// lessonId is stable and language-independent (shared by en/ta versions).
// recordId is unique per language variant.
export function makeRecordId(lessonId, language) {
  return `${lessonId}::${language}`;
}

export function validateLesson(input) {
  const errors = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Lesson must be an object"] };
  }

  if (!input.lessonId || typeof input.lessonId !== "string") {
    errors.push("lessonId is required (string)");
  } else if (!/^[a-z0-9-]+$/.test(input.lessonId)) {
    errors.push(
      "lessonId must contain only lowercase letters, digits, and hyphens",
    );
  }

  if (!SUPPORTED_LANGUAGES.includes(input.language)) {
    errors.push(`language must be one of: ${SUPPORTED_LANGUAGES.join(", ")}`);
  }

  if (!SUPPORTED_SUBJECTS.includes(input.subject)) {
    errors.push(`subject must be one of: ${SUPPORTED_SUBJECTS.join(", ")}`);
  }

  if (!SUPPORTED_DIFFICULTIES.includes(input.difficulty)) {
    errors.push(
      `difficulty must be one of: ${SUPPORTED_DIFFICULTIES.join(", ")}`,
    );
  }

  if (!SUPPORTED_GRADES.includes(String(input.grade))) {
    errors.push(`grade must be one of: ${SUPPORTED_GRADES.join(", ")}`);
  }

  if (
    !input.title ||
    typeof input.title !== "string" ||
    input.title.trim().length < 2
  ) {
    errors.push("title is required (string, min length 2)");
  }

  if (!input.summary || typeof input.summary !== "string") {
    errors.push("summary is required (string)");
  }

  if (
    !input.body ||
    typeof input.body !== "string" ||
    input.body.trim().length < 20
  ) {
    errors.push("body is required (string, min length 20)");
  }

  if (input.examples != null && !Array.isArray(input.examples)) {
    errors.push("examples must be an array of strings if provided");
  }

  if (
    input.practiceQuestions != null &&
    !Array.isArray(input.practiceQuestions)
  ) {
    errors.push("practiceQuestions must be an array of strings if provided");
  }

  return { valid: errors.length === 0, errors };
}

export function validateLessonBatch(lessons) {
  if (!Array.isArray(lessons)) {
    return { valid: false, errors: ["Batch must be an array"] };
  }
  const batchErrors = [];
  const seenRecordIds = new Set();

  lessons.forEach((lesson, index) => {
    const result = validateLesson(lesson);
    if (!result.valid) {
      batchErrors.push(`Item ${index}: ${result.errors.join("; ")}`);
      return;
    }
    const recordId = makeRecordId(lesson.lessonId, lesson.language);
    if (seenRecordIds.has(recordId)) {
      batchErrors.push(`Item ${index}: duplicate record ${recordId}`);
    }
    seenRecordIds.add(recordId);
  });

  return { valid: batchErrors.length === 0, errors: batchErrors };
}
