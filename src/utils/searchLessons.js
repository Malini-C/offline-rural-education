// Pure search + filter helper for the Library page.
// Works on the in-memory lesson list and applies:
//   - case-insensitive substring match across title, summary, body, examples
//   - optional subject filter
//   - optional difficulty filter
// Language filtering is done before this function is called
// (the library already loads only the active language).

export function searchLessons(
  lessons,
  { query = "", subject = "all", difficulty = "all" } = {},
) {
  if (!Array.isArray(lessons)) return [];

  const trimmed = query.trim().toLowerCase();

  return lessons.filter((lesson) => {
    if (subject !== "all" && lesson.subject !== subject) return false;
    if (difficulty !== "all" && lesson.difficulty !== difficulty) return false;
    if (trimmed.length === 0) return true;

    return (
      matches(lesson.title, trimmed) ||
      matches(lesson.summary, trimmed) ||
      matches(lesson.body, trimmed) ||
      (Array.isArray(lesson.examples) &&
        lesson.examples.some((e) => matches(e, trimmed)))
    );
  });
}

function matches(value, query) {
  return typeof value === "string" && value.toLowerCase().includes(query);
}
