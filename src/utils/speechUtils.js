// Thin wrapper over the browser SpeechSynthesis API.
// Voice availability depends on the OS, so we never assume a voice exists.

export const SPEECH_SUPPORTED =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

const LANGUAGE_TO_LOCALE_PREFIX = {
  en: "en",
  ta: "ta",
};

export function getLocalePrefix(language) {
  return LANGUAGE_TO_LOCALE_PREFIX[language] ?? "en";
}

// Returns the first available voice whose lang starts with the locale prefix.
// Returns null if none is installed.
export function findVoiceForLanguage(language) {
  if (!SPEECH_SUPPORTED) return null;
  const prefix = getLocalePrefix(language);
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang?.toLowerCase().startsWith(prefix)) ?? null;
}

// Speak text with the given language. Returns:
//   { ok: true, utterance }              if speech started
//   { ok: false, reason: 'unsupported' } if the browser has no speech API
//   { ok: false, reason: 'no-voice' }    if the language has no voice installed
export function speak(text, language, { onEnd } = {}) {
  if (!SPEECH_SUPPORTED) {
    return { ok: false, reason: "unsupported" };
  }
  const voice = findVoiceForLanguage(language);
  if (!voice) {
    return { ok: false, reason: "no-voice" };
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  if (typeof onEnd === "function") {
    utterance.onend = onEnd;
  }
  window.speechSynthesis.speak(utterance);
  return { ok: true, utterance };
}

export function stopSpeaking() {
  if (!SPEECH_SUPPORTED) return;
  window.speechSynthesis.cancel();
}

export function isSpeaking() {
  if (!SPEECH_SUPPORTED) return false;
  return window.speechSynthesis.speaking;
}
