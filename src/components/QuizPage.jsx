import { useState } from 'react';
import { questions } from '../data/story';
import QuestionCard from './QuestionCard';
import QuizResult from './QuizResult';

/**
 * Quiz flow controller — shows one question at a time.
 */
export default function QuizPage({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore((prev) => prev + 1);

    if (currentQuestion + 1 >= questions.length) {
      setQuizFinished(true);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  if (quizFinished) {
    return (
      <QuizResult
        score={score}
        total={questions.length}
        onContinue={() => onComplete(score)}
      />
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 bg-sky-100 px-4 py-1.5 rounded-full mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          Pag-unawa sa Binasa
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
          Sagutin ang mga Tanong
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Batay sa kuwentong &quot;Ang Munting Halaman&quot;
        </p>
      </div>

      <QuestionCard
        key={currentQuestion}
        question={questions[currentQuestion]}
        questionNumber={currentQuestion + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
