import Button from "../common/Button.jsx";
import { applyUpdate } from "../../pwa/registerSW.js";

export default function UpdateToast({ visible, onDismiss }) {
  if (!visible) return null;

  function handleReload() {
    applyUpdate();
  }

  return (
    <div className="update-toast" role="status" aria-live="polite">
      <p className="update-toast__text">
        A new version of RuralLearn is available.
      </p>
      <div className="update-toast__actions">
        <Button onClick={handleReload}>Reload now</Button>
        <Button variant="secondary" onClick={onDismiss}>
          Later
        </Button>
      </div>
    </div>
  );
}
