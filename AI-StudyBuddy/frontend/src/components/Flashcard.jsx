import { useState } from 'react';

export default function Flashcard({ card, index, total }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flashcard-wrap">
      <div className="flashcard-meta">
        Card {index + 1} of {total}
      </div>
      <div className={`flashcard ${revealed ? 'flipped' : ''}`} onClick={() => setRevealed((r) => !r)}>
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-label">Question</span>
            <p>{card.question}</p>
            <span className="flashcard-hint">Click to reveal answer</span>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="flashcard-label">Answer</span>
            <p>{card.answer}</p>
            <span className="flashcard-hint">Click to see question</span>
          </div>
        </div>
      </div>
    </div>
  );
}
