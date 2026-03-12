import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS } from '../data/gameData';
import type { PetId } from '../types';
import { PetModel } from '../components/PetModel';
import { PetCard } from '../components/PetCard';
import { computeRecommendation } from '../utils/scoring';

export function PetSelectPage() {
  const { setPhase, selectPet, selectedPet, selectedContest } = useGameStore();
  const [hovered, setHovered] = useState<PetId | null>(null);

  function handleSelect(id: PetId) {
    selectPet(id);
  }

  function handleNext() {
    if (selectedPet) setPhase('feeding');
  }

  const contestColors: Record<string, string> = { elegance: '#3a5080', sweet: '#e91e8c', dashing: '#f57c00', fresh: '#2e7d32', charm: '#c62828' };
  const accentColor = selectedContest ? contestColors[selectedContest] : '#9c27b0';

  // Sort pets by recommendation score descending
  const sortedPets = [...PETS].sort((a, b) => computeRecommendation(b) - computeRecommendation(a));
  const topScore = computeRecommendation(sortedPets[0]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f3e5f5, #e8eaf6, #e0f2f1)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <button onClick={() => setPhase('lobby')} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            ← 返回大厅
          </button>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#444' }}>选择你的宠物 🐾</h1>
        </div>

        {/* Three-column layout: radar center + pets on sides */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {sortedPets.map((pet) => {
            const isSelected = selectedPet === pet.id;
            const isHov = hovered === pet.id;
            const score = computeRecommendation(pet);
            const isRecommended = score === topScore;

            return (
              <div
                key={pet.id}
                style={{
                  transform: isHov || isSelected ? 'translateY(-4px)' : 'none',
                  transition: 'transform 0.3s',
                  marginTop: isRecommended ? 0 : 12,
                }}
              >
                <PetCard
                  pet={pet}
                  isRecommended={isRecommended}
                  isSelected={isSelected}
                  accentColor={accentColor}
                  onClick={() => handleSelect(pet.id)}
                  onMouseEnter={() => setHovered(pet.id)}
                  onMouseLeave={() => setHovered(null)}
                />
                {/* 3D model below card */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                  <PetModel petId={pet.id} size={100} animate={true} />
                </div>
                <p style={{ color: '#777', fontSize: 11, margin: '4px 0 0', lineHeight: 1.5, textAlign: 'center', maxWidth: 220 }}>{pet.description}</p>
              </div>
            );
          })}
        </div>

        {/* Next button */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button onClick={handleNext} disabled={!selectedPet}
            style={{
              background: selectedPet ? `linear-gradient(135deg, ${accentColor}, #9c27b0)` : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              padding: '14px 48px',
              fontSize: 18,
              fontWeight: 700,
              cursor: selectedPet ? 'pointer' : 'not-allowed',
              boxShadow: selectedPet ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.3s',
            }}>
            前往喂食 🍰
          </button>
        </div>
      </div>
    </div>
  );
}
