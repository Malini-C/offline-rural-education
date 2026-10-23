import { useEffect, useMemo, useState } from "react";
import { getLessonsByLanguage } from "../db/lessonsRepository.js";
import { searchLessons } from "../utils/searchLessons.js";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import SubjectCard from "../components/Library/SubjectCard.jsx";
import SearchFilter from "../components/Library/SearchFilter.jsx";
import LessonCard from "../components/Library/LessonCard.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

const SUBJECTS = ["science", "mathematics", "english", "computer-basics"];

export default function LibraryPage() {
  const { language } = useLanguage();
  const [allLessons, setAllLessons] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    getLessonsByLanguage(language)
      .then((lessons) => {
        if (cancelled) return;
        setAllLessons(lessons);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load lessons:", err);
        setError(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const subjectCounts = useMemo(() => {
    const counts = {};
    for (const s of SUBJECTS) counts[s] = 0;
    for (const lesson of allLessons) {
      counts[lesson.subject] = (counts[lesson.subject] ?? 0) + 1;
    }
    return counts;
  }, [allLessons]);

  const visibleLessons = useMemo(() => {
    return searchLessons(allLessons, { query, subject, difficulty });
  }, [allLessons, query, subject, difficulty]);

  function handleReset() {
    setQuery("");
    setSubject("all");
    setDifficulty("all");
  }

  return (
    <div className="page">
      <h1 className="page-title">Learning Library</h1>

      <div className="subject-grid" role="group" aria-label="Filter by subject">
        {SUBJECTS.map((s) => (
          <SubjectCard
            key={s}
            subject={s}
            count={subjectCounts[s] ?? 0}
            active={subject === s}
            onClick={() => setSubject(subject === s ? "all" : s)}
          />
        ))}
      </div>

      <SearchFilter
        query={query}
        onQueryChange={setQuery}
        subject={subject}
        difficulty={difficulty}
        language={language}
        onDifficultyChange={setDifficulty}
        onReset={handleReset}
      />

      {status === "loading" && <LoadingSpinner label="Loading lessons…" />}

      {status === "error" && (
        <EmptyState
          title="Could not load lessons"
          description={`An error occurred while reading from the local database: ${error}`}
        />
      )}

      {status === "ready" && visibleLessons.length === 0 && (
        <EmptyState
          title="No lessons match your filters"
          description="Try clearing the search box or choosing a different subject or difficulty."
        />
      )}

      {status === "ready" && visibleLessons.length > 0 && (
        <>
          <p className="muted" aria-live="polite">
            {visibleLessons.length} of {allLessons.length} lessons
          </p>
          <div className="lesson-list">
            {visibleLessons.map((lesson) => (
              <LessonCard
                key={lesson.recordId}
                lesson={lesson}
                activeLanguage={language}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
