/**
 * Text processing utilities for the reading assessment.
 */

/**
 * Normalize a word for comparison: lowercase, strip punctuation, remove diacritics.
 */
export function normalizeWord(word) {
  if (!word) return '';
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[.,!?;:"""''()\[\]{}]/g, '') // strip punctuation
    .trim();
}

/**
 * Levenshtein distance between two strings.
 */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Fuzzy match: returns true if the recognized word closely matches the expected word.
 *
 * Matching rules (strict):
 * - Short words (≤ 3 chars like "na", "ng", "sa", "ni", "at"): exact match only.
 * - Medium words (4–5 chars): Levenshtein distance ≤ 1, and lengths must be within 1.
 * - Long words (6+ chars): Levenshtein distance ≤ 1, and lengths must be within 2.
 *
 * No prefix matching — "hala" must NOT match "halaman".
 */
export function fuzzyMatch(expected, recognized) {
  const e = normalizeWord(expected);
  const r = normalizeWord(recognized);

  if (!e || !r) return false;

  // Exact match
  if (e === r) return true;

  // Short words: exact match only (avoids "na" matching "ma", "ba", etc.)
  if (e.length <= 3) return false;

  // Length gate: reject if word lengths are too different
  const lengthDiff = Math.abs(e.length - r.length);
  if (e.length <= 5 && lengthDiff > 1) return false;
  if (e.length > 5 && lengthDiff > 2) return false;

  // Levenshtein tolerance: allow at most 1 character difference
  if (levenshtein(e, r) <= 1) return true;

  return false;
}

/**
 * Identify the type of punctuation character.
 */
export function getPunctuationType(punct) {
  if (!punct) return null;
  if (punct.includes('.')) return 'period';
  if (punct.includes(',')) return 'comma';
  if (punct.includes('?')) return 'question';
  if (punct.includes('!')) return 'exclamation';
  if (punct.includes(':') || punct.includes(';')) return 'colon';
  return null;
}

/**
 * Get the pause duration (ms) for a punctuation type.
 */
export function getPunctuationPause(type) {
  switch (type) {
    case 'period': return 1200;
    case 'comma': return 600;
    case 'question': return 1000;
    case 'exclamation': return 1000;
    case 'colon': return 800;
    default: return 0;
  }
}

/**
 * Format seconds as MM:SS.
 */
export function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Calculate words per minute.
 */
export function calculateWPM(wordsRead, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((wordsRead / elapsedSeconds) * 60);
}
