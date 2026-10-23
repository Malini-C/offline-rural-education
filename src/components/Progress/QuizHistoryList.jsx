export default function QuizHistoryList({ attempts, quizTitlesById }) {
  if (!attempts || attempts.length === 0) {
    return (
      <p className="muted">
        No quiz attempts yet. Take a quiz from the Quiz page to see your history
        here.
      </p>
    );
  }

  return (
    <ul className="quiz-history">
      {attempts.map((attempt) => {
        const title = quizTitlesById[attempt.quizId] ?? attempt.quizId;
        const percent = attempt.totalQuestions
          ? Math.round((attempt.score / attempt.totalQuestions) * 100)
          : 0;
        const when = new Date(attempt.completedAt).toLocaleString();
        return (
          <li key={attempt.attemptId} className="quiz-history__item">
            <div>
              <p className="quiz-history__title">{title}</p>
              <p className="quiz-history__meta muted">{when}</p>
            </div>
            <p className="quiz-history__score">
              {attempt.score} / {attempt.totalQuestions} ({percent}%)
            </p>
          </li>
        );
      })}
    </ul>
  );
}
