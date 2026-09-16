import { useState, useEffect, useMemo } from 'react';

/**
 * Floating animated plant character with reactive behaviors.
 */
export default function FloatingCharacter({ justCompletedSentence, readingStarted, readingFinished }) {
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (justCompletedSentence) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 800);
      return () => clearTimeout(timer);
    }
  }, [justCompletedSentence]);

  // Floating leaves
  const leaves = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: `${15 + Math.random() * 70}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${8 + Math.random() * 6}s`,
      size: 12 + Math.random() * 8,
    }));
  }, []);

  return (
    <>
      {/* Floating character */}
      <div className={`
        hidden lg:flex flex-col items-center gap-2
        absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full
        ${bounce ? 'animate-bounce-gentle' : 'animate-float'}
      `}>
        {/* Plant pot SVG */}
        <svg width="64" height="80" viewBox="0 0 64 80" fill="none" className="drop-shadow-lg">
          {/* Pot */}
          <path d="M18 50 L46 50 L42 72 Q40 76 32 76 Q24 76 22 72 Z" fill="#D97706" />
          <path d="M18 48 L46 48 L46 52 L18 52 Z" fill="#B45309" rx="2" />
          {/* Soil */}
          <ellipse cx="32" cy="50" rx="12" ry="3" fill="#78350F" />
          {/* Stem */}
          <path d="M32 50 Q32 35 30 28" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M32 50 Q33 40 36 33" stroke="#16A34A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Leaves */}
          <ellipse cx="25" cy="26" rx="8" ry="5" fill="#4ADE80" transform="rotate(-30 25 26)" />
          <ellipse cx="39" cy="30" rx="7" ry="4.5" fill="#22C55E" transform="rotate(20 39 30)" />
          <ellipse cx="28" cy="20" rx="6" ry="4" fill="#86EFAC" transform="rotate(-15 28 20)" />
          {/* Flower (appears when reading completes) */}
          {readingFinished && (
            <g className="animate-grow">
              <circle cx="30" cy="14" r="4" fill="#FBBF24" />
              <circle cx="26" cy="12" r="3.5" fill="#FB7185" />
              <circle cx="34" cy="12" r="3.5" fill="#FB7185" />
              <circle cx="28" cy="17" r="3.5" fill="#FB7185" />
              <circle cx="33" cy="17" r="3.5" fill="#FB7185" />
              <circle cx="30" cy="14" r="2.5" fill="#FBBF24" />
            </g>
          )}
        </svg>

        {/* Speech bubble */}
        {justCompletedSentence && (
          <div className="absolute -top-8 -left-4 bg-white rounded-xl px-3 py-1.5 shadow-md text-xs font-bold text-talas-600 animate-fade-in-up whitespace-nowrap">
            Magaling! 🌟
            <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white transform rotate-45" />
          </div>
        )}
      </div>

      {/* Floating leaf particles */}
      {readingStarted && !readingFinished && leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="leaf-particle"
          style={{
            left: leaf.left,
            top: '-20px',
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
          }}
        >
          <svg width={leaf.size} height={leaf.size} viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2 Q15 8 10 18 Q5 8 10 2Z"
              fill={['#4ADE80', '#86EFAC', '#22C55E', '#BBF7D0'][leaf.id % 4]}
              opacity="0.7"
            />
          </svg>
        </div>
      ))}
    </>
  );
}
