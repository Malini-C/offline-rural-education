import { useDatabase } from "../contexts/DatabaseContext.jsx";
import PWAStatus from "../components/PWA/PWAStatus.jsx";

export default function HomePage() {
  const { status, error, seedInfo } = useDatabase();

  return (
    <div className="page">
      <h1 className="page-title">Welcome to RuralLearn</h1>
      <p className="muted">
        An offline-first educational assistant for rural students. All lesson
        data, quizzes, and your progress are stored in this browser.
      </p>

      <section>
        <h2>Storage</h2>
        {status === "init" && <p>Initializing database…</p>}
        {status === "ready" && (
          <p>
            Database ready.{" "}
            {seedInfo?.loaded
              ? `Seeded ${seedInfo.lessonCount} lessons and ${seedInfo.quizCount} quizzes on first run.`
              : "Seed already up to date."}
          </p>
        )}
        {status === "unavailable" && (
          <p style={{ color: "var(--color-warning)" }}>{error}</p>
        )}
        {status === "error" && (
          <p style={{ color: "var(--color-error)" }}>Database error: {error}</p>
        )}
      </section>

      <PWAStatus />
    </div>
  );
}
