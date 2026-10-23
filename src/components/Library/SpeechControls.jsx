import { useEffect, useState } from "react";
import Button from "../common/Button.jsx";
import {
  speak,
  stopSpeaking,
  isSpeaking,
  findVoiceForLanguage,
  SPEECH_SUPPORTED,
} from "../../utils/speechUtils.js";

export default function SpeechControls({ text, language }) {
  const [message, setMessage] = useState("");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // Some browsers need a tick before voices populate.
    const timer = setTimeout(() => {
      setSpeaking(isSpeaking());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!SPEECH_SUPPORTED) {
    return (
      <p className="speech-controls__message muted">
        Read-aloud is not supported in this browser.
      </p>
    );
  }

  function handleSpeak() {
    const result = speak(text, language, {
      onEnd: () => setSpeaking(false),
    });
    if (result.ok) {
      setSpeaking(true);
      setMessage("");
    } else if (result.reason === "no-voice") {
      const languageName = language === "ta" ? "Tamil" : "English";
      setMessage(
        `No ${languageName} voice is installed on this device. Install a ${languageName} voice in your operating system's speech settings to enable read-aloud.`,
      );
    } else {
      setMessage("Read-aloud could not start in this browser.");
    }
  }

  function handleStop() {
    stopSpeaking();
    setSpeaking(false);
  }

  const voiceAvailable = Boolean(findVoiceForLanguage(language));

  return (
    <div className="speech-controls">
      <div className="speech-controls__buttons">
        <Button variant="secondary" onClick={handleSpeak} disabled={speaking}>
          Read aloud
        </Button>
        <Button variant="secondary" onClick={handleStop} disabled={!speaking}>
          Stop
        </Button>
      </div>
      {!voiceAvailable && (
        <p className="speech-controls__message muted">
          A {language === "ta" ? "Tamil" : "English"} voice is not currently
          available. Read-aloud may not work until one is installed on this
          device.
        </p>
      )}
      {message && <p className="speech-controls__message">{message}</p>}
    </div>
  );
}
