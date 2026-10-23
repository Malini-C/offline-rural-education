import { Link } from "react-router-dom";

export default function LessonCard({ lesson, activeLanguage }) {
  return (
    <article className="lesson-card">
      <h3 className="lesson-card__title">
        <Link to={`/library/${lesson.lessonId}?lang=${activeLanguage}`}>
          {lesson.title}
        </Link>
      </h3>
      <p className="lesson-card__summary">{lesson.summary}</p>
      <div className="lesson-card__meta">
        <span>{lesson.subject}</span>
        <span aria-hidden="true">·</span>
        <span>Grade {lesson.grade}</span>
        <span aria-hidden="true">·</span>
        <span>{lesson.difficulty}</span>
      </div>
    </article>
  );
}
