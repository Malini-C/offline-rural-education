const SUBJECT_LABELS = {
  science: "Science",
  mathematics: "Mathematics",
  english: "English",
  "computer-basics": "Computer Basics",
};

export default function SubjectCard({ subject, count, active, onClick }) {
  const label = SUBJECT_LABELS[subject] ?? subject;
  return (
    <button
      type="button"
      className={"subject-card" + (active ? " subject-card--active" : "")}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="subject-card__title">{label}</span>
      <span className="subject-card__count">
        {count} {count === 1 ? "lesson" : "lessons"}
      </span>
    </button>
  );
}
