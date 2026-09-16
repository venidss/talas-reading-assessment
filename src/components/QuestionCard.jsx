import { useState } from 'react';

/**
 * Individual comprehension question card.
 */
export default function QuestionCard({ question, questionNumber, totalQuestions, onAnswer }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index) => {
    if (answered) return;
    setSelectedIndex(index);
    setAnswered(true);
    // Delay before calling onAnswer so the user can see the result
    setTimeout(() => {
      onAnswer(index === question.correctIndex);
    }, 2200);
  };

  const isCorrect = selectedIndex === question.correctIndex;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in-up">
      {/* Question number */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold text-talas-600 bg-talas-100 px-3 py-1 rounded-full">
          Tanong {questionNumber} ng {totalQuestions}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i < questionNumber - 1
                  ? 'bg-talas-400'
                  : i === questionNumber - 1
                  ? 'bg-talas-500 scale-125'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="glass-card p-6 sm:p-8 mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 leading-relaxed">
          {question.question}
        </h3>
      </div>

      {/* Choices */}
      <div className="grid gap-3">
        {question.choices.map((choice, index) => {
          let btnStyle = 'bg-white border-gray-200 hover:border-talas-300 hover:bg-talas-50';

          if (answered) {
            if (index === question.correctIndex) {
              btnStyle = 'bg-talas-50 border-talas-400 ring-2 ring-talas-300';
            } else if (index === selectedIndex && !isCorrect) {
              btnStyle = 'bg-rose-50 border-rose-400 ring-2 ring-rose-300';
            } else {
              btnStyle = 'bg-gray-50 border-gray-200 opacity-50';
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={answered}
              className={`
                choice-btn
                flex items-center gap-4 w-full text-left
                p-4 sm:p-5 rounded-2xl border-2
                ${btnStyle}
                transition-all duration-200
              `}
            >
              <span className={`
                flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                font-bold text-sm
                ${answered && index === question.correctIndex
                  ? 'bg-talas-500 text-white'
                  : answered && index === selectedIndex && !isCorrect
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {answered && index === question.correctIndex ? '✓' :
                 answered && index === selectedIndex && !isCorrect ? '✗' :
                 letters[index]}
              </span>
              <span className="text-base sm:text-lg font-medium text-gray-700">
                {choice}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div className={`
          mt-4 p-4 rounded-2xl animate-fade-in-up
          ${isCorrect
            ? 'bg-talas-50 border border-talas-200'
            : 'bg-rose-50 border border-rose-200'
          }
        `}>
          <p className={`text-sm font-bold mb-1 ${isCorrect ? 'text-talas-700' : 'text-rose-700'}`}>
            {isCorrect ? '🌟 Tama!' : '💡 Hindi tama.'}
          </p>
          <p className="text-sm text-gray-600">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
