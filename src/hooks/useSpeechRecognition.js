import { useState, useEffect, useRef, useCallback } from 'react';
import { normalizeWord } from '../utils/textProcessing';

/**
 * Speech Recognition Hook
 * Streams normalized spoken tokens with completion status (isComplete)
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
        const tokens = [];

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (!res || !res[0]) continue;

          const transcript = res[0].transcript.trim();
          const isFinal = res.isFinal;
          if (!transcript) continue;

          const rawWords = transcript.split(/\s+/).filter(Boolean);
          rawWords.forEach((w, wordIdx) => {
            const normalized = normalizeWord(w);
            if (!normalized) return;

            // A word is complete if the whole result is finalized,
            // or if it is followed by subsequent words in the transcript.
            const isComplete = isFinal || wordIdx < rawWords.length - 1;

            tokens.push({
              word: normalized,
              isComplete,
            });
          });
        }

        if (tokens.length > 0) {
          setSpokenTokens(tokens);
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
    setSpokenTokens([]);
    setRecognitionVersion(0);
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
