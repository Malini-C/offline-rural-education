import { useState } from "react";
import Button from "../common/Button.jsx";
import { makeExportFile } from "../../utils/contentIO.js";
import {
  getAllProgress,
  getAllBookmarks,
} from "../../db/progressRepository.js";
import { getAllAttempts } from "../../db/quizRepository.js";
import { getAllLessons } from "../../db/lessonsRepository.js";
import { lessonsToJson } from "../../utils/contentIO.js";

function download(filename, text, mime = "application/json") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportPanel() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function exportProgress() {
    setStatus("working");
    try {
      const [progress, bookmarks, quizAttempts] = await Promise.all([
        getAllProgress(),
        getAllBookmarks(),
        getAllAttempts(),
      ]);
      const file = makeExportFile({ progress, bookmarks, quizAttempts });
      download(file.filename, JSON.stringify(file.payload, null, 2));
      setStatus("done");
      setMessage(`Saved ${file.filename}.`);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  async function exportLessons() {
    setStatus("working");
    try {
      const lessons = await getAllLessons();
      download("rurallearn-lessons.json", lessonsToJson(lessons));
      setStatus("done");
      setMessage("Saved rurallearn-lessons.json.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <section className="content-panel">
      <h2>Export</h2>
      <p className="muted">
        Save a JSON file to your device. Nothing is uploaded anywhere.
      </p>
      <div className="content-panel__actions">
        <Button onClick={exportProgress}>Export my progress</Button>
        <Button variant="secondary" onClick={exportLessons}>
          Export all lessons
        </Button>
      </div>
      {status === "working" && <p className="muted">Preparing file…</p>}
      {message && (
        <p className={status === "error" ? "text-error" : "muted"}>{message}</p>
      )}
    </section>
  );
}
