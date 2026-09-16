/**
 * Quiz score summary with visual ring.
 */
export default function QuizResult({ score, total, onContinue }) {
  const percentage = Math.round((score / total) * 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  const getMessage = () => {
    if (percentage >= 80) return { text: 'Napakahusay!', emoji: '🌟' };
    if (percentage >= 60) return { text: 'Magaling!', emoji: '👏' };
    return { text: 'Subukan ulit!', emoji: '💪' };
  };

  const msg = getMessage();

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 text-center animate-fade-in-up">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">
        Reading Comprehension
      </h2>

      {/* Score ring */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <svg width="140" height="140" viewBox="0 0 100 100" className="-rotate-90">
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={percentage >= 60 ? '#22C55E' : '#F59E0B'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-gray-800">{score}/{total}</span>
          <span className="text-xs text-gray-500 font-medium">Tama</span>
        </div>
      </div>

      {/* Message */}
      <div className="mb-8">
        <span className="text-4xl mb-2 block">{msg.emoji}</span>
        <p className="text-xl font-bold text-talas-700">{msg.text}</p>
      </div>

      {/* Continue */}
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
        Tingnan ang Resulta
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
}
