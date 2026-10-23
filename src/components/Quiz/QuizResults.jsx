import Button from "../common/Button.jsx";
import { scorePercent } from "../../utils/quizScoring.js";

export default function QuizResults({
  quiz,
  result,
  onRetry,
  onBackToQuizzes,
}) {
  const percent = scorePercent(result.score, result.totalQuestions);
  const allCorrect = result.score === result.totalQuestions;
  const noneCorrect = result.score === 0;

  let headline;
  if (allCorrect) headline = "Excellent — all answers correct.";
  else if (noneCorrect)
    headline = "Keep going — try the lesson again before retrying.";
  else headline = "Good effort — review the explanations below.";

  return (
    <section className="quiz-results" aria-live="polite">
      <h2>Results</h2>
      <p className="quiz-results__headline">{headline}</p>
      <p className="quiz-results__score">
        Score: <strong>{result.score}</strong> / {result.totalQuestions} (
        {percent}%)
      </p>

      <ol className="quiz-results__list">
        {quiz.questions.map((question, i) => {
          const row = result.perQuestion[i];
          return (
            <li
              key={question.questionId}
              className={
                "quiz-results__item " +
                (row.isCorrect
                  ? "quiz-results__item--correct"
                  : "quiz-results__item--wrong")
              }
            >
              <p className="quiz-results__prompt">
                <strong>Q{i + 1}.</strong> {question.prompt}
              </p>
              <p>
                Your answer:{" "}
                {row.selected === null
                  ? "(not answered)"
                  : question.options[row.selected]}
              </p>
              {!row.isCorrect && (
                <p>
                  Correct answer:{" "}
                  <strong>{question.options[question.correctIndex]}</strong>
                </p>
              )}
              {question.explanation && (
                <p className="muted">{question.explanation}</p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="quiz-results__actions">
        <Button onClick={onRetry}>Retry this quiz</Button>
        <Button variant="secondary" onClick={onBackToQuizzes}>
          Back to quiz list
        </Button>
      </div>
    </section>
  );
}
