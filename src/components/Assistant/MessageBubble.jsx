import SourceCitation from "./SourceCitation.jsx";

export default function MessageBubble({ role, payload }) {
  return (
    <div className={`message-bubble message-bubble--${role}`}>
      {role === "user" && (
        <p className="message-bubble__text">{payload.text}</p>
      )}

      {role === "assistant" && payload.kind === "answer" && (
        <>
          <p className="message-bubble__intro">{payload.intro}</p>
          <p className="message-bubble__passage">{payload.passage}</p>
          <SourceCitation
            lessonTitle={payload.lessonTitle}
            lessonId={payload.lessonId}
            language={payload.language}
          />
          <p className="message-bubble__source-note muted">
            {payload.sourceNote}
          </p>
        </>
      )}

      {role === "assistant" && payload.kind === "not-found" && (
        <>
          <p className="message-bubble__text">{payload.message}</p>
          {payload.nearestLessonTitle && payload.nearestLessonId && (
            <SourceCitation
              lessonTitle={payload.nearestLessonTitle}
              lessonId={payload.nearestLessonId}
              language="en"
              prefix="Closest lesson"
            />
          )}
        </>
      )}

      {role === "assistant" && payload.kind === "info" && (
        <p className="message-bubble__text">{payload.message}</p>
      )}
    </div>
  );
}
