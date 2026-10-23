import { useLanguage } from "../contexts/LanguageContext.jsx";
import ChatInterface from "../components/Assistant/ChatInterface.jsx";

export default function AssistantPage() {
  const { language } = useLanguage();

  return (
    <div className="page">
      <h1 className="page-title">Offline Assistant</h1>
      <p className="muted">
        This assistant searches the lessons stored on this device. It does not
        call a remote service, and it does not generate new text — answers are
        quoted from existing lessons with a source link.
      </p>
      <ChatInterface language={language} />
    </div>
  );
}
