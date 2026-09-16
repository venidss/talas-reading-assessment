/**
 * Small floating indicator for punctuation events.
 */
export default function PunctuationIndicator({ activePunctuation }) {
  if (!activePunctuation) return null;

  const config = {
    comma: {
      label: 'Sandaling Paghinto',
      icon: '⏸',
      bg: 'bg-warm-100',
      text: 'text-warm-500',
      border: 'border-warm-200',
    },
    period: {
      label: 'Tapos ang pangungusap',
      icon: '✓',
      bg: 'bg-talas-100',
      text: 'text-talas-600',
      border: 'border-talas-200',
    },
    question: {
      label: 'Tanong',
      icon: '❓',
      bg: 'bg-sky-100',
      text: 'text-sky-500',
      border: 'border-sky-200',
    },
    exclamation: {
      label: 'Padamdam!',
      icon: '❗',
      bg: 'bg-rose-100',
      text: 'text-rose-500',
      border: 'border-rose-200',
    },
    colon: {
      label: 'Paghinto',
      icon: '⏸',
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
    },
  };

  const c = config[activePunctuation.type] || config.comma;

  return (
    <div className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-full
      ${c.bg} ${c.text} border ${c.border}
      text-sm font-semibold
      animate-fade-in-up
      shadow-sm
    `}>
      <span className="text-base">{c.icon}</span>
      <span>{c.label}</span>
    </div>
  );
}
