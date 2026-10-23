export default function QuestionCard({
  question,
  index,
  total,
  selectedIndex,
  onSelect,
  showFeedback,
}) {
  return (
    <fieldset className="question-card">
      <legend className="question-card__legend">
        Question {index + 1} of {total}
      </legend>
      <p className="question-card__prompt">{question.prompt}</p>
      <ul className="question-card__options" role="radiogroup">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedIndex === optionIndex;
          const isCorrect = optionIndex === question.correctIndex;
          const isWrongSelection = showFeedback && isSelected && !isCorrect;
          const isCorrectSelection = showFeedback && isSelected && isCorrect;

          let optionClass = "question-card__option";
          if (isSelected) optionClass += " question-card__option--selected";
          if (isCorrectSelection)
            optionClass += " question-card__option--correct";
          if (isWrongSelection) optionClass += " question-card__option--wrong";

          return (
            <li key={optionIndex}>
              <label className={optionClass}>
                <input
                  type="radio"
                  name={`question-${question.questionId}`}
                  value={optionIndex}
                  checked={isSelected}
                  onChange={() => onSelect(optionIndex)}
                  disabled={showFeedback}
                />
                <span>{option}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {showFeedback && (
        <div className="question-card__feedback">
          {selectedIndex === question.correctIndex ? (
            <p className="question-card__correct">Correct.</p>
          ) : (
            <p className="question-card__wrong">
              {selectedIndex === null
                ? "Not answered."
                : `Incorrect. The correct answer is: ${question.options[question.correctIndex]}.`}
            </p>
          )}
          {question.explanation && (
            <p className="question-card__explanation">{question.explanation}</p>
          )}
        </div>
      )}
    </fieldset>
  );
}
