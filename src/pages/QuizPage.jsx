import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import { getQuizzesByLanguage, recordAttempt } from "../db/quizRepository.js";
import { scoreQuiz } from "../utils/quizScoring.js";
import QuizSelector from "../components/Quiz/QuizSelector.jsx";
import QuestionCard from "../components/Quiz/QuestionCard.jsx";
import QuizResults from "../components/Quiz/QuizResults.jsx";
import Button from "../components/common/Button.jsx";

export default function QuizPage() {
  const { language } = useLanguage();

  const [phase, setPhase] = useState("select");
  const [quizzes, setQuizzes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    setPhase("select");
    setActiveQuiz(null);
    setAnswers([]);
    setResult(null);

    getQuizzesByLanguage(language)
      .then((qs) => {
        if (cancelled) return;
        setQuizzes(qs);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load quizzes:", err);
        setError(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  function startQuiz(quiz) {
    setActiveQuiz(quiz);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setResult(null);
    setPhase("answering");
  }

  function selectAnswer(questionIndex, optionIndex) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  async function submitQuiz() {
    if (submitting) return;
    const scored = scoreQuiz(activeQuiz, answers);
    if (!scored.allAnswered) {
      const confirmed = window.confirm(
        "Some questions are unanswered and will be marked incorrect. Submit anyway?",
      );
      if (!confirmed) return;
    }
    setSubmitting(true);
    try {
      await recordAttempt({
        quizId: activeQuiz.quizId,
        lessonGroupId: activeQuiz.lessonGroupId,
        language: activeQuiz.language,
        answers,
        score: scored.score,
        totalQuestions: scored.totalQuestions,
      });
      setResult(scored);
      setPhase("results");
    } catch (err) {
      console.error("Failed to record quiz attempt:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function retryQuiz() {
    setAnswers(new Array(activeQuiz.questions.length).fill(null));
    setResult(null);
    setPhase("answering");
  }

  function backToSelector() {
    setActiveQuiz(null);
    setAnswers([]);
    setResult(null);
    setPhase("select");
  }

  return (
    <div className="page">
      <h1 className="page-title">Quizzes</h1>

      {phase === "select" && (
        <QuizSelector
          quizzes={quizzes}
          status={status}
          error={error}
          onSelect={startQuiz}
        />
      )}

      {phase === "answering" && activeQuiz && (
        <section className="quiz-attempt">
          <h2>{activeQuiz.title}</h2>
          <ol className="quiz-attempt__questions">
            {activeQuiz.questions.map((question, i) => (
              <li key={question.questionId}>
                <QuestionCard
                  question={question}
                  index={i}
                  total={activeQuiz.questions.length}
                  selectedIndex={answers[i]}
                  onSelect={(optionIndex) => selectAnswer(i, optionIndex)}
                  showFeedback={false}
                />
              </li>
            ))}
          </ol>
          <div className="quiz-attempt__actions">
            <Button onClick={submitQuiz} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit quiz"}
            </Button>
            <Button
              variant="secondary"
              onClick={backToSelector}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </section>
      )}

      {phase === "results" && activeQuiz && result && (
        <QuizResults
          quiz={activeQuiz}
          result={result}
          onRetry={retryQuiz}
          onBackToQuizzes={backToSelector}
        />
      )}
    </div>
  );
}
