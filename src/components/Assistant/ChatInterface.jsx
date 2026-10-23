import { useEffect, useRef, useState } from "react";
import Button from "../common/Button.jsx";
import MessageBubble from "./MessageBubble.jsx";
import { answerQuestion } from "../../ai/retrievalEngine.js";
import { formatAnswer, suggestedQueries } from "../../ai/answerFormatter.js";
import { getLessonsByLanguage } from "../../db/lessonsRepository.js";

const INTRO_MESSAGE = {
  en: "Ask a question about any lesson in the local library. I will search the stored lessons and show you the matching passage with its source. I do not generate new text.",
  ta: "உள்ளூர் பாடக் களஞ்சியத்தில் உள்ள எந்தப் பாடத்தைப் பற்றியும் கேளுங்கள். நான் சேமிக்கப்பட்ட பாடங்களைத் தேடி, பொருந்தும் பகுதியையும் அதன் மூலத்தையும் காட்டுவேன். நான் புதிய உரையை உருவாக்குவதில்லை.",
};

export default function ChatInterface({ language }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      payload: { kind: "info", message: INTRO_MESSAGE[language] },
    },
  ]);
  const [input, setInput] = useState("");
  const [lessons, setLessons] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLessons([]);
    setLoadError(null);
    getLessonsByLanguage(language)
      .then((ls) => {
        if (!cancelled) setLessons(ls);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load lessons for assistant:", err);
        setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, busy]);

  function submitQuery(text) {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", payload: { text: trimmed } },
    ]);
    setInput("");

    if (loadError) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          payload: {
            kind: "not-found",
            message:
              "The local lesson library could not be loaded, so no answer can be produced.",
          },
        },
      ]);
      return;
    }

    setBusy(true);

    // Deliberately yield to the event loop before computing so the user's
    // message appears instantly, even on slower devices.
    setTimeout(() => {
      const raw = answerQuestion(trimmed, lessons, language);
      const formatted = formatAnswer(raw, language);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", payload: formatted },
      ]);
      setBusy(false);
    }, 0);
  }

  function handleSubmit(e) {
    e.preventDefault();
    submitQuery(input);
  }

  function handleSuggestionClick(suggestion) {
    submitQuery(suggestion);
  }

  const suggestions = suggestedQueries(language);

  return (
    <div className="chat">
      <div className="chat__thread" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} payload={m.payload} />
        ))}
        {busy && (
          <div className="message-bubble message-bubble--assistant">
            <p className="message-bubble__text muted">
              {language === "ta" ? "தேடுகிறது…" : "Searching…"}
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && suggestions.length > 0 && (
        <div className="chat__suggestions" aria-label="Suggested questions">
          <p className="muted">
            {language === "ta"
              ? "இவற்றில் ஒன்றை முயற்சிக்கவும்:"
              : "Try one of these:"}
          </p>
          <div className="chat__suggestion-list">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="chat__suggestion"
                onClick={() => handleSuggestionClick(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="chat__composer" onSubmit={handleSubmit}>
        <label className="chat__composer-label" htmlFor="assistant-input">
          {language === "ta" ? "உங்கள் கேள்வி" : "Your question"}
        </label>
        <textarea
          id="assistant-input"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === "ta"
              ? "ஒரு கேள்வியைத் தட்டச்சு செய்யுங்கள்…"
              : "Type a question…"
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitQuery(input);
            }
          }}
        />
        <Button type="submit" disabled={busy || input.trim().length === 0}>
          {language === "ta" ? "கேள்" : "Ask"}
        </Button>
      </form>
    </div>
  );
}
