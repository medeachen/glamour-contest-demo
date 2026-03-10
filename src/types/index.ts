export type Dimension = 'mind' | 'emotion' | 'curiosity' | 'power';
export type ContestId = 'elegance' | 'sweet' | 'dashing' | 'fresh' | 'charm';
export type PetId = 'bubble' | 'flame' | 'sprout' | 'thunder' | 'rock';
export type FoodId = 'sweet' | 'sour' | 'bitter' | 'spicy' | 'salty';
export type GamePhase = 'lobby' | 'petSelect' | 'feeding' | 'confirm' | 'performance' | 'settlement';

export interface DimValues {
  mind: number;
  emotion: number;
  curiosity: number;
  power: number;
}

export interface Contest {
  id: ContestId;
  name: string;
  icon: string;
  description: string;
  weights: DimValues;
  theme: ContestId;
  themeColor: string;
}

export interface Pet {
  id: PetId;
  name: string;
  icon: string;
  description: string;
  element: string;
  baseStats: DimValues;
  affection: number;
  tastePreference: Record<FoodId, number>;
  colorPrimary: string;
  colorSecondary: string;
  skills: Skill[];
}

export interface Food {
  id: FoodId;
  name: string;
  icon: string;
  taste: string;
  statBonus: Partial<DimValues>;
}

export interface Skill {
  name: string;
  description: string;
  bonus: Partial<DimValues>;
}

export interface HighScore {
  score: number;
  grade: string;
  pet: string;
}

export interface HighScores {
  elegance: HighScore | null;
  sweet: HighScore | null;
  dashing: HighScore | null;
  fresh: HighScore | null;
  charm: HighScore | null;
}

export interface PerformanceResult {
  skillIndex: number;
  skillName: string;
  criticals: Partial<Record<Dimension, boolean>>;
  dimScores: DimValues;
}

export interface FinalScore {
  baseStats: DimValues;
  foodBonus: DimValues;
  skillBonus: DimValues;
  afterBonus: DimValues;
  critMultiplier: number;
  afterCrit: DimValues;
  weights: DimValues;
  weighted: DimValues;
  total: number;
  grade: string;
  critCount: number;
  mood: number;
  sparkle: number;
  critRate: number;
  comment: string;
}
