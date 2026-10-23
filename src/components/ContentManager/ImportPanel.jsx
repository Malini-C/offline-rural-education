import { useRef, useState } from "react";
import Button from "../common/Button.jsx";
import { parseLessonsJson } from "../../utils/contentIO.js";
import { putLessons } from "../../db/lessonsRepository.js";

export default function ImportPanel({ onImported }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState([]);
  const [preview, setPreview] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);

  function reset() {
    setStatus("idle");
    setErrors([]);
    setPreview(null);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("reading");
    setErrors([]);
    setPreview(null);

    let text;
    try {
      text = await file.text();
    } catch (err) {
      setStatus("error");
      setErrors([`Could not read file: ${err.message}`]);
      return;
    }

    const result = parseLessonsJson(text);
    if (!result.valid) {
      setStatus("error");
      setErrors(result.error.split("\n"));
      return;
    }

    setPreview(result.lessons);
    setPendingFile(file.name);
    setStatus("confirm");
  }

  async function confirmImport() {
    if (!preview) return;
    setStatus("writing");
    try {
      await putLessons(preview);
      setStatus("done");
      if (typeof onImported === "function") onImported(preview.length);
    } catch (err) {
      setStatus("error");
      setErrors([`Could not save lessons: ${err.message}`]);
    }
  }

  return (
    <section className="content-panel">
      <h2>Import lessons</h2>
      <p className="muted">
        Choose a JSON file containing lessons. Supported languages:{" "}
        {["en", "ta"].join(", ")}. Each lesson must have lessonId, language,
        subject, grade, difficulty, title, summary, and body.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        aria-label="Select lesson JSON file"
      />

      {status === "reading" && <p className="muted">Reading file…</p>}

      {status === "confirm" && preview && (
        <div className="content-panel__preview">
          <p>
            Ready to import <strong>{preview.length}</strong> lesson
            {preview.length === 1 ? "" : "s"} from <code>{pendingFile}</code>.
          </p>
          <ul>
            {preview.slice(0, 5).map((lesson) => (
              <li key={`${lesson.lessonId}::${lesson.language}`}>
                {lesson.title} ({lesson.language})
              </li>
            ))}
            {preview.length > 5 && <li>… and {preview.length - 5} more.</li>}
          </ul>
          <div className="content-panel__actions">
            <Button onClick={confirmImport}>Import now</Button>
            <Button variant="secondary" onClick={reset}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {status === "writing" && (
        <p className="muted">Saving to local database…</p>
      )}

      {status === "done" && (
        <div className="content-panel__done">
          <p>
            Import complete. The lessons are now part of your local library.
          </p>
          <Button variant="secondary" onClick={reset}>
            Import another file
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="content-panel__error" role="alert">
          <p>The file was not imported. The following problems were found:</p>
          <ul>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          <Button variant="secondary" onClick={reset}>
            Try another file
          </Button>
        </div>
      )}
    </section>
  );
}
