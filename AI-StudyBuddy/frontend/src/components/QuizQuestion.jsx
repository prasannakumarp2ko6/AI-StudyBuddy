export default function QuizQuestion({ question, index, selectedAnswer, onSelect, submitted }) {
  const isCorrect = submitted && selectedAnswer === question.correctAnswer;
  const isWrong = submitted && selectedAnswer && selectedAnswer !== question.correctAnswer;

  return (
    <div className={`card quiz-question ${submitted ? (isCorrect ? 'correct' : isWrong ? 'incorrect' : '') : ''}`}>
      <h4>
        Q{index + 1}. {question.question}
      </h4>
      <div className="quiz-options">
        {question.options.map((opt, i) => {
          let optClass = 'quiz-option';
          if (submitted) {
            if (opt === question.correctAnswer) optClass += ' correct-option';
            else if (opt === selectedAnswer) optClass += ' incorrect-option';
          } else if (opt === selectedAnswer) {
            optClass += ' selected';
          }
          return (
            <label key={i} className={optClass}>
              <input
                type="radio"
                name={`question-${index}`}
                checked={selectedAnswer === opt}
                disabled={submitted}
                onChange={() => onSelect(opt)}
              />
              {opt}
            </label>
          );
        })}
      </div>
      {submitted && question.explanation && (
        <p className="quiz-explanation">
          <strong>Explanation:</strong> {question.explanation}
        </p>
      )}
    </div>
  );
}
