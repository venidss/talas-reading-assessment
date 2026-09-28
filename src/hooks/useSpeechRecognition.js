import { useState, useEffect, useRef, useCallback } from 'react';
import { normalizeWord } from '../utils/textProcessing';

/**
 * Speech Recognition Hook
 * Streams an append-only ledger of normalized, finalized spoken words
 * for accurate word-by-word reading assessment.
 */
export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenTokens, setSpokenTokens] = useState([]);
  const [recognitionVersion, setRecognitionVersion] = useState(0);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fil-PH';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const finalizedTokens = [];

        // Interim transcripts are mutable guesses. Committing only newly finalized
        // results prevents partial words from advancing the assessment.
        for (let i = event.resultIndex ?? 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result?.isFinal || !result[0]) continue;

          const rawWords = result[0].transcript.trim().split(/\s+/).filter(Boolean);
          rawWords.forEach((rawWord) => {
            const word = normalizeWord(rawWord);
            if (word) finalizedTokens.push({ word, isComplete: true });
          });
        }

        if (finalizedTokens.length > 0) {
          // Keep an append-only ledger so the session's consumed-token cursor
          // remains valid across pauses and automatic recognition restarts.
          setSpokenTokens((previous) => [...previous, ...finalizedTokens]);
          setRecognitionVersion((version) => version + 1);
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
    }

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
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    // Preserve finalized tokens when the microphone is paused and resumed.
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
