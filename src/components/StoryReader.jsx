import { useRef, useEffect } from 'react';
import { words as storyWords } from '../data/story';
import Word from './Word';
import PunctuationIndicator from './PunctuationIndicator';

/**
 * Story text display area with karaoke-style word tracking and error states.
 */
export default function StoryReader({
  currentWordIndex,
  completedWords,
  errorWords,
  activeWordHasError,
  missedPunctuations,
  justCompletedWord,
  activePunctuation,
  readingStarted,
}) {
  const containerRef = useRef(null);

  // Auto-scroll to keep current reading position centered
  useEffect(() => {
    if (!readingStarted) return;
    const currentEl = containerRef.current?.querySelector(`[data-word-id="${currentWordIndex}"]`);
    if (currentEl) {
      currentEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [currentWordIndex, readingStarted]);

  let lastParagraph = -1;

  return (
    <div className="relative">
      {/* Story text */}
      <div
        ref={containerRef}
        className="glass-card p-6 sm:p-8 md:p-10 max-h-[360px] sm:max-h-[420px] overflow-y-auto scroll-smooth"
      >
        <div className="flex flex-wrap items-baseline gap-y-2">
          {storyWords.map((word) => {
            const isCompleted = completedWords?.has(word.id);
            const isError = errorWords?.has(word.id);
            const isCurrent = word.id === currentWordIndex;

            const state = isCompleted
              ? 'completed'
              : isError
              ? 'error'
              : isCurrent
              ? 'current'
              : 'upcoming';

            const paragraphBreak = word.paragraphIndex !== lastParagraph && word.paragraphIndex > 0;
            lastParagraph = word.paragraphIndex;

            return (
              <Word
                key={word.id}
                word={word}
                state={state}
                showSparkle={justCompletedWord === word.id}
                paragraphBreakBefore={paragraphBreak}
                hasMissedPunctuation={missedPunctuations?.has(word.id)}
                hasAttemptError={isCurrent && activeWordHasError}
              />
            );
          })}
        </div>
      </div>

      {/* Punctuation indicator overlay */}
      {activePunctuation && (
        <div className="flex justify-center mt-3">
          <PunctuationIndicator activePunctuation={activePunctuation} />
        </div>
      )}
    </div>
  );
}
