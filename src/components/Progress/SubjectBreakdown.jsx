const SUBJECT_LABELS = {
  science: "Science",
  mathematics: "Mathematics",
  english: "English",
  "computer-basics": "Computer Basics",
};

export default function SubjectBreakdown({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="muted">No subjects to display.</p>;
  }

  return (
    <ul className="subject-breakdown">
      {rows.map((row) => {
        const percent =
          row.totalLessons === 0
            ? 0
            : Math.round((row.viewedLessons / row.totalLessons) * 100);
        return (
          <li key={row.subject} className="subject-breakdown__item">
            <div className="subject-breakdown__header">
              <span className="subject-breakdown__label">
                {SUBJECT_LABELS[row.subject] ?? row.subject}
              </span>
              <span className="muted">
                {row.viewedLessons} of {row.totalLessons} viewed
              </span>
            </div>
            <progress
              className="subject-breakdown__bar"
              value={row.viewedLessons}
              max={row.totalLessons}
              aria-label={`${SUBJECT_LABELS[row.subject] ?? row.subject} progress`}
            >
              {percent}%
            </progress>
          </li>
        );
      })}
    </ul>
  );
}
