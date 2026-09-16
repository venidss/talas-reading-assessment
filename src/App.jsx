import { useState, useCallback } from 'react';
import { useReadingSession } from './hooks/useReadingSession';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import ReadingPage from './components/ReadingPage';
import CompletionScreen from './components/CompletionScreen';
import QuizPage from './components/QuizPage';
import ReadingResult from './components/ReadingResult';

/**
 * Talas Filipino Reading Assessment — Main App
 *
 * Screen flow: reading → completion → quiz → results
 */
export default function App() {
  const [screen, setScreen] = useState('reading'); // reading | completion | quiz | results
  const [quizScore, setQuizScore] = useState(0);

  const session = useReadingSession();
  const speech = useSpeechRecognition();

  const handleReadingComplete = useCallback(() => {
    setScreen('completion');
  }, []);

  const handleContinueToQuiz = useCallback(() => {
    setScreen('quiz');
  }, []);

  const handleQuizComplete = useCallback((score) => {
    setQuizScore(score);
    setScreen('results');
  }, []);

  const handleRestart = useCallback(() => {
    session.restart();
    speech.resetTranscript();
    setQuizScore(0);
    setScreen('reading');
  }, [session, speech]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Talas header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/60 backdrop-blur-md border-b border-white/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-talas-400 to-talas-600 flex items-center justify-center shadow-sm">
            <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2 Q15 8 10 18 Q5 8 10 2Z" />
            </svg>
          </div>
          <span className="text-lg font-extrabold text-talas-700 tracking-tight">Talas</span>
          <span className="hidden sm:inline text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            Reading Assessment
          </span>
        </div>

        {/* Screen indicator */}
        <div className="flex items-center gap-2">
          {['reading', 'completion', 'quiz', 'results'].map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-1 ${i > 0 ? '' : ''}`}
            >
              {i > 0 && <div className="w-4 h-px bg-gray-200 hidden sm:block" />}
              <div
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${s === screen
                    ? 'bg-talas-500 scale-125'
                    : ['reading', 'completion', 'quiz', 'results'].indexOf(s) < ['reading', 'completion', 'quiz', 'results'].indexOf(screen)
                    ? 'bg-talas-300'
                    : 'bg-gray-200'
                  }
                `}
              />
            </div>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center overflow-y-auto">
        {screen === 'reading' && (
          <ReadingPage
            session={session}
            speech={speech}
            onReadingComplete={handleReadingComplete}
          />
        )}
        {screen === 'completion' && (
          <CompletionScreen
            session={session}
            onContinue={handleContinueToQuiz}
          />
        )}
        {screen === 'quiz' && (
          <QuizPage onComplete={handleQuizComplete} />
        )}
        {screen === 'results' && (
          <ReadingResult
            session={session}
            quizScore={quizScore}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}
