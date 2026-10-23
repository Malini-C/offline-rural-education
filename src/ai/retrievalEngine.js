// BM25-style retrieval over a set of lesson records.
// This is a classical information-retrieval scoring function, not a
// generative model. It ranks existing lessons; it does not write new text.
//
// Reference for BM25 parameters:
//   k1 = 1.5, b = 0.75 are standard defaults from the original BM25 paper.
//   We use them unchanged.
//
// The engine's outputs are:
//   - the ranked list of matching lessons with per-lesson scores
//   - the single best passage (a paragraph from the best lesson)
//   - a decision about whether the score is high enough to answer at all
//
// Three independent gates must pass before an answer is produced:
//   1. BM25 score above SCORE_THRESHOLD (top match is not weak)
//   2. DOMINANCE_RATIO satisfied (top match clearly beats the second)
//   3. Coverage: at least COVERAGE_THRESHOLD of query tokens are in the
//      top lesson's text (the lesson actually addresses the question)

import { tokenize, lessonSearchText } from "./textProcessor.js";

const K1 = 1.5;
const B = 0.75;

// A lesson matches only if its BM25 score reaches this threshold.
// Scores are not on a fixed scale, so this value was calibrated against
// the seeded dataset. It is intentionally conservative: a false "no answer"
// is better than a confidently wrong answer.
const SCORE_THRESHOLD = 1.5;

// The top result must also be at least this much higher than the second
// result, if a second result exists. This prevents returning a "winner"
// when two lessons tie weakly on unrelated keywords.
const DOMINANCE_RATIO = 1.25;

// The top lesson must contain at least this fraction of the query's
// distinct tokens. This is the strongest of the three gates because it
// directly measures "does this lesson address the question?", and it is
// independent of corpus size, unlike BM25 scores.
const COVERAGE_THRESHOLD = 0.5;

export function retrieveLessons(query, lessons, language) {
  const queryTokens = tokenize(query, language);
  if (queryTokens.length === 0) return [];

  const documents = lessons.map((lesson) => {
    const tokens = tokenize(lessonSearchText(lesson), language);
    return { lesson, tokens, length: tokens.length };
  });

  const N = documents.length;
  if (N === 0) return [];

  const avgLength = documents.reduce((sum, d) => sum + d.length, 0) / N || 1;

  // Document frequency per token across the corpus
  const df = new Map();
  for (const doc of documents) {
    const unique = new Set(doc.tokens);
    for (const t of unique) {
      df.set(t, (df.get(t) ?? 0) + 1);
    }
  }

  // Term frequency per document, on demand
  function tf(doc, token) {
    let count = 0;
    for (const t of doc.tokens) if (t === token) count += 1;
    return count;
  }

  function idf(token) {
    const n = df.get(token) ?? 0;
    // Standard BM25 idf; the +0.5 smoothing avoids log(0)
    return Math.log(1 + (N - n + 0.5) / (n + 0.5));
  }

  // Score each document
  const scored = documents.map((doc) => {
    let score = 0;
    for (const token of queryTokens) {
      const freq = tf(doc, token);
      if (freq === 0) continue;
      const numerator = freq * (K1 + 1);
      const denominator = freq + K1 * (1 - B + B * (doc.length / avgLength));
      score += idf(token) * (numerator / denominator);
    }
    return { lesson: doc.lesson, score };
  });

  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
}

// Public API: given a question, return the best answer grounded in the
// provided lessons, or a structured "no answer" result.
export function answerQuestion(query, lessons, language) {
  const trimmed = typeof query === "string" ? query.trim() : "";
  if (trimmed.length === 0) {
    return {
      type: "empty-query",
      query: trimmed,
    };
  }

  const ranked = retrieveLessons(trimmed, lessons, language);

  if (ranked.length === 0) {
    return {
      type: "not-found",
      query: trimmed,
      reason: "no-match",
    };
  }

  const top = ranked[0];
  if (top.score < SCORE_THRESHOLD) {
    return {
      type: "not-found",
      query: trimmed,
      reason: "low-score",
      bestScore: Number(top.score.toFixed(2)),
      nearest: top.lesson,
    };
  }

  if (ranked.length > 1) {
    const second = ranked[1];
    if (second.score > 0 && top.score / second.score < DOMINANCE_RATIO) {
      return {
        type: "not-found",
        query: trimmed,
        reason: "ambiguous",
        bestScore: Number(top.score.toFixed(2)),
        secondScore: Number(second.score.toFixed(2)),
        nearest: top.lesson,
      };
    }
  }

  // Coverage check: the top lesson must contain a meaningful fraction of
  // the query's tokens. This rejects cases where a single incidental match
  // (for example "networks" in an internet lesson) produces a high BM25
  // score for an unrelated question.
  const queryTokens = tokenize(trimmed, language);
  const topTokens = new Set(tokenize(lessonSearchText(top.lesson), language));
  const matchedTokenCount = queryTokens.filter((t) => topTokens.has(t)).length;
  const coverage =
    queryTokens.length > 0 ? matchedTokenCount / queryTokens.length : 0;

  if (coverage < COVERAGE_THRESHOLD) {
    return {
      type: "not-found",
      query: trimmed,
      reason: "low-coverage",
      coverage: Number(coverage.toFixed(2)),
      nearest: top.lesson,
    };
  }

  const passage = selectBestPassage(trimmed, top.lesson, language);

  return {
    type: "answer",
    query: trimmed,
    lesson: top.lesson,
    passage,
    score: Number(top.score.toFixed(2)),
    coverage: Number(coverage.toFixed(2)),
    alternates: ranked.slice(1, 4).map((r) => ({
      lesson: r.lesson,
      score: Number(r.score.toFixed(2)),
    })),
  };
}

// Split the lesson body into paragraphs and pick the one that best matches
// the query. Fallback: if no paragraph scores above zero, return the first
// paragraph, since the lesson as a whole is already the best match.
function selectBestPassage(query, lesson, language) {
  const queryTokens = tokenize(query, language);
  const paragraphs = (lesson.body || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return lesson.summary || "";
  }

  let best = paragraphs[0];
  let bestScore = -1;
  for (const paragraph of paragraphs) {
    const tokens = new Set(tokenize(paragraph, language));
    let score = 0;
    for (const token of queryTokens) if (tokens.has(token)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = paragraph;
    }
  }
  return best;
}

// Exported for tests so thresholds can be adjusted with clear intent.
export const _thresholds = {
  SCORE_THRESHOLD,
  DOMINANCE_RATIO,
  COVERAGE_THRESHOLD,
};
