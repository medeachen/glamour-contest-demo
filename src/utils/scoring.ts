/**
 * scoring.ts — UI-layer scoring utilities.
 * Wraps existing game-logic functions and provides helpers for:
 *  - Recommendation scoring for pet selection screen
 *  - Grade label mapping (S/A/B/C/D)
 *  - 3-tier mood level mapping
 *  - Feeding stat preview / prediction
 */

import type { Pet, PetId, ContestId, FoodId, DimValues } from '../types';
import { PETS, CONTESTS, FOODS } from '../data/gameData';
import { calculateFoodBonus } from './gameLogic';

// ─── Grade mapping ──────────────────────────────────────────────────────────

export interface GradeInfo {
  grade: string;
  label: string;
  color: string;
  bg: string;
}

const GRADE_TABLE: GradeInfo[] = [
  { grade: 'S', label: 'S级', color: '#b8860b', bg: 'linear-gradient(135deg, #fff8dc, #ffd700, #ff8c00)' },
  { grade: 'A', label: 'A级', color: '#777', bg: 'linear-gradient(135deg, #f0f0f0, #c0c0c0, #888)' },
  { grade: 'B', label: 'B级', color: '#8b4513', bg: 'linear-gradient(135deg, #f5deb3, #cd7f32, #8b4513)' },
  { grade: 'C', label: 'C级', color: '#5599bb', bg: 'linear-gradient(135deg, #e0f7ff, #7ec8e3, #5599bb)' },
  { grade: 'D', label: 'D级', color: '#777', bg: 'linear-gradient(135deg, #f5f5f5, #aaa, #777)' },
];

export function getGradeInfo(grade: string): GradeInfo {
  return GRADE_TABLE.find(g => g.grade === grade) ?? GRADE_TABLE[GRADE_TABLE.length - 1];
}

/** Map a raw score to a grade string. Keeps parity with gameLogic.getGrade. */
export function scoreToGrade(score: number): string {
  if (score >= 800) return 'S';
  if (score >= 650) return 'A';
  if (score >= 500) return 'B';
  if (score >= 350) return 'C';
  return 'D';
}

// ─── Mood tier mapping ───────────────────────────────────────────────────────

export type MoodLevel = 'sad' | 'normal' | 'happy';

export interface MoodInfo {
  level: MoodLevel;
  label: string;
  emoji: string;
  color: string;
}

const MOOD_TABLE: MoodInfo[] = [
  { level: 'sad',    label: '难过', emoji: '😢', color: '#f44336' },
  { level: 'normal', label: '一般', emoji: '😐', color: '#ff9800' },
  { level: 'happy',  label: '高兴', emoji: '😊', color: '#4caf50' },
];

/**
 * Map a 0–100 mood value to one of three tiers.
 * sad: 0–33 | normal: 34–67 | happy: 68–100
 */
export function getMoodInfo(mood: number): MoodInfo {
  if (mood <= 33) return MOOD_TABLE[0];
  if (mood <= 67) return MOOD_TABLE[1];
  return MOOD_TABLE[2];
}

// ─── Recommendation scoring ──────────────────────────────────────────────────

/**
 * Calculate a recommendation score for a pet in a given contest.
 * Uses the contest's dimension weights applied to the pet's base stats,
 * then normalises to 0–100.
 */
export function calcRecommendScore(petId: PetId, contestId: ContestId): number {
  const pet = PETS.find(p => p.id === petId);
  const contest = CONTESTS.find(c => c.id === contestId);
  if (!pet || !contest) return 0;

  const dims = ['mind', 'emotion', 'curiosity', 'power'] as const;
  const totalWeight = dims.reduce((s, d) => s + contest.weights[d], 0);

  // Weighted normalised sum (base stats max is 100)
  const weighted = dims.reduce((s, d) => s + (pet.baseStats[d] / 100) * contest.weights[d], 0);
  return Math.round((weighted / totalWeight) * 100);
}

/**
 * Return pets sorted by recommendation score descending for a given contest.
 * Each entry includes the petId and its score.
 */
export function getRankedPets(contestId: ContestId): Array<{ petId: PetId; score: number }> {
  return PETS.map(p => ({ petId: p.id, score: calcRecommendScore(p.id, contestId) }))
    .sort((a, b) => b.score - a.score);
}

// ─── Feeding stat prediction ─────────────────────────────────────────────────

export interface FeedingPreview {
  before: DimValues;
  after: DimValues;
  delta: DimValues;
}

/**
 * Preview the stat change from feeding a set of foods to a pet.
 * Does not modify any game state.
 */
export function previewFeeding(petId: PetId, foods: FoodId[]): FeedingPreview {
  const pet = PETS.find(p => p.id === petId);
  if (!pet) {
    const zero: DimValues = { mind: 0, emotion: 0, curiosity: 0, power: 0 };
    return { before: zero, after: zero, delta: zero };
  }
  const bonus = calculateFoodBonus(foods);
  const dims = ['mind', 'emotion', 'curiosity', 'power'] as const;
  const after: DimValues = { mind: 0, emotion: 0, curiosity: 0, power: 0 };
  for (const d of dims) {
    after[d] = pet.baseStats[d] + bonus[d];
  }
  return { before: { ...pet.baseStats }, after, delta: { ...bonus } };
}

// ─── 5-dimension display values ──────────────────────────────────────────────

export interface DisplayStats5D {
  mind: number;
  emotion: number;
  curiosity: number;
  power: number;
  sparkle: number;
}

/**
 * Build a 5-dimension display object suitable for the enhanced radar chart.
 * sparkle = affection * 0.6 + mood * 0.4, normalised to the same 0–100 scale.
 */
export function buildDisplayStats(
  baseStats: DimValues,
  affection: number,
  mood: number,
): DisplayStats5D {
  const sparkle = Math.min(100, Math.round(affection * 0.6 + mood * 0.4));
  return { ...baseStats, sparkle };
}

/** Compute the single food item's bonus info for UI display. */
export function getFoodBonusInfo(foodId: FoodId) {
  return FOODS.find(f => f.id === foodId) ?? null;
}

// ─── Equal-weight 5D recommendation score ────────────────────────────────────

/**
 * Compute a 0–100 recommendation score for a pet as an equal-weight average
 * across five normalized dimensions: mind, emotion, curiosity, power, sparkle.
 * Uses a neutral baseline mood (50) to derive sparkle; does not mutate pet.
 */
export function computeRecommendation(pet: Pet): number {
  const NEUTRAL_MOOD = 50;
  const stats = buildDisplayStats(pet.baseStats, pet.affection, NEUTRAL_MOOD);
  const { mind, emotion, curiosity, power, sparkle } = stats;
  return Math.round((mind + emotion + curiosity + power + sparkle) / 5);
}

// ─── 0–100 rank mapping ──────────────────────────────────────────────────────

/**
 * Map a 0–100 score to a rank letter using equal-interval thresholds.
 * S: ≥90 | A: ≥75 | B: ≥60 | C: <60
 */
export function mapScoreToRank(score: number): string {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  return 'C';
}

// ─── Normalized mood adapter ─────────────────────────────────────────────────

export type MoodLevelNormalized = 'sad' | 'neutral' | 'happy';

export interface MoodInfoNormalized extends Omit<MoodInfo, 'level'> {
  level: MoodLevelNormalized;
}

/**
 * Adapter that returns the same mood info as getMoodInfo but uses 'neutral'
 * instead of 'normal' for the middle tier, matching 'sad'|'neutral'|'happy'.
 */
export function getMoodInfoNormalized(mood: number): MoodInfoNormalized {
  const info = getMoodInfo(mood);
  return { ...info, level: info.level === 'normal' ? 'neutral' : (info.level as MoodLevelNormalized) };
}

// ─── Feature: normalized dimensions (0–1 range) ───────────────────────────────

export interface NormalizedDimensions {
  mind: number;
  emotion: number;
  curiosity: number;
  power: number;
  sparkle: number;
}

/** Expected input scale minimum for normalizeDimensions. */
const DIMENSION_MIN = 0;
/** Expected input scale maximum for normalizeDimensions. */
const DIMENSION_MAX = 100;

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
}): NormalizedDimensions {
  const range = DIMENSION_MAX - DIMENSION_MIN;
  return {
    mind: (dimensions.mind - DIMENSION_MIN) / range,
    emotion: (dimensions.emotion - DIMENSION_MIN) / range,
    curiosity: (dimensions.curiosity - DIMENSION_MIN) / range,
    power: (dimensions.power - DIMENSION_MIN) / range,
    sparkle: (dimensions.sparkle - DIMENSION_MIN) / range,
  };
}

// ─── Feature: 3-tier mood string mapping ─────────────────────────────────────

/**
 * Maps a mood value (0-100) to a tier string.
 * 0-33 → 'sad', 34-67 → 'neutral', 68-100 → 'happy'
 */
export function mapMoodToTier(mood: number): 'sad' | 'neutral' | 'happy' {
  if (mood <= 33) return 'sad';
  if (mood <= 67) return 'neutral';
  return 'happy';
}
