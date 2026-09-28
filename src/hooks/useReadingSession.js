import { useState, useRef, useCallback, useEffect } from 'react';
import { words as storyWords } from '../data/story';
import { fuzzyMatch, getPunctuationType, calculateWPM } from '../utils/textProcessing';

/**
 * Reading session state machine.
 * - Words turn GREEN when pronounced correctly.
 * - Words turn RED when moving to the next word confirms that one was skipped.
 * - Tracks observance of punctuation pauses (comma, period, question mark).
 * - Continuous timer (no pause).
 */
export function useReadingSession() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState(new Set()); // GREEN words
  const [errorWords, setErrorWords] = useState(new Set()); // RED words
  const [missedPunctuations, setMissedPunctuations] = useState(new Set()); // RED punctuation
  const [punctuationEvents, setPunctuationEvents] = useState([]); // Correctly observed pauses
  const [activePunctuation, setActivePunctuation] = useState(null);
  const [sentencesCompleted, setSentencesCompleted] = useState(new Set());
  const [justCompletedWord, setJustCompletedWord] = useState(null);
  const [justCompletedSentence, setJustCompletedSentence] = useState(false);
  const [readingStarted, setReadingStarted] = useState(false);
  const [readingFinished, setReadingFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timerRef = useRef(null);
  const wordTimestampsRef = useRef([]);
  const currentWordIndexRef = useRef(0);
  const consumedTokenIndexRef = useRef(0);

  // Punctuation compliance tracking refs
  const lastPunctuationTimeRef = useRef(null);
  const lastPunctuationWordRef = useRef(null);
  const lastPunctuationTypeRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  // Continuous timer
  useEffect(() => {
    if (readingStarted && !readingFinished) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [readingStarted, readingFinished]);

  /**
   * Helper: check if student paused appropriately at previous punctuation
   */
  const checkPreviousPunctuation = useCallback(() => {
    if (lastPunctuationTimeRef.current == null) return;

    const pauseDuration = Date.now() - lastPunctuationTimeRef.current;
    const punctType = lastPunctuationTypeRef.current;
    const wordIdx = lastPunctuationWordRef.current;

    // Required pause:
    // Comma: at least 350ms
    // Period / Question / Exclamation: at least 650ms
    const minRequired = punctType === 'comma' ? 350 : 650;

    if (pauseDuration < minRequired) {
      setMissedPunctuations((prev) => new Set(prev).add(wordIdx));
    } else {
      setPunctuationEvents((prev) => [
        ...prev,
        { type: punctType, wordIndex: wordIdx, pauseDuration },
      ]);
    }

    lastPunctuationTimeRef.current = null;
    lastPunctuationWordRef.current = null;
    lastPunctuationTypeRef.current = null;
  }, []);

  /**
   * Arm punctuation timer if a word has punctuation
   */
  const armPunctuationIfAny = useCallback((wordIdx) => {
    const word = storyWords[wordIdx];
    if (!word) return;

    const punct = word.punctuationAfter;
    const punctType = getPunctuationType(punct);
    if (punctType) {
      lastPunctuationTimeRef.current = Date.now();
      lastPunctuationWordRef.current = wordIdx;
      lastPunctuationTypeRef.current = punctType;
      setActivePunctuation({ type: punctType, wordIndex: wordIdx });
      setTimeout(() => setActivePunctuation(null), 800);

      if (punctType === 'period' || punctType === 'question' || punctType === 'exclamation') {
        setSentencesCompleted((prev) => new Set(prev).add(word.sentenceIndex));
        setJustCompletedSentence(true);
        setTimeout(() => setJustCompletedSentence(false), 1200);
      }
    }
  }, []);

  /**
   * Process incoming tokens:
   * Consumes tokens sequentially so every spoken word is accurately evaluated.
   */
  const tryMatchTokens = useCallback((spokenTokens) => {
    if (readingFinished || !readingStarted) return false;
    if (!spokenTokens || spokenTokens.length === 0) return false;

    let tokenIdx = consumedTokenIndexRef.current;
    let targetIdx = currentWordIndexRef.current;

    const newCompleted = [];
    const newErrors = [];

    while (tokenIdx < spokenTokens.length && targetIdx < storyWords.length) {
      const token = spokenTokens[tokenIdx];

      // Never score a mutable recognition hypothesis. This guard must run before
      // both direct matching and lookahead so partial words cannot advance.
      if (!token?.isComplete) break;

      const targetWord = storyWords[targetIdx];

      // 1. Direct match with expected word
      if (fuzzyMatch(targetWord.cleanText, token.word)) {
        checkPreviousPunctuation();
        newCompleted.push(targetIdx);
        armPunctuationIfAny(targetIdx);
        targetIdx++;
        tokenIdx++;
        continue;
      }

      // 2. Lookahead check: did student skip targetIdx and speak targetIdx + 1?
      if (targetIdx + 1 < storyWords.length && fuzzyMatch(storyWords[targetIdx + 1].cleanText, token.word)) {
        checkPreviousPunctuation();
        // targetIdx was skipped -> mark RED
        newErrors.push(targetIdx);
        // targetIdx + 1 was correctly spoken -> mark GREEN
        newCompleted.push(targetIdx + 1);
        armPunctuationIfAny(targetIdx + 1);
        targetIdx = targetIdx + 2;
        tokenIdx++;
        continue;
      }

      // A finalized fragment or background sound is not enough evidence that the
      // reader skipped this word. Consume it but keep the target active for a retry.
      // If the reader later says the following word, lookahead records the skip.
      tokenIdx++;
    }

    consumedTokenIndexRef.current = tokenIdx;
    currentWordIndexRef.current = targetIdx;

    if (newCompleted.length > 0) {
      setCompletedWords((prev) => {
        const next = new Set(prev);
        newCompleted.forEach((idx) => next.add(idx));
        return next;
      });

      const last = newCompleted[newCompleted.length - 1];
      setJustCompletedWord(last);
      setTimeout(() => setJustCompletedWord(null), 600);
    }

    if (newErrors.length > 0) {
      setErrorWords((prev) => {
        const next = new Set(prev);
        newErrors.forEach((idx) => next.add(idx));
        return next;
      });
    }

    // Timestamps
    [...newCompleted, ...newErrors].forEach((idx) => {
      wordTimestampsRef.current.push({ index: idx, time: elapsedTime });
    });

    // Check completion
    if (targetIdx >= storyWords.length) {
      checkPreviousPunctuation();
      setReadingFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentWordIndex(storyWords.length);
    } else {
      setCurrentWordIndex(targetIdx);
    }

    return newCompleted.length > 0 || newErrors.length > 0;
  }, [readingFinished, readingStarted, elapsedTime, checkPreviousPunctuation, armPunctuationIfAny]);

  /**
   * Start reading
   */
  const startReading = useCallback(() => {
    setReadingStarted(true);
  }, []);

  /**
   * Restart session
   */
  const restart = useCallback(() => {
    currentWordIndexRef.current = 0;
    consumedTokenIndexRef.current = 0;
    setCurrentWordIndex(0);
    setCompletedWords(new Set());
    setErrorWords(new Set());
    setMissedPunctuations(new Set());
    setPunctuationEvents([]);
    setActivePunctuation(null);
    setSentencesCompleted(new Set());
    setJustCompletedWord(null);
    setJustCompletedSentence(false);
    setReadingStarted(false);
    setReadingFinished(false);
    setElapsedTime(0);
    wordTimestampsRef.current = [];
    lastPunctuationTimeRef.current = null;
    lastPunctuationWordRef.current = null;
    lastPunctuationTypeRef.current = null;
  }, []);

  // Derived stats
  const totalWords = storyWords.length;
  const wordsCorrect = completedWords.size;
  const wordsIncorrect = errorWords.size;
  const wordsProcessed = wordsCorrect + wordsIncorrect;
  const progressPercent = totalWords > 0 ? Math.round((wordsProcessed / totalWords) * 100) : 0;
  const wpm = calculateWPM(wordsCorrect, elapsedTime);
  const accuracy = wordsProcessed > 0
    ? Math.round((wordsCorrect / wordsProcessed) * 100)
    : 100;

  const currentSentenceIndex = storyWords[currentWordIndex]?.sentenceIndex ?? 0;

  return {
    // State
    currentWordIndex,
    completedWords,
    errorWords,
    missedPunctuations,
    punctuationEvents,
    activePunctuation,
    sentencesCompleted,
    justCompletedWord,
    justCompletedSentence,
    currentSentenceIndex,
    readingStarted,
    readingFinished,
    elapsedTime,

    // Derived
    totalWords,
    wordsCompleted: wordsCorrect,
    wordsIncorrect,
    progressPercent,
    wpm,
    accuracy,

    // Actions
    startReading,
    restart,
    tryMatchTokens,
  };
}
