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
  it('returns a number between 0 and 100 for every pet/contest combination', () => {
    const contestIds = ['elegance', 'sweet', 'dashing', 'fresh', 'charm'] as const;
    for (const pet of PETS) {
      for (const contestId of contestIds) {
        const score = computeRecommendation(pet, contestId);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('accepts a petId string instead of a Pet object', () => {
    const scoreById = computeRecommendation('bubble', 'sweet');
    const scoreByObj = computeRecommendation(PETS.find(p => p.id === 'bubble')!, 'sweet');
    expect(scoreById).toBe(scoreByObj);
  });

  it('returns 0 for unknown petId', () => {
    // @ts-expect-error testing invalid input
    expect(computeRecommendation('nonexistent', 'sweet')).toBe(0);
  });

  it('returns 0 for unknown contestId', () => {
    const pet = PETS.find(p => p.id === 'bubble')!;
    // @ts-expect-error testing invalid input
    expect(computeRecommendation(pet, 'nonexistent')).toBe(0);
  });

  it('higher affection (higher critMultiplier) yields a higher or equal score', () => {
    // Build two synthetic pets identical except for affection
    const lowAffPet: Pet = {
      id: 'bubble',
      name: 'Test Low',
      icon: '🐾',
      description: '',
      element: '',
      baseStats: { mind: 50, emotion: 50, curiosity: 50, power: 50 },
      affection: 0,
      tastePreference: { sweet: 0, sour: 0, bitter: 0, spicy: 0, salty: 0 },
      colorPrimary: '',
      colorSecondary: '',
      skills: [],
    };
    const highAffPet: Pet = { ...lowAffPet, affection: 100 };
    const scoreLow = computeRecommendation(lowAffPet, 'elegance');
    const scoreHigh = computeRecommendation(highAffPet, 'elegance');
    expect(scoreHigh).toBeGreaterThanOrEqual(scoreLow);
  });

  it('does NOT modify the pet object', () => {
    const pet = PETS.find(p => p.id === 'flame')!;
    const originalStats = { ...pet.baseStats };
    computeRecommendation(pet, 'dashing');
    expect(pet.baseStats).toEqual(originalStats);
  });

  it('deterministic: bubble in sweet contest produces expected all-critical score', () => {
    // bubble: baseStats { mind:55, emotion:85, curiosity:70, power:50 }, affection:70
    // skillBonus: mind=10, emotion=50, curiosity=25, power=5 (summed from 3 skills)
    // critMultiplier = 1 + 70 * 0.01 = 1.7
    // afterBonus: mind=65, emotion=135, curiosity=95, power=55
    // afterCrit (capped at 100):
    //   mind    = min(100, 65*1.7)  = min(100, 110.5)  = 100
    //   emotion = min(100, 135*1.7) = min(100, 229.5)  = 100
    //   curiosity = min(100, 95*1.7)= min(100, 161.5)  = 100
    //   power   = min(100, 55*1.7)  = min(100, 93.5)   = 93.5
    // sweet weights: { emotion:2.0, curiosity:1.5, power:1.0, mind:0.5 }, totalWeight=5.0
    // weightedNorm = (0.5/1 + 2.0/1 + 1.5/1 + 0.935) / 5.0 = 4.935 / 5.0 = 0.987
    // score = round(0.987 * 100) = round(98.7) = 99
    const score = computeRecommendation('bubble', 'sweet');
    expect(score).toBe(99);
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
