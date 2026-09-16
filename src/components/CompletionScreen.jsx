import { useMemo } from 'react';
import { formatTime, calculateWPM } from '../utils/textProcessing';

/**
 * Completion screen shown after finishing the story.
 */
export default function CompletionScreen({ session, onContinue }) {
  // Confetti pieces
  const confetti = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      delay: `${Math.random() * 0.5}s`,
      color: ['#4ADE80', '#FBBF24', '#38BDF8', '#FB7185', '#A78BFA'][i % 5],
      rotation: Math.random() * 360,
    }));
  }, []);

  const stats = [
    {
      label: 'Oras ng Pagbasa',
      value: formatTime(session.elapsedTime),
      icon: '⏱️',
      color: 'from-sky-50 to-sky-100 border-sky-200',
    },
    {
      label: 'Mga Salita',
      value: `${session.wordsCompleted}`,
      icon: '📖',
      color: 'from-talas-50 to-talas-100 border-talas-200',
    },
    {
      label: 'Katumpakan',
      value: `${session.accuracy}%`,
      icon: '🎯',
      color: 'from-warm-50 to-warm-100 border-warm-200',
    },
    {
      label: 'Salita/Minuto',
      value: session.wpm,
      icon: '⚡',
      color: 'from-purple-50 to-purple-100 border-purple-200',
    },
    {
      label: 'Mga Paghinto',
      value: session.punctuationEvents.length,
      icon: '⏸️',
      color: 'from-rose-50 to-rose-100 border-rose-200',
    },
    {
      label: 'Pangungusap',
      value: session.sentencesCompleted.size,
      icon: '✅',
      color: 'from-emerald-50 to-emerald-100 border-emerald-200',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confetti.map((c) => (
          <div
            key={c.id}
            className="confetti-piece"
            style={{
              left: c.left,
              top: '30%',
              backgroundColor: c.color,
              animationDelay: c.delay,
              transform: `rotate(${c.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* Celebration header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="text-5xl mb-4">🌸</div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-talas-800 mb-2">
          Magaling!
        </h2>
        <p className="text-lg text-talas-600 font-medium">
          Natapos mo ang kuwento.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`
              stat-card rounded-2xl p-4 border text-center
              bg-gradient-to-br ${stat.color}
              animate-fade-in-up
            `}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-gray-800">{stat.value}</div>
            <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Continue button */}
      <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl
                     bg-gradient-to-r from-talas-500 to-talas-600
                     text-white font-bold text-lg
                     shadow-lg shadow-talas-500/25
                     hover:shadow-xl hover:shadow-talas-500/30
                     hover:scale-[1.02] active:scale-[0.98]
                     transition-all duration-200"
        >
          Sagutan ang mga Tanong
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
