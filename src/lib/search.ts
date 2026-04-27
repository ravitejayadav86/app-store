/**
 * Advanced Search Utility — PandaStore
 *
 * Features:
 * - Fuzzy matching (Levenshtein distance) for typo tolerance
 * - Multi-token splitting ("music beat" matches "music" AND "beat")
 * - Prefix-boosting (exact prefix match scores highest)
 * - Acronym detection (e.g., "pb" matches "Photo Booth")
 * - Field weighting (name > category > developer/artist > description)
 * - Normalisation (trim, lowercase, remove diacritics)
 */

/** Score thresholds */
const MATCH_EXACT_PREFIX = 100;
const MATCH_FULL_WORD    = 80;
const MATCH_SUBSTRING    = 60;
const MATCH_ACRONYM      = 50;
const MATCH_FUZZY        = 30;
const FUZZY_MAX_DISTANCE = 2; // allow up to 2 character edits

/** Normalise a string for comparison */
function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9 ]/g, " ")    // replace punctuation with spaces
    .replace(/\s+/g, " ")
    .trim();
}

/** Compute Levenshtein distance between two (already normalised) strings */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/** Build acronym from a string, e.g. "Photo Booth" → "pb" */
function acronym(s: string): string {
  return s
    .split(" ")
    .map(w => w[0] ?? "")
    .join("");
}

/**
 * Score a single field against a single query token.
 * Returns a score between 0 (no match) and 100 (perfect prefix).
 */
function scoreToken(field: string, token: string): number {
  if (!field || !token) return 0;
  const f = normalise(field);
  const t = normalise(token);

  if (!f || !t) return 0;

  // Exact prefix
  if (f.startsWith(t)) return MATCH_EXACT_PREFIX;

  // Full-word match anywhere (word boundary)
  const wordBoundary = new RegExp(`\\b${t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}`);
  if (wordBoundary.test(f)) return MATCH_FULL_WORD;

  // Substring anywhere
  if (f.includes(t)) return MATCH_SUBSTRING;

  // Acronym
  if (acronym(f) === t || acronym(f).startsWith(t)) return MATCH_ACRONYM;

  // Fuzzy (Levenshtein) — only for tokens of length ≥ 3
  if (t.length >= 3) {
    const words = f.split(" ");
    const minDist = Math.min(...words.map(w => levenshtein(w, t)));
    if (minDist <= FUZZY_MAX_DISTANCE) return MATCH_FUZZY - minDist * 5;
  }

  return 0;
}

/** Weight multipliers per field importance */
const FIELD_WEIGHTS: Record<string, number> = {
  name:        1.0,
  title:       1.0,
  category:    0.7,
  developer:   0.6,
  artist_name: 0.6,
  description: 0.4,
  tags:        0.5,
};

/**
 * Score an item against all query tokens across all indexed fields.
 * ALL tokens must score > 0 for the item to be included (AND logic).
 * Final score is the sum of weighted field scores.
 */
export function scoreItem(item: Record<string, any>, rawQuery: string): number {
  const tokens = normalise(rawQuery).split(" ").filter(Boolean);
  if (tokens.length === 0) return 0;

  let totalScore = 0;

  for (const token of tokens) {
    let bestTokenScore = 0;

    for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
      const value = item[field];
      if (!value) continue;

      const fieldStr = Array.isArray(value) ? value.join(" ") : String(value);
      const s = scoreToken(fieldStr, token) * weight;
      if (s > bestTokenScore) bestTokenScore = s;
    }

    // If ANY token has zero score, the entire item is excluded (AND semantics)
    if (bestTokenScore === 0) return 0;
    totalScore += bestTokenScore;
  }

  return totalScore;
}

/**
 * Filter and rank a list of items by relevance to the query.
 * Items with score 0 are excluded; result is sorted descending by score.
 */
export function fuzzySearch<T extends Record<string, any>>(
  items: T[],
  query: string,
  limit = 20
): T[] {
  if (!query.trim()) return items.slice(0, limit);

  return items
    .map(item => ({ item, score: scoreItem(item, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

/**
 * Highlight matched text in a string based on the query tokens.
 * Returns an array of { text, highlight } segments.
 */
export function highlightSegments(
  text: string,
  query: string
): { text: string; highlight: boolean }[] {
  if (!query.trim() || !text) return [{ text, highlight: false }];

  const tokens = normalise(query).split(" ").filter(t => t.length >= 2);
  if (tokens.length === 0) return [{ text, highlight: false }];

  // Build a regex that matches any token (longest first to avoid partial overlaps)
  const escaped = tokens
    .sort((a, b) => b.length - a.length)
    .map(t => t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));

  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map(part => ({
    text: part,
    highlight: pattern.test(part),
  }));
}
