import { describe, it, expect } from 'vitest';
import {
  normalizeDimensions,
  computeRecommendation,
  mapScoreToRank,
  mapMoodToTier,
} from '../src/utils/scoring';
import type { Pet } from '../src/types';

describe('normalizeDimensions', () => {
  it('normalizes all-zero dims to 0', () => {
    const result = normalizeDimensions({ mind: 0, emotion: 0, curiosity: 0, power: 0, sparkle: 0 });
    expect(result.mind).toBe(0);
    expect(result.emotion).toBe(0);
    expect(result.curiosity).toBe(0);
    expect(result.power).toBe(0);
    expect(result.sparkle).toBe(0);
  });

  it('normalizes all-100 dims to 1', () => {
    const result = normalizeDimensions({ mind: 100, emotion: 100, curiosity: 100, power: 100, sparkle: 100 });
    expect(result.mind).toBe(1);
    expect(result.emotion).toBe(1);
    expect(result.curiosity).toBe(1);
    expect(result.power).toBe(1);
    expect(result.sparkle).toBe(1);
  });

  it('normalizes 50 to 0.5', () => {
    const result = normalizeDimensions({ mind: 50, emotion: 50, curiosity: 50, power: 50, sparkle: 50 });
    expect(result.mind).toBeCloseTo(0.5);
    expect(result.sparkle).toBeCloseTo(0.5);
  });

  it('normalizes mixed values independently', () => {
    const result = normalizeDimensions({ mind: 25, emotion: 75, curiosity: 0, power: 100, sparkle: 50 });
    expect(result.mind).toBeCloseTo(0.25);
    expect(result.emotion).toBeCloseTo(0.75);
    expect(result.curiosity).toBe(0);
    expect(result.power).toBe(1);
    expect(result.sparkle).toBeCloseTo(0.5);
  });
});

describe('computeRecommendation', () => {
  const makeTestPet = (stats: { mind: number; emotion: number; curiosity: number; power: number }, affection = 70): Pet => ({
    id: 'bubble',
    name: 'Test',
    icon: '🐾',
    description: '',
    element: '',
    baseStats: stats,
    affection,
    tastePreference: { sweet: 0, sour: 0, bitter: 0, spicy: 0, salty: 0 },
    colorPrimary: '',
    colorSecondary: '',
    skills: [],
  });

  it('computes equal-weight average across all five dimensions', () => {
    const pet = makeTestPet({ mind: 100, emotion: 100, curiosity: 100, power: 100 }, 100);
    expect(computeRecommendation(pet)).toBe(100);
  });

  it('returns 0 for all-zero stats and affection', () => {
    const pet = makeTestPet({ mind: 0, emotion: 0, curiosity: 0, power: 0 }, 0);
    expect(computeRecommendation(pet)).toBe(0);
  });

  it('correctly averages mixed values', () => {
    // mind=100 (1.0), emotion=0 (0.0), curiosity=50 (0.5), power=50 (0.5), sparkle(affection)=0 (0.0)
    // avg = (1.0 + 0 + 0.5 + 0.5 + 0) / 5 = 0.4 => score = 40
    const pet = makeTestPet({ mind: 100, emotion: 0, curiosity: 50, power: 50 }, 0);
    expect(computeRecommendation(pet)).toBe(40);
  });

  it('does NOT modify the pet object', () => {
    const original = makeTestPet({ mind: 70, emotion: 80, curiosity: 60, power: 50 });
    const clone = JSON.parse(JSON.stringify(original));
    computeRecommendation(original);
    expect(original).toEqual(clone);
  });
});

describe('mapScoreToRank', () => {
  it('returns S for score >= 90', () => {
    expect(mapScoreToRank(90)).toBe('S');
    expect(mapScoreToRank(100)).toBe('S');
    expect(mapScoreToRank(95)).toBe('S');
  });

  it('returns A for score 75-89', () => {
    expect(mapScoreToRank(75)).toBe('A');
    expect(mapScoreToRank(80)).toBe('A');
    expect(mapScoreToRank(89)).toBe('A');
  });

  it('returns B for score 60-74', () => {
    expect(mapScoreToRank(60)).toBe('B');
    expect(mapScoreToRank(70)).toBe('B');
    expect(mapScoreToRank(74)).toBe('B');
  });

  it('returns C for score < 60', () => {
    expect(mapScoreToRank(59)).toBe('C');
    expect(mapScoreToRank(0)).toBe('C');
    expect(mapScoreToRank(30)).toBe('C');
  });
});

describe('mapMoodToTier', () => {
  it('returns sad for mood 0-33', () => {
    expect(mapMoodToTier(0)).toBe('sad');
    expect(mapMoodToTier(20)).toBe('sad');
    expect(mapMoodToTier(33)).toBe('sad');
  });

  it('returns neutral for mood 34-67', () => {
    expect(mapMoodToTier(34)).toBe('neutral');
    expect(mapMoodToTier(50)).toBe('neutral');
    expect(mapMoodToTier(67)).toBe('neutral');
  });

  it('returns happy for mood 68-100', () => {
    expect(mapMoodToTier(68)).toBe('happy');
    expect(mapMoodToTier(85)).toBe('happy');
    expect(mapMoodToTier(100)).toBe('happy');
  });
});
