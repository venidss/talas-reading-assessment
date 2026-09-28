import { useState, useEffect, useRef, useCallback } from 'react';
import { normalizeWord } from '../utils/textProcessing';

/**
 * Speech Recognition Hook
 *
 * Maintains a single, deduplicated list of spoken tokens built from the Web
 * Speech API's result stream.  Key design decisions:
 *
 * - Each SpeechRecognitionResult slot is tracked individually.  When an
 *   interim result for slot N is updated, we overwrite only slot N rather than
 *   re-appending it, preventing duplicate tokens.
 *
 * - A word is considered "complete" (ready to score) when:
 *     a) Its parent result is final, OR
 *     b) It is not the last word of an interim result (the engine has already
 *        moved past it), OR
 *     c) The result immediately after it (slot N+1) exists — meaning the engine
 *        has started a new segment and will no longer revise this one.
 *
 *   Rule (c) eliminates the one-word trailing delay: the last word of the
 *   current segment is promoted to complete as soon as the next segment begins.
 */
export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenTokens, setSpokenTokens] = useState([]);
  const [recognitionVersion, setRecognitionVersion] = useState(0);

  const recognitionRef = useRef(null);

  // Internal per-slot map: slotIndex → { words: string[], isFinal: bool }
  // This lets us overwrite a slot on each interim update instead of appending.
  const slotMapRef = useRef(new Map());

  /** Rebuild the flat token list from the current slot map. */
  const rebuildTokens = useCallback((slotMap) => {
    const tokens = [];
    const sortedSlots = [...slotMap.entries()].sort(([a], [b]) => a - b);
    const maxSlot = sortedSlots.length > 0 ? sortedSlots[sortedSlots.length - 1][0] : -1;

    for (const [slotIdx, slot] of sortedSlots) {
      const hasNextSlot = slotMap.has(slotIdx + 1) || slotIdx < maxSlot;

      slot.words.forEach((rawWord, wordIndex) => {
        const word = normalizeWord(rawWord);
        if (!word) return;

        const isLastWordInSlot = wordIndex === slot.words.length - 1;

        // A word is complete when:
        // 1. The whole result is finalized, OR
        // 2. It is not the last word in its interim segment (engine moved past it), OR
        // 3. A later result slot already exists (engine started a new segment)
        const isComplete = slot.isFinal || !isLastWordInSlot || hasNextSlot;

        tokens.push({ word, isComplete });
      });
    }

    return tokens;
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fil-PH';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const map = slotMapRef.current;
      let changed = false;

      for (let i = event.resultIndex ?? 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result?.[0]) continue;

        const transcript = result[0].transcript.trim();
        if (!transcript) continue;

        const rawWords = transcript.split(/\s+/).filter(Boolean);
        const isFinal = result.isFinal;

        const existing = map.get(i);
        // Only update if something actually changed to avoid needless rebuilds
        if (
          !existing ||
          existing.isFinal !== isFinal ||
          existing.words.join(' ') !== rawWords.join(' ')
        ) {
          map.set(i, { words: rawWords, isFinal });
          changed = true;
        }
      }

      if (changed) {
        const newTokens = rebuildTokens(map);
        setSpokenTokens(newTokens);
        setRecognitionVersion((v) => v + 1);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Speech recognition warning:', event.error);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current?._shouldListen) {
        try {
          recognition.start();
        } catch {
          // Already started
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current._shouldListen = false;
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, [rebuildTokens]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current._shouldListen = true;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // Already running
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current._shouldListen = false;
    try {
      recognitionRef.current.stop();
    } catch {
      // Ignore
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    slotMapRef.current = new Map();
    setSpokenTokens([]);
    setRecognitionVersion(0);
  }, []);

  return {
    isSupported,
    isListening,
    spokenTokens,
    recognitionVersion,
    start,
    stop,
    resetTranscript,
  };
}
