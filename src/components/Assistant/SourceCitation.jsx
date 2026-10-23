import { Link } from "react-router-dom";

export default function SourceCitation({
  lessonTitle,
  lessonId,
  language,
  prefix,
}) {
  const label = prefix ? `${prefix}: ` : "Source: ";
  return (
    <p className="source-citation">
      <span className="source-citation__label">{label}</span>
      <Link to={`/library/${lessonId}?lang=${language}`}>{lessonTitle}</Link>
    </p>
  );
}
