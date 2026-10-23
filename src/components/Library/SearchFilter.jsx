import Button from "../common/Button.jsx";

const DIFFICULTIES = [
  { value: "all", label: "All difficulties" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function SearchFilter({
  query,
  onQueryChange,
  subject,
  difficulty,
  language,
  onDifficultyChange,
  onReset,
}) {
  const showReset = query !== "" || subject !== "all" || difficulty !== "all";

  return (
    <div className="search-filter">
      <label className="search-filter__field">
        <span className="search-filter__label">Search lessons</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by keyword…"
          aria-label="Search lessons by keyword"
        />
      </label>

      <label className="search-filter__field">
        <span className="search-filter__label">Difficulty</span>
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          aria-label="Lesson difficulty"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      {showReset && (
        <Button variant="secondary" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
