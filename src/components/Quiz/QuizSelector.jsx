import Button from "../common/Button.jsx";
import EmptyState from "../common/EmptyState.jsx";

export default function QuizSelector({ quizzes, onSelect, status, error }) {
  if (status === "loading") {
    return <p className="muted">Loading quizzes…</p>;
  }

  if (status === "error") {
    return (
      <EmptyState
        title="Could not load quizzes"
        description={`An error occurred while reading from the local database: ${error}`}
      />
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <EmptyState
        title="No quizzes available"
        description="Once quizzes are imported for the current language, they will appear here."
      />
    );
  }

  return (
    <ul className="quiz-selector">
      {quizzes.map((quiz) => (
        <li key={quiz.quizId} className="quiz-selector__item">
          <div>
            <h3 className="quiz-selector__title">{quiz.title}</h3>
            <p className="quiz-selector__meta">
              {quiz.subject} · {quiz.questions.length}{" "}
              {quiz.questions.length === 1 ? "question" : "questions"}
            </p>
          </div>
          <Button onClick={() => onSelect(quiz)}>Start quiz</Button>
        </li>
      ))}
    </ul>
  );
}
