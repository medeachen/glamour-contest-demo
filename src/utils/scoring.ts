import type { Pet } from '../types';
import { calculateSparkle } from './gameLogic';

const MAX_STAT = 100;
const MAX_SPARKLE = 100;
const NEUTRAL_MOOD = 50;

/**
 * Compute a recommendation score for a pet.
 * Normalizes five dimension values (mind, emotion, curiosity, power, sparkle)
 * and returns the equal-weight average (0–1).
 * Does NOT modify the pet object.
 */
export function computeRecommendation(pet: Pet): number {
  const { mind, emotion, curiosity, power } = pet.baseStats;
  const sparkle = calculateSparkle(pet.affection, NEUTRAL_MOOD);

  const dims = [
    Math.min(mind / MAX_STAT, 1),
    Math.min(emotion / MAX_STAT, 1),
    Math.min(curiosity / MAX_STAT, 1),
    Math.min(power / MAX_STAT, 1),
    Math.min(sparkle / MAX_SPARKLE, 1),
  ];

  return dims.reduce((sum, v) => sum + v, 0) / dims.length;
}

/**
 * Map a recommendation score (0–1) to a grade S / A / B / C.
 */
export function mapScoreToRank(score: number): string {
  if (score >= 0.80) return 'S';
  if (score >= 0.65) return 'A';
  if (score >= 0.50) return 'B';
  return 'C';
}

/**
 * Map a mood numeric value (0–100) to a tier label.
 *  0–33  → 'sad'
 * 34–67  → 'neutral'
 * 68–100 → 'happy'
 */
export function mapMoodToTier(value: number): 'sad' | 'neutral' | 'happy' {
  if (value <= 33) return 'sad';
  if (value <= 67) return 'neutral';
  return 'happy';
}
