import { useState } from "react";
import ImportPanel from "../components/ContentManager/ImportPanel.jsx";
import ExportPanel from "../components/ContentManager/ExportPanel.jsx";
import DangerZone from "../components/ContentManager/DangerZone.jsx";
import { useLanguage } from "../contexts/LanguageContext.jsx";

export default function ManageContentPage() {
  const { language } = useLanguage();
  const [lastAction, setLastAction] = useState(null);

  return (
    <div className="page">
      <h1 className="page-title">
        {language === "ta" ? "உள்ளடக்கத்தை நிர்வகி" : "Manage Content"}
      </h1>
      <p className="muted">
        {language === "ta"
          ? "பாடங்களை இறக்குமதி செய்யவும், தரவை ஏற்றுமதி செய்யவும், அல்லது உள்ளூர் தரவை அழிக்கவும். எந்தத் தரவும் இணையத்திற்கு அனுப்பப்படாது."
          : "Import lessons, export your data, or clear local data. Nothing is uploaded anywhere."}
      </p>

      {lastAction && (
        <p className="muted" aria-live="polite">
          {lastAction}
        </p>
      )}

      <ImportPanel
        onImported={(count) => setLastAction(`Imported ${count} lessons.`)}
      />
      <ExportPanel />
      <DangerZone
        onCleared={() => setLastAction("Local data cleared and seed restored.")}
      />
    </div>
  );
}
