// Pure scoring logic. Takes the quiz object and the user's answers array.
// answers[i] is either a number (the selected option index) or null (unanswered).
// Returns { score, totalQuestions, perQuestion, allAnswered }.
//
// A question is correct only if answered and the selected index matches
// correctIndex. Unanswered questions count as incorrect for scoring, but
// `allAnswered` is reported separately so the UI can warn before submit.

export function scoreQuiz(quiz, answers) {
  if (!quiz || !Array.isArray(quiz.questions)) {
    return { score: 0, totalQuestions: 0, perQuestion: [], allAnswered: false };
  }

  const totalQuestions = quiz.questions.length;
  const perQuestion = quiz.questions.map((q, i) => {
    const selected = answers?.[i] ?? null;
    const correct = selected === q.correctIndex;
    return {
      questionId: q.questionId,
      selected,
      correctIndex: q.correctIndex,
      isCorrect: correct,
      answered: selected !== null,
    };
  });

  const score = perQuestion.filter((r) => r.isCorrect).length;
  const allAnswered = perQuestion.every((r) => r.answered);

  return { score, totalQuestions, perQuestion, allAnswered };
}

export function scorePercent(score, totalQuestions) {
  if (!totalQuestions || totalQuestions <= 0) return 0;
  return Math.round((score / totalQuestions) * 100);
}
