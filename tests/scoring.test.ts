import { describe, it, expect } from 'vitest';
import {
  scoreToGrade,
  getMoodInfo,
  getMoodInfoNormalized,
  calcRecommendScore,
  computeRecommendation,
  mapScoreToRank,
  getRankedPets,
  previewFeeding,
  buildDisplayStats,
  getGradeInfo,
  normalizeDimensions,
  mapMoodToTier,
} from '../src/utils/scoring';
import { PETS } from '../src/data/gameData';
import type { Pet } from '../src/types';

// ─── scoreToGrade ─────────────────────────────────────────────────────────────

describe('scoreToGrade', () => {
  it('returns S for score >= 800', () => {
    expect(scoreToGrade(800)).toBe('S');
    expect(scoreToGrade(900)).toBe('S');
    expect(scoreToGrade(1200)).toBe('S');
  });

  it('returns A for 650-799', () => {
    expect(scoreToGrade(650)).toBe('A');
    expect(scoreToGrade(720)).toBe('A');
    expect(scoreToGrade(799)).toBe('A');
  });

  it('returns B for 500-649', () => {
    expect(scoreToGrade(500)).toBe('B');
    expect(scoreToGrade(575)).toBe('B');
    expect(scoreToGrade(649)).toBe('B');
  });

  it('returns C for 350-499', () => {
    expect(scoreToGrade(350)).toBe('C');
    expect(scoreToGrade(400)).toBe('C');
    expect(scoreToGrade(499)).toBe('C');
  });

  it('returns D for score < 350', () => {
    expect(scoreToGrade(349)).toBe('D');
    expect(scoreToGrade(0)).toBe('D');
  });
});

// ─── getGradeInfo ─────────────────────────────────────────────────────────────

describe('getGradeInfo', () => {
  it('returns S info for S grade', () => {
    const info = getGradeInfo('S');
    expect(info.grade).toBe('S');
    expect(info.label).toBe('S级');
  });

  it('falls back to D info for unknown grade', () => {
    const info = getGradeInfo('X');
    expect(info.grade).toBe('D');
  });
});

// ─── getMoodInfo ──────────────────────────────────────────────────────────────

describe('getMoodInfo – 3-tier mapping', () => {
  it('maps 0 → sad', () => {
    const m = getMoodInfo(0);
    expect(m.level).toBe('sad');
    expect(m.label).toBe('难过');
  });

  it('maps 33 → sad (upper boundary)', () => {
    expect(getMoodInfo(33).level).toBe('sad');
  });

  it('maps 34 → normal (lower boundary)', () => {
    expect(getMoodInfo(34).level).toBe('normal');
  });

  it('maps 50 → normal', () => {
    expect(getMoodInfo(50).level).toBe('normal');
  });

  it('maps 67 → normal (upper boundary)', () => {
    expect(getMoodInfo(67).level).toBe('normal');
  });

  it('maps 68 → happy (lower boundary)', () => {
    expect(getMoodInfo(68).level).toBe('happy');
  });

  it('maps 100 → happy', () => {
    const m = getMoodInfo(100);
    expect(m.level).toBe('happy');
    expect(m.label).toBe('高兴');
  });
});

// ─── calcRecommendScore ───────────────────────────────────────────────────────

describe('calcRecommendScore', () => {
  it('returns a number between 0 and 100', () => {
    const score = calcRecommendScore('bubble', 'sweet');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns higher score for more fitting pet/contest pair', () => {
    // bubble has high emotion; sweet contest weights emotion heavily
    const bubbleSweet = calcRecommendScore('bubble', 'sweet');
    // rock has high mind; sweet contest weights emotion heavily and mind low
    const rockSweet = calcRecommendScore('rock', 'sweet');
    expect(bubbleSweet).toBeGreaterThan(rockSweet);
  });

  it('returns 0 for invalid ids', () => {
    // @ts-expect-error testing invalid input
    expect(calcRecommendScore('invalid', 'sweet')).toBe(0);
  });
});

// ─── getRankedPets ────────────────────────────────────────────────────────────

describe('getRankedPets', () => {
  it('returns all 5 pets', () => {
    const ranked = getRankedPets('elegance');
    expect(ranked).toHaveLength(5);
  });

  it('is sorted in descending order by score', () => {
    const ranked = getRankedPets('dashing');
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].score).toBeGreaterThanOrEqual(ranked[i + 1].score);
    }
  });

  it('top pick for dashing (power-heavy) is flame or thunder', () => {
    const ranked = getRankedPets('dashing');
    expect(['flame', 'thunder']).toContain(ranked[0].petId);
  });
});

// ─── previewFeeding ───────────────────────────────────────────────────────────

describe('previewFeeding', () => {
  it('returns correct delta for sweet food on bubble', () => {
    const preview = previewFeeding('bubble', ['sweet']);
    // sweet food gives emotion+15, curiosity+5
    expect(preview.delta.emotion).toBe(15);
    expect(preview.delta.curiosity).toBe(5);
    expect(preview.delta.mind).toBe(0);
    expect(preview.delta.power).toBe(0);
  });

  it('after = before + delta', () => {
    const preview = previewFeeding('flame', ['bitter']);
    const dims = ['mind', 'emotion', 'curiosity', 'power'] as const;
    for (const d of dims) {
      expect(preview.after[d]).toBe(preview.before[d] + preview.delta[d]);
    }
  });

  it('handles empty food list (no change)', () => {
    const preview = previewFeeding('bubble', []);
    const dims = ['mind', 'emotion', 'curiosity', 'power'] as const;
    for (const d of dims) {
      expect(preview.delta[d]).toBe(0);
      expect(preview.after[d]).toBe(preview.before[d]);
    }
  });
});

// ─── buildDisplayStats ────────────────────────────────────────────────────────

describe('buildDisplayStats', () => {
  it('includes all 4 base dimensions', () => {
    const stats = buildDisplayStats({ mind: 55, emotion: 85, curiosity: 70, power: 50 }, 70, 70);
    expect(stats.mind).toBe(55);
    expect(stats.emotion).toBe(85);
    expect(stats.curiosity).toBe(70);
    expect(stats.power).toBe(50);
  });

  it('computes sparkle = affection*0.6 + mood*0.4', () => {
    const stats = buildDisplayStats({ mind: 55, emotion: 85, curiosity: 70, power: 50 }, 70, 50);
    const expected = Math.round(70 * 0.6 + 50 * 0.4);
    expect(stats.sparkle).toBe(expected);
  });

  it('caps sparkle at 100', () => {
    const stats = buildDisplayStats({ mind: 55, emotion: 85, curiosity: 70, power: 50 }, 100, 100);
    expect(stats.sparkle).toBeLessThanOrEqual(100);
  });
});

// ─── getMoodInfoNormalized ────────────────────────────────────────────────────

describe('getMoodInfoNormalized', () => {
  it('returns neutral instead of normal for mid-range mood', () => {
    const info = getMoodInfoNormalized(50);
    expect(info.level).toBe('neutral');
  });

  it('returns sad for low mood', () => {
    expect(getMoodInfoNormalized(0).level).toBe('sad');
    expect(getMoodInfoNormalized(33).level).toBe('sad');
  });

  it('returns happy for high mood', () => {
    expect(getMoodInfoNormalized(68).level).toBe('happy');
    expect(getMoodInfoNormalized(100).level).toBe('happy');
  });

  it('preserves label, emoji and color from getMoodInfo', () => {
    const norm = getMoodInfoNormalized(50);
    const orig = getMoodInfo(50);
    expect(norm.label).toBe(orig.label);
    expect(norm.emoji).toBe(orig.emoji);
    expect(norm.color).toBe(orig.color);
  });
});

// ─── computeRecommendation ────────────────────────────────────────────────────

describe('computeRecommendation', () => {
  it('returns a number between 0 and 100 for every pet', () => {
    for (const pet of PETS) {
      const score = computeRecommendation(pet);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('computes equal-weight average of 5 dimensions', () => {
    // bubble: mind=55, emotion=85, curiosity=70, power=50, affection=70
    // sparkle = round(70*0.6 + 50*0.4) = round(42+20) = 62
    // average = round((55+85+70+50+62)/5) = round(322/5) = round(64.4) = 64
    const bubble = PETS.find(p => p.id === 'bubble')!;
    const score = computeRecommendation(bubble);
    const expectedSparkle = Math.round(bubble.affection * 0.6 + 50 * 0.4);
    const { mind, emotion, curiosity, power } = bubble.baseStats;
    const expected = Math.round((mind + emotion + curiosity + power + expectedSparkle) / 5);
    expect(score).toBe(expected);
  });

  it('does not mutate the pet object', () => {
    const pet = PETS.find(p => p.id === 'flame')!;
    const originalStats = { ...pet.baseStats };
    computeRecommendation(pet);
    expect(pet.baseStats).toEqual(originalStats);
  });
});

// ─── mapScoreToRank ───────────────────────────────────────────────────────────

describe('mapScoreToRank', () => {
  it('returns S for score >= 90', () => {
    expect(mapScoreToRank(90)).toBe('S');
    expect(mapScoreToRank(95)).toBe('S');
    expect(mapScoreToRank(100)).toBe('S');
  });

  it('returns A for score 75–89', () => {
    expect(mapScoreToRank(75)).toBe('A');
    expect(mapScoreToRank(80)).toBe('A');
    expect(mapScoreToRank(89)).toBe('A');
  });

  it('returns B for score 60–74', () => {
    expect(mapScoreToRank(60)).toBe('B');
    expect(mapScoreToRank(67)).toBe('B');
    expect(mapScoreToRank(74)).toBe('B');
  });

  it('returns C for score < 60', () => {
    expect(mapScoreToRank(59)).toBe('C');
    expect(mapScoreToRank(30)).toBe('C');
    expect(mapScoreToRank(0)).toBe('C');
  });
});

// ─── normalizeDimensions ─────────────────────────────────────────────────────

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

// ─── mapMoodToTier ────────────────────────────────────────────────────────────

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

// ─── computeRecommendation (feature branch: Pet-based API) ───────────────────

describe('computeRecommendation – Pet object API', () => {
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

  it('does NOT modify the pet object', () => {
    const original = makeTestPet({ mind: 70, emotion: 80, curiosity: 60, power: 50 });
    const clone = JSON.parse(JSON.stringify(original));
    computeRecommendation(original);
    expect(original).toEqual(clone);
  });
});
