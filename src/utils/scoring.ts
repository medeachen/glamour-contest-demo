import type { Pet, DimValues } from '../types';
import { PETS } from '../data/gameData';

export interface RecommendationResult {
  pet: Pet;
  score: number;
  rank: number;
}

const DEFAULT_WEIGHTS: DimValues = { mind: 1, emotion: 1, curiosity: 1, power: 1 };
const MAX_STAT = 100;

/** Compute a weighted recommendation score for a pet (0–100 normalized). */
export function computeRecommendation(
  pet: Pet,
  weights: DimValues = DEFAULT_WEIGHTS
): number {
  const dims: (keyof DimValues)[] = ['mind', 'emotion', 'curiosity', 'power'];
  const totalWeight = dims.reduce((s, d) => s + weights[d], 0);
  if (totalWeight === 0) return 0;
  const raw = dims.reduce((s, d) => s + (pet.baseStats[d] / MAX_STAT) * weights[d], 0);
  return (raw / totalWeight) * 100;
}

/** Rank all pets by recommendation score, highest first. */
export function rankPets(weights: DimValues = DEFAULT_WEIGHTS): RecommendationResult[] {
  return PETS.map((pet) => ({
    pet,
    score: computeRecommendation(pet, weights),
    rank: 0,
  }))
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

/** Map a numeric score to a letter grade (S/A/B/C/D). */
export function getGrade(score: number): string {
  if (score >= 800) return 'S';
  if (score >= 650) return 'A';
  if (score >= 500) return 'B';
  if (score >= 350) return 'C';
  return 'D';
}

export type MoodTier = { label: '难过' | '一般' | '高兴'; emoji: string };

/** Map a mood value (0–100) to a 3-tier display (难过/一般/高兴). */
export function getMoodTier(mood: number): MoodTier {
  if (mood <= 33) return { label: '难过', emoji: '😢' };
  if (mood <= 67) return { label: '一般', emoji: '😐' };
  return { label: '高兴', emoji: '😊' };
}
