import type { Pet } from '../types';

export interface NormalizedDimensions {
  mind: number;
  emotion: number;
  curiosity: number;
  power: number;
  sparkle: number;
}

/**
 * Normalizes a set of five dimension values to [0,1] range
 * using min/max normalization against a 0-100 input scale.
 */
export function normalizeDimensions(dimensions: {
  mind: number;
  emotion: number;
  curiosity: number;
  power: number;
  sparkle: number;
}): Record<string, number> {
  const MIN = 0;
  const MAX = 100;
  const range = MAX - MIN;
  return {
    mind: (dimensions.mind - MIN) / range,
    emotion: (dimensions.emotion - MIN) / range,
    curiosity: (dimensions.curiosity - MIN) / range,
    power: (dimensions.power - MIN) / range,
    sparkle: (dimensions.sparkle - MIN) / range,
  };
}

/**
 * Computes an equal-weight recommendation score (0-100)
 * by averaging the five normalized dimensions.
 * Does NOT modify the pet object.
 */
export function computeRecommendation(pet: Pet): number {
  const { mind, emotion, curiosity, power } = pet.baseStats;
  // sparkle is derived from affection (fixed at 70 for all pets for now)
  const sparkle = pet.affection;
  const normalized = normalizeDimensions({ mind, emotion, curiosity, power, sparkle });
  const avg =
    (normalized.mind +
      normalized.emotion +
      normalized.curiosity +
      normalized.power +
      normalized.sparkle) /
    5;
  return Math.round(avg * 100);
}

/**
 * Maps a numeric score to a grade string.
 * S ≥ 90, A ≥ 75, B ≥ 60, C < 60
 */
export function mapScoreToRank(score: number): 'S' | 'A' | 'B' | 'C' {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  return 'C';
}

/**
 * Maps a mood value (0-100) to a tier string.
 * 0-33 → 'sad', 34-67 → 'neutral', 68-100 → 'happy'
 */
export function mapMoodToTier(mood: number): 'sad' | 'neutral' | 'happy' {
  if (mood <= 33) return 'sad';
  if (mood <= 67) return 'neutral';
  return 'happy';
}
