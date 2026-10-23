import { useLanguage } from "../../contexts/LanguageContext.jsx";

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switch" role="group" aria-label="Language">
      <button
        type="button"
        className={
          "language-switch__option" +
          (language === "en" ? " language-switch__option--active" : "")
        }
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
      >
        EN
      </button>
      <button
        type="button"
        className={
          "language-switch__option" +
          (language === "ta" ? " language-switch__option--active" : "")
        }
        onClick={() => setLanguage("ta")}
        aria-pressed={language === "ta"}
        lang="ta"
      >
        த
      </button>
    </div>
  );
}
