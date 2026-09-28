import { useState, useRef, useCallback, useEffect } from 'react';
import { words as storyWords } from '../data/story';
import { fuzzyMatch, getPunctuationType, calculateWPM } from '../utils/textProcessing';

/**
 * Reading session state machine.
 *
 * Design notes for tryMatchTokens:
 * - elapsedTime is intentionally NOT in the useCallback dependency array.
 *   Reading it via a ref instead avoids recreating the function every second,
 *   which would cause stale closures and missed token batches.
 * - Lookahead scans up to LOOKAHEAD_LIMIT words ahead so that a skipped word
 *   is detected even if the reader skips more than one at a time.
 */

const LOOKAHEAD_LIMIT = 3; // how many words ahead to scan for a skip match

export function useReadingSession() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState(new Set());
  const [errorWords, setErrorWords] = useState(new Set());
  const [missedPunctuations, setMissedPunctuations] = useState(new Set());
  const [punctuationEvents, setPunctuationEvents] = useState([]);
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

  // Use a ref for elapsedTime so tryMatchTokens can read the current value
  // without being listed as a dependency (which would recreate it every second).
  const elapsedTimeRef = useRef(0);

  // Reading-state flags exposed as refs so tryMatchTokens never goes stale
  const readingStartedRef = useRef(false);
  const readingFinishedRef = useRef(false);

  // Punctuation compliance tracking refs
  const lastPunctuationTimeRef = useRef(null);
  const lastPunctuationWordRef = useRef(null);
  const lastPunctuationTypeRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  useEffect(() => {
    readingStartedRef.current = readingStarted;
  }, [readingStarted]);

  useEffect(() => {
    readingFinishedRef.current = readingFinished;
  }, [readingFinished]);

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
   * Check whether the reader paused long enough at the previous punctuation mark.
   */
  const checkPreviousPunctuation = useCallback(() => {
    if (lastPunctuationTimeRef.current == null) return;

    const pauseDuration = Date.now() - lastPunctuationTimeRef.current;
    const punctType = lastPunctuationTypeRef.current;
    const wordIdx = lastPunctuationWordRef.current;

    // Comma: ≥ 350 ms   Period / Question / Exclamation: ≥ 650 ms
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
   * Arm a punctuation pause timer if the completed word has trailing punctuation.
   */
  const armPunctuationIfAny = useCallback((wordIdx) => {
    const word = storyWords[wordIdx];
    if (!word) return;

    const punct = word.punctuationAfter;
    const punctType = getPunctuationType(punct);
    if (!punctType) return;

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
  }, []);

  /**
   * Process incoming tokens against the expected word list.
   *
   * Token consumption rules:
   * 1. Direct match   — advance both token and target pointers.
   * 2. Lookahead match — scan up to LOOKAHEAD_LIMIT words ahead; mark all
   *    skipped words as errors, mark the matched word as correct.
   * 3. No match       — consume the token (noise / mispronunciation) but keep
   *    the target pointer so the reader can retry the same word.
   *
   * Stability gate: incomplete (interim trailing) tokens are never scored.
   *
   * NOTE: elapsedTime is read from elapsedTimeRef so this function can be
   * stable (no timer-driven recreation every second).
   */
  const tryMatchTokens = useCallback((spokenTokens) => {
    // Read flags from refs to avoid stale closure issues
    if (readingFinishedRef.current || !readingStartedRef.current) return false;
    if (!spokenTokens || spokenTokens.length === 0) return false;

    let tokenIdx = consumedTokenIndexRef.current;
    let targetIdx = currentWordIndexRef.current;

    const newCompleted = [];
    const newErrors = [];

    while (tokenIdx < spokenTokens.length && targetIdx < storyWords.length) {
      const token = spokenTokens[tokenIdx];

      // Never score an unstable interim word — wait until it is finalized or
      // promoted by the arrival of a subsequent recognition segment.
      if (!token?.isComplete) break;

      const targetWord = storyWords[targetIdx];

      // 1. Direct match with the expected word
      if (fuzzyMatch(targetWord.cleanText, token.word)) {
        checkPreviousPunctuation();
        newCompleted.push(targetIdx);
        armPunctuationIfAny(targetIdx);
        targetIdx++;
        tokenIdx++;
        continue;
      }

      // 2. Lookahead: did the reader skip one or more words?
      //    Scan up to LOOKAHEAD_LIMIT positions ahead for a match.
      let lookaheadMatched = false;
      for (let skip = 1; skip <= LOOKAHEAD_LIMIT; skip++) {
        const lookaheadIdx = targetIdx + skip;
        if (lookaheadIdx >= storyWords.length) break;

        if (fuzzyMatch(storyWords[lookaheadIdx].cleanText, token.word)) {
          checkPreviousPunctuation();
          // Mark all skipped words as errors
          for (let s = 0; s < skip; s++) {
            newErrors.push(targetIdx + s);
          }
          // Mark the matched word as correct
          newCompleted.push(lookaheadIdx);
          armPunctuationIfAny(lookaheadIdx);
          targetIdx = lookaheadIdx + 1;
          tokenIdx++;
          lookaheadMatched = true;
          break;
        }
      }
      if (lookaheadMatched) continue;

      // 3. No match — consume the token (noise / wrong word) and retry the target.
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

    // Timestamps — read elapsed time from ref (no dependency needed)
    const now = elapsedTimeRef.current;
    [...newCompleted, ...newErrors].forEach((idx) => {
      wordTimestampsRef.current.push({ index: idx, time: now });
    });

    // Check for story completion
    if (targetIdx >= storyWords.length) {
      checkPreviousPunctuation();
      setReadingFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentWordIndex(storyWords.length);
    } else {
      setCurrentWordIndex(targetIdx);
    }

    return newCompleted.length > 0 || newErrors.length > 0;
    // elapsedTime deliberately omitted — read via elapsedTimeRef instead.
  }, [checkPreviousPunctuation, armPunctuationIfAny]);

  const startReading = useCallback(() => {
    setReadingStarted(true);
  }, []);

  const restart = useCallback(() => {
    currentWordIndexRef.current = 0;
    consumedTokenIndexRef.current = 0;
    elapsedTimeRef.current = 0;
    readingStartedRef.current = false;
    readingFinishedRef.current = false;

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
