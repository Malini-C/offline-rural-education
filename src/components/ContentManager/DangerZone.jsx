import { useState } from "react";
import Button from "../common/Button.jsx";
import { clearAllData } from "../../db/database.js";
import { ensureSeedLoaded } from "../../db/seed.js";

export default function DangerZone({ onCleared }) {
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleConfirmedClear() {
    setStatus("clearing");
    setMessage("");
    try {
      await clearAllData();
      // Repopulate the seed content so the app is usable again immediately.
      await ensureSeedLoaded();
      setStatus("done");
      setMessage("Local data cleared. Seed lessons have been restored.");
      setConfirming(false);
      if (typeof onCleared === "function") onCleared();
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <section className="content-panel content-panel--danger">
      <h2>Clear local data</h2>
      <p className="muted">
        Removes all progress, bookmarks, quiz attempts, and imported lessons
        from this browser. Seed lessons will be reloaded. This cannot be undone.
      </p>

      {!confirming && status !== "done" && (
        <Button variant="secondary" onClick={() => setConfirming(true)}>
          Clear local data…
        </Button>
      )}

      {confirming && (
        <div className="content-panel__confirm" role="alert">
          <p>
            <strong>Are you sure?</strong> All your progress and quiz history on
            this device will be permanently deleted.
          </p>
          <div className="content-panel__actions">
            <Button onClick={handleConfirmedClear}>
              Yes, clear everything
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {status === "clearing" && <p className="muted">Clearing…</p>}
      {message && (
        <p className={status === "error" ? "text-error" : "muted"}>{message}</p>
      )}
    </section>
  );
}
