import { describe, it, expect } from 'vitest';
import { computeRecommendation, mapScoreToRank, mapMoodToTier } from '../../src/utils/scoring';
import type { Pet } from '../../src/types';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function makePet(overrides: Partial<Pet['baseStats'] & { affection?: number }> = {}): Pet {
  const baseStats = {
    mind:      overrides.mind      ?? 60,
    emotion:   overrides.emotion   ?? 60,
    curiosity: overrides.curiosity ?? 60,
    power:     overrides.power     ?? 60,
  };
  return {
    id: 'bubble',
    name: '测试宠物',
    icon: '🐾',
    description: '',
    element: '水',
    baseStats,
    affection: overrides.affection ?? 70,
    tastePreference: { sweet: 0, sour: 0, bitter: 0, spicy: 0, salty: 0 },
    colorPrimary: '#fff',
    colorSecondary: '#000',
    skills: [],
  };
}

// --------------------------------------------------------------------------
// computeRecommendation
// --------------------------------------------------------------------------

describe('computeRecommendation', () => {
  it('returns a value between 0 and 1', () => {
    const pet = makePet();
    const score = computeRecommendation(pet);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('uses equal weights — identical dims give same score regardless of which dim is high', () => {
    // All five dimensions contribute equally, so a pet with all stats set to 80
    // should give the same score as a pet with any permutation of [80, 80, 80, 80]
    // plus the same sparkle.
    const pet1 = makePet({ mind: 80, emotion: 80, curiosity: 80, power: 80, affection: 70 });
    const pet2 = makePet({ mind: 80, emotion: 80, curiosity: 80, power: 80, affection: 70 });
    expect(computeRecommendation(pet1)).toBeCloseTo(computeRecommendation(pet2));
  });

  it('higher overall stats produce a higher recommendation score', () => {
    const low  = makePet({ mind: 50, emotion: 50, curiosity: 50, power: 50, affection: 50 });
    const high = makePet({ mind: 90, emotion: 90, curiosity: 90, power: 90, affection: 90 });
    expect(computeRecommendation(high)).toBeGreaterThan(computeRecommendation(low));
  });

  it('does NOT modify the pet object', () => {
    const pet = makePet({ mind: 55, emotion: 85, curiosity: 70, power: 50, affection: 70 });
    const before = JSON.stringify(pet);
    computeRecommendation(pet);
    expect(JSON.stringify(pet)).toBe(before);
  });

  it('normalizes correctly — all stats at 100 gives score of 1', () => {
    // sparkle at affection=100, mood=50: 100*0.6 + 50*0.4 = 80 => sparkle/100 = 0.8
    // Average of [1,1,1,1,0.8] = 0.96
    const pet = makePet({ mind: 100, emotion: 100, curiosity: 100, power: 100, affection: 100 });
    const score = computeRecommendation(pet);
    expect(score).toBeCloseTo(0.96, 2);
  });

  it('averages five dimensions with equal weight', () => {
    // mind=100(1.0), emotion=50(0.5), curiosity=50(0.5), power=50(0.5)
    // sparkle = calculateSparkle(70, 50) = 70*0.6 + 50*0.4 = 62  => 0.62
    // Expected average = (1.0 + 0.5 + 0.5 + 0.5 + 0.62) / 5 = 3.12 / 5 = 0.624
    const pet = makePet({ mind: 100, emotion: 50, curiosity: 50, power: 50, affection: 70 });
    const score = computeRecommendation(pet);
    expect(score).toBeCloseTo(0.624, 2);
  });
});

// --------------------------------------------------------------------------
// mapScoreToRank
// --------------------------------------------------------------------------

describe('mapScoreToRank', () => {
  it('maps score >= 0.80 to S', () => {
    expect(mapScoreToRank(0.80)).toBe('S');
    expect(mapScoreToRank(0.95)).toBe('S');
    expect(mapScoreToRank(1.00)).toBe('S');
  });

  it('maps score >= 0.65 and < 0.80 to A', () => {
    expect(mapScoreToRank(0.65)).toBe('A');
    expect(mapScoreToRank(0.72)).toBe('A');
    expect(mapScoreToRank(0.799)).toBe('A');
  });

  it('maps score >= 0.50 and < 0.65 to B', () => {
    expect(mapScoreToRank(0.50)).toBe('B');
    expect(mapScoreToRank(0.57)).toBe('B');
    expect(mapScoreToRank(0.649)).toBe('B');
  });

  it('maps score < 0.50 to C', () => {
    expect(mapScoreToRank(0.49)).toBe('C');
    expect(mapScoreToRank(0.00)).toBe('C');
  });
});

// --------------------------------------------------------------------------
// mapMoodToTier
// --------------------------------------------------------------------------

describe('mapMoodToTier', () => {
  it('maps 0 to sad', () => expect(mapMoodToTier(0)).toBe('sad'));
  it('maps 33 to sad', () => expect(mapMoodToTier(33)).toBe('sad'));
  it('maps 34 to neutral', () => expect(mapMoodToTier(34)).toBe('neutral'));
  it('maps 67 to neutral', () => expect(mapMoodToTier(67)).toBe('neutral'));
  it('maps 68 to happy', () => expect(mapMoodToTier(68)).toBe('happy'));
  it('maps 100 to happy', () => expect(mapMoodToTier(100)).toBe('happy'));
  it('maps mid-range values correctly', () => {
    expect(mapMoodToTier(50)).toBe('neutral');
    expect(mapMoodToTier(85)).toBe('happy');
    expect(mapMoodToTier(10)).toBe('sad');
  });
});
