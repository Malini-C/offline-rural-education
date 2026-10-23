// Tokenization and normalisation shared by the retrieval engine and tests.
// English: lowercase, split on non-letter/digit, remove English stopwords.
// Tamil: split on non-letter Unicode ranges, remove a small Tamil stopword list.
// Both: discard very short tokens (length < 2) because they carry little
// signal and inflate false positives on short lessons.

const ENGLISH_STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "then",
  "than",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "about",
  "into",
  "from",
  "as",
  "that",
  "this",
  "these",
  "those",
  "it",
  "its",
  "they",
  "them",
  "their",
  "we",
  "you",
  "he",
  "she",
  "i",
  "me",
  "my",
  "our",
  "your",
  "his",
  "her",
  "what",
  "which",
  "who",
  "when",
  "where",
  "why",
  "how",
  "do",
  "does",
  "did",
  "can",
  "could",
  "should",
  "would",
  "will",
  "not",
  "no",
  "yes",
  "so",
  "such",
  "very",
  "there",
  "here",
  "also",
  "just",
  "any",
  "all",
  "some",
  "more",
  "most",
]);

const TAMIL_STOPWORDS = new Set([
  "மற்றும்",
  "அல்லது",
  "ஆனால்",
  "என்று",
  "என்ற",
  "இது",
  "அது",
  "இவை",
  "அவை",
  "என்ன",
  "எப்படி",
  "ஏன்",
  "எப்போது",
  "எங்கே",
  "யார்",
  "ஒரு",
  "எந்த",
  "இந்த",
  "அந்த",
  "உள்ள",
  "உள்ளது",
  "ஆகும்",
  "என்பது",
  "எனப்படும்",
]);

// Characters that delimit a token: everything that is not a Unicode letter,
// digit, or combining mark. Including \p{M} is essential for Tamil and other
// Indic scripts, where vowel signs and virama are separate code points that
// combine with the base consonant (e.g. ி, ், ை). Without \p{M}, the regex
// splits Tamil words at every vowel sign, producing fragments like 'ஒள'.
const TOKEN_BOUNDARY = /[^\p{L}\p{N}\p{M}]+/u;

export function normalize(text) {
  return typeof text === "string" ? text.trim() : "";
}

export function tokenizeEnglish(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(TOKEN_BOUNDARY)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !ENGLISH_STOPWORDS.has(t));
}

export function tokenizeTamil(text) {
  if (!text) return [];
  return text
    .normalize("NFC")
    .split(TOKEN_BOUNDARY)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !TAMIL_STOPWORDS.has(t));
}

// Dispatch on language. Unknown languages fall back to English tokenization;
// this is a safe default since the seed content only uses en and ta.
export function tokenize(text, language) {
  if (language === "ta") return tokenizeTamil(text);
  return tokenizeEnglish(text);
}

// Build a searchable bag of tokens from a lesson's relevant fields.
// Field weights are applied at scoring time, not here, so this function
// is just a concatenation.
export function lessonSearchText(lesson) {
  const parts = [lesson.title, lesson.summary, lesson.body];
  if (Array.isArray(lesson.examples)) parts.push(...lesson.examples);
  if (Array.isArray(lesson.practiceQuestions))
    parts.push(...lesson.practiceQuestions);
  return parts.filter(Boolean).join(" ");
}
