import { useEffect, useRef } from 'react';
import { storyTitle } from '../data/story';
import StoryHeader from './StoryHeader';
import StoryReader from './StoryReader';
import ReadingProgress from './ReadingProgress';
import MicrophoneButton from './MicrophoneButton';
import ReadingStats from './ReadingStats';
import FloatingCharacter from './FloatingCharacter';

/**
 * Main reading screen layout.
 * Runs directly with Web Speech recognition, real-time error marking (red words),
 * punctuation evaluation, and continuous timer.
 */
export default function ReadingPage({
  session,
  speech,
  onReadingComplete,
}) {
  const lastVersionRef = useRef(-1);

  // Start speech recognition and reading session together
  const handleStart = () => {
    session.startReading();
    if (speech.isSupported) {
      speech.start();
    }
  };

  // Handle restart
  const handleRestart = () => {
    speech.stop();
    speech.resetTranscript();
    session.restart();
    lastVersionRef.current = -1;
  };

  // Match speech recognition results sequentially against expected words.
  useEffect(() => {
    if (!speech.isSupported || !session.readingStarted || session.readingFinished) return;
    if (speech.recognitionVersion <= lastVersionRef.current) return;

    lastVersionRef.current = speech.recognitionVersion;

    const tokens = speech.spokenTokens;
    if (!tokens || tokens.length === 0) return;

    session.tryMatchTokens(tokens);
  }, [
    speech.recognitionVersion,
    speech.spokenTokens,
    speech.isSupported,
    session.readingStarted,
    session.readingFinished,
    session.tryMatchTokens,
  ]);

  // Watch for reading completion
  useEffect(() => {
    if (session.readingFinished) {
      if (speech.isSupported) speech.stop();
      const timer = setTimeout(() => onReadingComplete(), 2000);
      return () => clearTimeout(timer);
    }
  }, [session.readingFinished, speech, session, onReadingComplete]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 relative">
      {/* Progress bar with continuous timer */}
      <ReadingProgress
        progressPercent={session.progressPercent}
        wordsCompleted={session.wordsCompleted}
        totalWords={session.totalWords}
        elapsedTime={session.elapsedTime}
        readingStarted={session.readingStarted}
        onRestart={handleRestart}
      />

      {/* Story header */}
      <StoryHeader
        title={storyTitle}
        currentSentenceIndex={session.currentSentenceIndex}
        readingStarted={session.readingStarted}
      />

      {/* Story reader with karaoke, red error markings, and punctuation indicators */}
      <div className="relative mb-6">
        <StoryReader
          currentWordIndex={session.currentWordIndex}
          completedWords={session.completedWords}
          errorWords={session.errorWords}
          activeWordHasError={session.activeWordHasError}
          missedPunctuations={session.missedPunctuations}
          justCompletedWord={session.justCompletedWord}
          activePunctuation={session.activePunctuation}
          readingStarted={session.readingStarted}
        />

        <FloatingCharacter
          justCompletedSentence={session.justCompletedSentence}
          readingStarted={session.readingStarted}
          readingFinished={session.readingFinished}
        />
      </div>

      {/* Microphone controls (100% microphone, no demo mode) */}
      <div className="mb-6">
        <MicrophoneButton
          isListening={speech.isListening}
          isSupported={speech.isSupported}
          readingStarted={session.readingStarted}
          onStart={handleStart}
          onStop={() => speech.stop()}
        />
      </div>

      {/* Stats */}
      <ReadingStats
        wordsCompleted={session.wordsCompleted}
        wordsIncorrect={session.wordsIncorrect}
        totalWords={session.totalWords}
        wpm={session.wpm}
        sentencesCompleted={session.sentencesCompleted.size}
        readingStarted={session.readingStarted}
      />
    </div>
  );
}
