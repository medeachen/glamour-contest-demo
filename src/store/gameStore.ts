import { create } from 'zustand';
import type { GamePhase, ContestId, PetId, FoodId, FinalScore, PerformanceResult, HighScores } from '../types';

const STORAGE_KEY = 'glamour_contest_scores';

function loadHighScores(): HighScores {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { elegance: null, wild: null, creative: null };
}

function saveHighScoresToStorage(hs: HighScores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hs));
}

interface GameState {
  currentPhase: GamePhase;
  selectedContest: ContestId | null;
  selectedPet: PetId | null;
  selectedFoods: FoodId[];
  finalScore: FinalScore | null;
  performanceResults: PerformanceResult[];
  highScores: HighScores;
  setPhase: (phase: GamePhase) => void;
  selectContest: (id: ContestId) => void;
  selectPet: (id: PetId) => void;
  addFood: (id: FoodId) => void;
  removeFood: (index: number) => void;
  clearFoods: () => void;
  setFinalScore: (score: FinalScore) => void;
  setPerformanceResults: (results: PerformanceResult[]) => void;
  saveHighScore: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentPhase: 'lobby',
  selectedContest: null,
  selectedPet: null,
  selectedFoods: [],
  finalScore: null,
  performanceResults: [],
  highScores: loadHighScores(),

  setPhase: (phase) => set({ currentPhase: phase }),
  selectContest: (id) => set({ selectedContest: id }),
  selectPet: (id) => set({ selectedPet: id }),
  addFood: (id) => set((s) => {
    if (s.selectedFoods.length >= 3) return s;
    return { selectedFoods: [...s.selectedFoods, id] };
  }),
  removeFood: (index) => set((s) => {
    const foods = [...s.selectedFoods];
    foods.splice(index, 1);
    return { selectedFoods: foods };
  }),
  clearFoods: () => set({ selectedFoods: [] }),
  setFinalScore: (score) => set({ finalScore: score }),
  setPerformanceResults: (results) => set({ performanceResults: results }),
  saveHighScore: () => {
    const { finalScore, selectedContest, selectedPet, highScores } = get();
    if (!finalScore || !selectedContest || !selectedPet) return;
    const existing = highScores[selectedContest];
    if (!existing || finalScore.total > existing.score) {
      const newHs = {
        ...highScores,
        [selectedContest]: { score: finalScore.total, grade: finalScore.grade, pet: selectedPet },
      };
      saveHighScoresToStorage(newHs);
      set({ highScores: newHs });
    }
  },
  resetGame: () => set({
    currentPhase: 'lobby',
    selectedContest: null,
    selectedPet: null,
    selectedFoods: [],
    finalScore: null,
    performanceResults: [],
  }),
}));
