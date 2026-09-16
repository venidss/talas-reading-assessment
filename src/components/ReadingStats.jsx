/**
 * Compact reading statistics mini-panel with correct vs error counts.
 */
export default function ReadingStats({
  wordsCompleted,
  wordsIncorrect,
  totalWords,
  wpm,
  sentencesCompleted,
  readingStarted,
}) {
  if (!readingStarted) return null;

  const stats = [
    {
      label: 'Tama',
      value: `${wordsCompleted}/${totalWords}`,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ),
      color: 'text-talas-600',
    },
    ...(wordsIncorrect > 0
      ? [
          {
            label: 'Mali',
            value: wordsIncorrect,
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ),
            color: 'text-rose-500',
          },
        ]
      : []),
    {
      label: 'Bilis (WPM)',
      value: wpm,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      color: 'text-warm-500',
    },
    {
      label: 'Pangungusap',
      value: sentencesCompleted,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-sky-500',
    },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5 animate-fade-in flex-wrap">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-xs"
        >
          <span className={stat.color}>{stat.icon}</span>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">
              {stat.label}
            </span>
            <span className="text-sm font-extrabold text-gray-700 leading-tight">
              {stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
