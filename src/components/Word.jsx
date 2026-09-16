import { useState, useEffect } from 'react';

/**
 * Individual word in the story with karaoke states:
 * - 'completed': correctly read (green)
 * - 'error': misread or skipped (red)
 * - 'current': active word being read (gold highlight)
 * - 'upcoming': not yet read (muted gray)
 */
export default function Word({
  word,
  state,
  showSparkle,
  paragraphBreakBefore,
  hasMissedPunctuation,
  hasAttemptError,
}) {
  const [sparkleVisible, setSparkleVisible] = useState(false);

  useEffect(() => {
    if (showSparkle) {
      setSparkleVisible(true);
      const timer = setTimeout(() => setSparkleVisible(false), 600);
      return () => clearTimeout(timer);
    }
  }, [showSparkle]);

  const stateClass =
    state === 'completed'
      ? 'word-completed'
      : state === 'error'
      ? 'word-error'
      : state === 'current'
      ? hasAttemptError
        ? 'word-current-error'
        : 'word-current'
      : 'word-upcoming';

  return (
    <>
      {paragraphBreakBefore && (
        <span className="block w-full h-4" aria-hidden="true" />
      )}
      <span
        className={`word-base ${stateClass} text-lg sm:text-xl md:text-2xl leading-relaxed mr-1.5 mb-1 relative select-none`}
        data-word-id={word.id}
      >
        <span>{word.cleanText}</span>

        {/* Punctuation mark with missed pause indicator */}
        {word.punctuationAfter && (
          <span
            className={
              hasMissedPunctuation
                ? 'text-rose-600 font-extrabold bg-rose-100/90 px-1 py-0.5 rounded ml-0.5 border border-rose-300 shadow-xs'
                : ''
            }
            title={hasMissedPunctuation ? 'Walang sapat na hinto sa bantas' : ''}
          >
            {word.punctuationAfter}
          </span>
        )}

        {/* Sparkle particles on correct match */}
        {sparkleVisible && (
          <span className="sparkle-container" aria-hidden="true">
            <span className="sparkle-particle" />
            <span className="sparkle-particle" />
            <span className="sparkle-particle" />
            <span className="sparkle-particle" />
          </span>
        )}
      </span>
    </>
  );
}
