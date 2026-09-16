import { formatTime } from '../utils/textProcessing';
import { questions, words as storyWords } from '../data/story';

/**
 * Final combined results page with error word breakdown and punctuation evaluation.
 */
export default function ReadingResult({ session, quizScore, onRestart }) {
  const totalQuestions = questions.length;
  const comprehensionPercent = Math.round((quizScore / totalQuestions) * 100);

  const totalPunctuations = storyWords.filter((w) => w.punctuationAfter).length;
  const observedPunctuations = session.punctuationEvents.length;
  const missedPunctuationsCount = session.missedPunctuations.size;

  // Punctuation rating
  const getPunctuationRating = () => {
    if (missedPunctuationsCount === 0 && observedPunctuations >= 4) {
      return { label: 'Napakahusay', detail: 'Nasunod lahat ng bantas', color: 'text-talas-600' };
    }
    if (missedPunctuationsCount <= 2) {
      return { label: 'Kasiya-siya', detail: `${missedPunctuationsCount} nakaligtaang bantas`, color: 'text-warm-500' };
    }
    return { label: 'Kailangang Pagbutihin', detail: `${missedPunctuationsCount} hindi nahintuan`, color: 'text-rose-500' };
  };

  // Overall encouragement
  const getOverallFeedback = () => {
    const avg = (session.accuracy + comprehensionPercent) / 2;
    if (avg >= 85 && session.errorWords.size === 0) return {
      level: 'Perpektong Pagbasa!',
      message: 'Napakalinaw ng iyong pagbasa at nasunod ang mga tamang hinto sa bawat bantas. Ipagpatuloy!',
      emoji: '🌟',
      color: 'from-talas-500 to-emerald-500',
    };
    if (avg >= 80) return {
      level: 'Napakahusay!',
      message: 'Mahusay ang iyong pagbasa at pag-unawa sa kwento.',
      emoji: '👏',
      color: 'from-talas-500 to-sky-500',
    };
    if (avg >= 60) return {
      level: 'Magaling!',
      message: 'Maganda ang naging simula. Bigyang pansin ang mga salitang may marka at ang paghinto sa bantas.',
      emoji: '📖',
      color: 'from-talas-500 to-amber-500',
    };
    return {
      level: 'Magpatuloy sa Pagsasanay!',
      message: 'Huwag mag-alala! Ang regular na pagbasa nang malakas ay magpapabilis at magpapalinaw ng iyong pagbigkas.',
      emoji: '💪',
      color: 'from-warm-500 to-rose-500',
    };
  };

  const punct = getPunctuationRating();
  const feedback = getOverallFeedback();

  // Find the exact words that were misread
  const misreadWordsList = Array.from(session.errorWords)
    .map((idx) => storyWords[idx])
    .filter(Boolean);

  const resultCards = [
    {
      label: 'Katumpakan',
      value: `${session.accuracy}%`,
      icon: '🎯',
      detail: `${session.wordsCompleted} tamang salita`,
      progress: session.accuracy,
      progressColor: 'bg-talas-400',
    },
    {
      label: 'Maling Salita',
      value: session.wordsIncorrect,
      icon: '❌',
      detail: session.wordsIncorrect === 0 ? 'Walang mali' : 'Kailangang sanayin',
      progress: session.wordsIncorrect === 0 ? 100 : Math.max(0, 100 - session.wordsIncorrect * 20),
      progressColor: session.wordsIncorrect === 0 ? 'bg-emerald-400' : 'bg-rose-400',
    },
    {
      label: 'Pagsunod sa Bantas',
      value: punct.label,
      icon: '⏸️',
      detail: punct.detail,
      progress: totalPunctuations > 0 ? Math.round(((totalPunctuations - missedPunctuationsCount) / totalPunctuations) * 100) : 100,
      progressColor: missedPunctuationsCount === 0 ? 'bg-talas-400' : 'bg-amber-400',
    },
    {
      label: 'Bilis ng Pagbasa',
      value: `${session.wpm} WPM`,
      icon: '⚡',
      detail: 'salita kada minuto',
      progress: Math.min(session.wpm, 120) / 120 * 100,
      progressColor: 'bg-warm-400',
    },
    {
      label: 'Pag-unawa',
      value: `${quizScore}/${totalQuestions}`,
      icon: '📚',
      detail: `${comprehensionPercent}% tama sa pagsusulit`,
      progress: comprehensionPercent,
      progressColor: 'bg-sky-400',
    },
    {
      label: 'Oras ng Pagbasa',
      value: formatTime(session.elapsedTime),
      icon: '⏱️',
      detail: 'kabuuang oras',
      progress: null,
      progressColor: null,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header with feedback */}
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="text-5xl mb-3">{feedback.emoji}</div>
        <h2 className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${feedback.color} bg-clip-text text-transparent mb-2`}>
          {feedback.level}
        </h2>
        <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
          {feedback.message}
        </p>
      </div>

      {/* Result cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {resultCards.map((card, i) => (
          <div
            key={card.label}
            className="stat-card rounded-2xl p-4 sm:p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-0.5">{card.value}</div>
            <div className="text-xs text-gray-500 font-medium mb-1.5">{card.label}</div>
            <div className="text-[11px] text-gray-400 font-normal mb-2">{card.detail}</div>

            {card.progress !== null && (
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${card.progressColor} rounded-full transition-all duration-1000`}
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Misread words breakdown (if any) */}
      {misreadWordsList.length > 0 && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2 text-rose-800 font-bold text-sm">
            <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            Mga Salitang Kailangang Ulitin o Sanayin:
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {misreadWordsList.map((w) => (
              <span
                key={w.id}
                className="px-3 py-1 rounded-xl bg-white text-rose-700 font-bold text-xs border border-rose-200 shadow-xs"
              >
                {w.cleanText}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reading summary sentence */}
      <div className="glass-card p-5 sm:p-6 mb-8 animate-fade-in-up text-center">
        <p className="text-sm text-gray-500 font-medium mb-1">Buod ng Pagsusuri</p>
        <p className="text-base text-gray-700 leading-relaxed">
          Nabasa mo ang <strong>{session.wordsCompleted} sa {storyWords.length} na salita</strong> sa loob ng{' '}
          <strong>{formatTime(session.elapsedTime)}</strong> na may{' '}
          <strong>{session.accuracy}%</strong> katumpakan.
          {missedPunctuationsCount > 0
            ? ` Tandaan na huminto sandali sa bawat kuwit (,) at tuldok (.).`
            : ` Napakahusay ng iyong paghinto sa bawat bantas!`}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl
                     bg-gradient-to-r from-talas-500 to-talas-600
                     text-white font-bold text-lg
                     shadow-lg shadow-talas-500/25
                     hover:shadow-xl hover:shadow-talas-500/30
                     hover:scale-[1.02] active:scale-[0.98]
                     transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Magbasa Muli
        </button>
      </div>

      {/* Talas branding */}
      <div className="text-center mt-12 animate-fade-in">
        <p className="text-xs text-gray-400">
          Powered by <span className="font-bold text-talas-500">Talas</span> Filipino Reading Assessment
        </p>
      </div>
    </div>
  );
}
