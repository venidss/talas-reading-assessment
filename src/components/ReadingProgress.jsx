import { formatTime } from '../utils/textProcessing';

/**
 * Top progress bar with reading stats and restart control (no pause).
 */
export default function ReadingProgress({
  progressPercent,
  wordsCompleted,
  totalWords,
  elapsedTime,
  readingStarted,
  onRestart,
}) {
  return (
    <div className="glass-card p-4 sm:p-5 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        {/* Progress label */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-talas-700">Progreso ng Pagbasa</span>
          <span className="text-xs font-bold text-talas-500 bg-talas-100 px-2.5 py-0.5 rounded-full">
            {progressPercent}%
          </span>
        </div>

        {/* Timer and restart */}
        <div className="flex items-center gap-3">
          {/* Continuous Timer */}
          <div className="flex items-center gap-1.5 text-sm font-mono text-gray-700 bg-gray-100/80 px-3 py-1.5 rounded-xl border border-gray-200/60 shadow-xs">
            <svg className="w-4 h-4 text-talas-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{formatTime(elapsedTime)}</span>
          </div>

          {/* Restart */}
          {readingStarted && (
            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                         bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200/60
                         transition-all duration-200 active:scale-95 shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Ulitin
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="progress-fill h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Word count */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{wordsCompleted} / {totalWords} salita</span>
        <span>{progressPercent}% tapos na</span>
      </div>
    </div>
  );
}
