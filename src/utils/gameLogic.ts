import type { PetId, ContestId, FoodId, DimValues, FinalScore, Dimension } from '../types';
import { PETS, CONTESTS, FOODS } from '../data/gameData';

export function calculateMood(petId: PetId, foods: FoodId[]): number {
  const pet = PETS.find(p => p.id === petId)!;
  let mood = 50;
  for (const fid of foods) {
    mood += pet.tastePreference[fid] ?? 0;
  }
  return Math.max(0, Math.min(100, mood));
}

export function calculateSparkle(affection: number, mood: number): number {
  return affection * 0.6 + mood * 0.4;
}

export function calculateCritRate(mood: number): number {
  return Math.min(0.5, mood * 0.005);
}

export function calculateCritMultiplier(affection: number): number {
  return 1.0 + affection * 0.01;
}

export function calculateFoodBonus(foods: FoodId[]): DimValues {
  const bonus: DimValues = { mind: 0, emotion: 0, curiosity: 0, power: 0 };
  for (const fid of foods) {
    const food = FOODS.find(f => f.id === fid)!;
    for (const [dim, val] of Object.entries(food.statBonus)) {
      bonus[dim as Dimension] += val ?? 0;
    }
  }
  return bonus;
}

export function calculateSkillBonus(petId: PetId): DimValues {
  const pet = PETS.find(p => p.id === petId)!;
  const bonus: DimValues = { mind: 0, emotion: 0, curiosity: 0, power: 0 };
  for (const skill of pet.skills) {
    for (const [dim, val] of Object.entries(skill.bonus)) {
      bonus[dim as Dimension] += val ?? 0;
    }
  }
  return bonus;
}

export function getGrade(score: number): string {
  if (score >= 800) return 'S';
  if (score >= 650) return 'A';
  if (score >= 500) return 'B';
  if (score >= 350) return 'C';
  return 'D';
}

export function getComment(grade: string, petName: string): string {
  const comments: Record<string, string> = {
    S: `${petName}完美发挥，震撼全场！评审们激动得热泪盈眶！🏆✨`,
    A: `${petName}表现出色，赢得了热烈掌声！非常棒！🌟`,
    B: `${petName}发挥稳定，给观众留下深刻印象！继续加油！⭐`,
    C: `${petName}努力表演了，还有很大的进步空间！加油！💪`,
    D: `${petName}有些紧张，但参与比赛本身就很勇敢！😊`,
  };
  return comments[grade] ?? `${petName}完成了表演！`;
}

export function performContest(petId: PetId, contestId: ContestId, foods: FoodId[]): FinalScore {
  const pet = PETS.find(p => p.id === petId)!;
  const contest = CONTESTS.find(c => c.id === contestId)!;

  const mood = calculateMood(petId, foods);
  const sparkle = calculateSparkle(pet.affection, mood);
  const critRate = calculateCritRate(mood);
  const critMultiplier = calculateCritMultiplier(pet.affection);

  const foodBonus = calculateFoodBonus(foods);
  const skillBonus = calculateSkillBonus(petId);

  const dims: Dimension[] = ['mind', 'emotion', 'curiosity', 'power'];
  const afterBonus: DimValues = { mind: 0, emotion: 0, curiosity: 0, power: 0 };
  const afterCrit: DimValues = { mind: 0, emotion: 0, curiosity: 0, power: 0 };
  const weighted: DimValues = { mind: 0, emotion: 0, curiosity: 0, power: 0 };

  let critCount = 0;

  for (const d of dims) {
    afterBonus[d] = pet.baseStats[d] + foodBonus[d] + skillBonus[d];
    const isCrit = Math.random() < critRate;
    if (isCrit) critCount++;
    afterCrit[d] = afterBonus[d] * (isCrit ? critMultiplier : 1.0);
    weighted[d] = afterCrit[d] * contest.weights[d];
  }

  const total = dims.reduce((sum, d) => sum + weighted[d], 0);
  const grade = getGrade(total);

  return {
    baseStats: pet.baseStats,
    foodBonus,
    skillBonus,
    afterBonus,
    critMultiplier,
    afterCrit,
    weights: contest.weights,
    weighted,
    total,
    grade,
    critCount,
    mood,
    sparkle,
    critRate,
    comment: getComment(grade, pet.name),
  };
}
