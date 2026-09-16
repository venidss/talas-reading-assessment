import { totalSentences } from '../data/story';

/**
 * Story title and current sentence indicator.
 */
export default function StoryHeader({ title, currentSentenceIndex, readingStarted }) {
  return (
    <div className="text-center mb-6 animate-fade-in">
      {/* Decorative leaf */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <svg className="w-6 h-6 text-talas-400 animate-float" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
        </svg>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-talas-800 tracking-tight">
          {title}
        </h1>
        <svg className="w-6 h-6 text-talas-400 animate-float-slow" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
        </svg>
      </div>

      {readingStarted && (
        <p className="text-sm text-talas-600 font-medium animate-fade-in">
          Pangungusap {currentSentenceIndex + 1} ng {totalSentences}
        </p>
      )}
    </div>
  );
}
