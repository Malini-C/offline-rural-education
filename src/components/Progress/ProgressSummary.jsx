export default function ProgressSummary({ stats }) {
  return (
    <div className="progress-summary">
      <div className="progress-summary__stat">
        <span className="progress-summary__value">
          {stats.totalLessonsViewed}
        </span>
        <span className="progress-summary__label">lessons viewed</span>
      </div>
      <div className="progress-summary__stat">
        <span className="progress-summary__value">
          {stats.totalLessonsCompleted}
        </span>
        <span className="progress-summary__label">lessons completed</span>
      </div>
      <div className="progress-summary__stat">
        <span className="progress-summary__value">
          {stats.totalQuizAttempts}
        </span>
        <span className="progress-summary__label">quiz attempts</span>
      </div>
      <div className="progress-summary__stat">
        <span className="progress-summary__value">{stats.averageScore}%</span>
        <span className="progress-summary__label">average score</span>
      </div>
      <div className="progress-summary__stat">
        <span className="progress-summary__value">{stats.totalBookmarks}</span>
        <span className="progress-summary__label">bookmarks</span>
      </div>
    </div>
  );
}
