import { describe, it, expect } from 'vitest';
import { computeRecommendation, getGrade, getMoodTier, rankPets } from '../src/utils/scoring';
import { PETS } from '../src/data/gameData';
import type { DimValues } from '../src/types';

// ──────────────────────────────────────────────
// computeRecommendation
// ──────────────────────────────────────────────
describe('computeRecommendation', () => {
  it('returns 0 when all base stats are 0', () => {
    const fakePet = { ...PETS[0], baseStats: { mind: 0, emotion: 0, curiosity: 0, power: 0 } };
    expect(computeRecommendation(fakePet)).toBe(0);
  });

  it('returns 100 when all base stats equal maxStat (100)', () => {
    const fakePet = { ...PETS[0], baseStats: { mind: 100, emotion: 100, curiosity: 100, power: 100 } };
    expect(computeRecommendation(fakePet)).toBe(100);
  });

  it('returns a value between 0 and 100 for normal pets', () => {
    for (const pet of PETS) {
      const score = computeRecommendation(pet);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('respects weights: higher weight on strong dimension boosts score', () => {
    const highMindPet = { ...PETS[0], baseStats: { mind: 90, emotion: 50, curiosity: 50, power: 50 } };
    const mindHeavyWeights: DimValues = { mind: 4, emotion: 0.5, curiosity: 0.5, power: 0.5 };
    const balancedWeights: DimValues = { mind: 1, emotion: 1, curiosity: 1, power: 1 };
    expect(computeRecommendation(highMindPet, mindHeavyWeights))
      .toBeGreaterThan(computeRecommendation(highMindPet, balancedWeights));
  });

  it('returns 0 when total weight is 0', () => {
    const pet = PETS[0];
    expect(computeRecommendation(pet, { mind: 0, emotion: 0, curiosity: 0, power: 0 })).toBe(0);
  });
});

// ──────────────────────────────────────────────
// rankPets
// ──────────────────────────────────────────────
describe('rankPets', () => {
  it('returns all pets ranked', () => {
    const ranked = rankPets();
    expect(ranked).toHaveLength(PETS.length);
  });

  it('ranks pets in descending order of score', () => {
    const ranked = rankPets();
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].score).toBeGreaterThanOrEqual(ranked[i + 1].score);
    }
  });

  it('assigns rank starting at 1', () => {
    const ranked = rankPets();
    expect(ranked[0].rank).toBe(1);
    expect(ranked[ranked.length - 1].rank).toBe(PETS.length);
  });

  it('prefers power-heavy pets when power weight is high', () => {
    const weights: DimValues = { mind: 0.5, emotion: 0.5, curiosity: 0.5, power: 3 };
    const ranked = rankPets(weights);
    // thunder and flame have high power base stats (85)
    const topId = ranked[0].pet.id;
    expect(['thunder', 'flame']).toContain(topId);
  });
});

// ──────────────────────────────────────────────
// getGrade
// ──────────────────────────────────────────────
describe('getGrade', () => {
  const cases: [number, string][] = [
    [1000, 'S'],
    [800, 'S'],
    [799, 'A'],
    [650, 'A'],
    [649, 'B'],
    [500, 'B'],
    [499, 'C'],
    [350, 'C'],
    [349, 'D'],
    [0, 'D'],
  ];

  it.each(cases)('getGrade(%d) → %s', (score, expected) => {
    expect(getGrade(score)).toBe(expected);
  });
});

// ──────────────────────────────────────────────
// getMoodTier (3-tier mapping)
// ──────────────────────────────────────────────
describe('getMoodTier', () => {
  it('maps 0 → 难过', () => {
    const tier = getMoodTier(0);
    expect(tier.label).toBe('难过');
    expect(tier.emoji).toBe('😢');
  });

  it('maps 33 → 难过 (boundary)', () => {
    expect(getMoodTier(33).label).toBe('难过');
  });

  it('maps 34 → 一般', () => {
    expect(getMoodTier(34).label).toBe('一般');
  });

  it('maps 50 → 一般', () => {
    expect(getMoodTier(50).label).toBe('一般');
  });

  it('maps 67 → 一般 (boundary)', () => {
    expect(getMoodTier(67).label).toBe('一般');
  });

  it('maps 68 → 高兴', () => {
    expect(getMoodTier(68).label).toBe('高兴');
  });

  it('maps 100 → 高兴', () => {
    const tier = getMoodTier(100);
    expect(tier.label).toBe('高兴');
    expect(tier.emoji).toBe('😊');
  });
});
