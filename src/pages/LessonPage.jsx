import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext.jsx";
import {
  getLessonByRecordId,
  getLessonGroup,
} from "../db/lessonsRepository.js";
import {
  markLessonViewed,
  markLessonCompleted,
  isBookmarked,
  addBookmark,
  removeBookmark,
} from "../db/progressRepository.js";
import SpeechControls from "../components/Library/SpeechControls.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import Button from "../components/common/Button.jsx";

export default function LessonPage() {
  const { lessonId } = useParams();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [siblingLanguage, setSiblingLanguage] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    setBookmarked(false);
    setCompletionMessage("");

    async function load() {
      try {
        const record = await getLessonByRecordId(lessonId, language);
        if (!record) {
          if (!cancelled) setStatus("not-found");
          return;
        }
        await markLessonViewed(lessonId);
        const marked = await isBookmarked(lessonId);
        const group = await getLessonGroup(lessonId);
        const sibling = group.find((l) => l.language !== language) ?? null;

        if (cancelled) return;
        setLesson(record);
        setBookmarked(marked);
        setSiblingLanguage(sibling ? sibling.language : null);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load lesson:", err);
        setError(err.message);
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [lessonId, language]);

  function switchLanguage() {
    if (siblingLanguage) {
      setLanguage(siblingLanguage);
    }
  }

  async function toggleBookmark() {
    if (!lesson) return;
    if (bookmarked) {
      await removeBookmark(lesson.lessonId);
      setBookmarked(false);
    } else {
      await addBookmark(lesson.lessonId);
      setBookmarked(true);
    }
  }

  async function handleComplete() {
    if (!lesson) return;
    await markLessonCompleted(lesson.lessonId);
    setCompletionMessage("Marked as completed. This is saved in your browser.");
  }

  if (status === "loading") {
    return (
      <div className="page">
        <LoadingSpinner label="Loading lesson…" />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="page">
        <EmptyState
          title="Lesson not found"
          description={`No lesson with id "${lessonId}" was found in the ${language === "ta" ? "Tamil" : "English"} library.`}
          action={
            <Button onClick={() => navigate("/library")}>
              Back to library
            </Button>
          }
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page">
        <EmptyState
          title="Could not load the lesson"
          description={`An error occurred while reading from the local database: ${error}`}
          action={
            <Button onClick={() => navigate("/library")}>
              Back to library
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <p>
        <Link to="/library">← Back to library</Link>
      </p>

      <article className="lesson-detail">
        <header className="lesson-detail__header">
          <h1>{lesson.title}</h1>
          <div className="lesson-detail__meta">
            <span>{lesson.subject}</span>
            <span aria-hidden="true">·</span>
            <span>Grade {lesson.grade}</span>
            <span aria-hidden="true">·</span>
            <span>{lesson.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span>{language === "ta" ? "தமிழ்" : "English"}</span>
          </div>
          <p className="muted">{lesson.summary}</p>
        </header>

        <div className="lesson-detail__body">
          {lesson.body.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {Array.isArray(lesson.examples) && lesson.examples.length > 0 && (
          <section className="lesson-detail__section">
            <h2>Examples</h2>
            <ul>
              {lesson.examples.map((example, i) => (
                <li key={i}>{example}</li>
              ))}
            </ul>
          </section>
        )}

        {Array.isArray(lesson.practiceQuestions) &&
          lesson.practiceQuestions.length > 0 && (
            <section className="lesson-detail__section">
              <h2>Practice questions</h2>
              <ul>
                {lesson.practiceQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </section>
          )}

        <SpeechControls
          text={`${lesson.title}. ${lesson.summary}. ${lesson.body}`}
          language={language}
        />

        <div className="lesson-detail__actions">
          <Button variant="secondary" onClick={toggleBookmark}>
            {bookmarked ? "Remove bookmark" : "Bookmark lesson"}
          </Button>
          <Button onClick={handleComplete}>Mark as completed</Button>
          {siblingLanguage && (
            <Button variant="secondary" onClick={switchLanguage}>
              View in {siblingLanguage === "ta" ? "Tamil" : "English"}
            </Button>
          )}
        </div>

        {completionMessage && <p className="muted">{completionMessage}</p>}
      </article>
    </div>
  );
}
