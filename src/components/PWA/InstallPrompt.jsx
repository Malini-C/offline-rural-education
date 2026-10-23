import { useState } from "react";
import Button from "../common/Button.jsx";
import { useInstallPrompt } from "../../pwa/useInstallPrompt.js";

export default function InstallPrompt() {
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [message, setMessage] = useState("");

  if (installed) return null;
  if (!canInstall) return null;

  async function handleInstall() {
    const result = await promptInstall();
    if (result.outcome === "dismissed") {
      setMessage(
        "Install cancelled. You can install later from the browser menu.",
      );
    }
  }

  return (
    <div
      className="install-prompt"
      role="region"
      aria-label="Install RuralLearn"
    >
      <p className="install-prompt__text">
        Install RuralLearn to your device for one-tap offline access.
      </p>
      <div className="install-prompt__actions">
        <Button onClick={handleInstall}>Install</Button>
      </div>
      {message && <p className="install-prompt__message muted">{message}</p>}
    </div>
  );
}
