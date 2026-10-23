import { useEffect, useState } from "react";
import { getAllLessons } from "../db/lessonsRepository.js";
import { getAllProgress, getAllBookmarks } from "../db/progressRepository.js";
import { getAllAttempts, getAllQuizzes } from "../db/quizRepository.js";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import ProgressSummary from "../components/Progress/ProgressSummary.jsx";
import SubjectBreakdown from "../components/Progress/SubjectBreakdown.jsx";
import QuizHistoryList from "../components/Progress/QuizHistoryList.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

const SUBJECTS = ["science", "mathematics", "english", "computer-basics"];

const T = {
  en: {
    title: "Your Progress",
    intro:
      "All progress is stored locally in this browser. Clearing browser data will erase it.",
    bySubject: "By subject",
    quizHistory: "Quiz history",
    loading: "Reading your learning data…",
    errorTitle: "Could not load your progress",
    errorPrefix: "An error occurred while reading from the local database:",
  },
  ta: {
    title: "உங்கள் முன்னேற்றம்",
    intro:
      "அனைத்து முன்னேற்றமும் இந்த உலாவியில் மட்டுமே சேமிக்கப்படுகிறது. உலாவித் தரவை அழித்தால் இது அழியும்.",
    bySubject: "பாட வாரியாக",
    quizHistory: "வினாடி வினா வரலாறு",
    loading: "உங்கள் கற்றல் தரவு படிக்கப்படுகிறது…",
    errorTitle: "உங்கள் முன்னேற்றத்தை ஏற்ற முடியவில்லை",
    errorPrefix: "உள்ளூர் தரவுத்தளத்திலிருந்து படிக்கும் போது பிழை ஏற்பட்டது:",
  },
};

export default function ProgressPage() {
  const { language } = useLanguage();
  const t = T[language] ?? T.en;

  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [subjectRows, setSubjectRows] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [quizTitlesById, setQuizTitlesById] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [allProgress, allBookmarks, allAttempts, allQuizzes, allLessons] =
          await Promise.all([
            getAllProgress(),
            getAllBookmarks(),
            getAllAttempts(),
            getAllQuizzes(),
            getAllLessons(),
          ]);

        if (cancelled) return;

        const totalLessonsViewed = allProgress.filter(
          (p) => p.viewedCount > 0,
        ).length;
        const totalLessonsCompleted = allProgress.filter(
          (p) => p.completed,
        ).length;
        const totalQuizAttempts = allAttempts.length;
        const totalBookmarks = allBookmarks.length;

        const averageScore =
          totalQuizAttempts === 0
            ? 0
            : Math.round(
                (allAttempts.reduce(
                  (sum, a) =>
                    sum + (a.totalQuestions ? a.score / a.totalQuestions : 0),
                  0,
                ) /
                  totalQuizAttempts) *
                  100,
              );

        setStats({
          totalLessonsViewed,
          totalLessonsCompleted,
          totalQuizAttempts,
          totalBookmarks,
          averageScore,
        });

        // Subject breakdown uses English lessons as the canonical per-subject
        // lesson count, because every lesson exists in both languages.
        const viewedLessonIds = new Set(allProgress.map((p) => p.lessonId));
        const englishLessons = allLessons.filter((l) => l.language === "en");
        const rows = SUBJECTS.map((subject) => {
          const lessonsForSubject = englishLessons.filter(
            (l) => l.subject === subject,
          );
          const viewedLessons = lessonsForSubject.filter((l) =>
            viewedLessonIds.has(l.lessonId),
          ).length;
          return {
            subject,
            totalLessons: lessonsForSubject.length,
            viewedLessons,
          };
        });
        setSubjectRows(rows);

        const sortedAttempts = [...allAttempts].sort(
          (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
        );
        setAttempts(sortedAttempts);

        const titles = {};
        for (const quiz of allQuizzes) {
          titles[quiz.quizId] = quiz.title;
        }
        setQuizTitlesById(titles);

        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load progress:", err);
        setError(err.message);
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="page">
        <h1 className="page-title">{t.title}</h1>
        <LoadingSpinner label={t.loading} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page">
        <h1 className="page-title">{t.title}</h1>
        <EmptyState
          title={t.errorTitle}
          description={`${t.errorPrefix} ${error}`}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">{t.title}</h1>
      <p className="muted">{t.intro}</p>

      <section className="progress-section">
        <ProgressSummary stats={stats} />
      </section>

      <section className="progress-section">
        <h2>{t.bySubject}</h2>
        <SubjectBreakdown rows={subjectRows} />
      </section>

      <section className="progress-section">
        <h2>{t.quizHistory}</h2>
        <QuizHistoryList attempts={attempts} quizTitlesById={quizTitlesById} />
      </section>
    </div>
  );
}
