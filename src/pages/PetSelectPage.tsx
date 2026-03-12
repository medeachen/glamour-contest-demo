import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { PetId } from '../types';
import { PetCard } from '../components/PetCard';
import { rankPets } from '../utils/scoring';
import { CONTESTS } from '../data/gameData';

export function PetSelectPage() {
  const { setPhase, selectPet, selectedPet, selectedContest } = useGameStore();
  const [hovered, setHovered] = useState<PetId | null>(null);

  const contestColors: Record<string, string> = {
    elegance: '#3a5080',
    sweet: '#e91e8c',
    dashing: '#f57c00',
    fresh: '#2e7d32',
    charm: '#c62828',
  };
  const accentColor = selectedContest ? contestColors[selectedContest] : '#9c27b0';

  // Compute recommendation weights from the selected contest
  const contest = selectedContest ? CONTESTS.find(c => c.id === selectedContest) : null;
  const weights = contest?.weights ?? { mind: 1, emotion: 1, curiosity: 1, power: 1 };
  const ranked = rankPets(weights);

  function handleSelect(id: PetId) {
    selectPet(id);
  }

  function handleNext() {
    if (selectedPet) setPhase('feeding');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f3e5f5, #e8eaf6, #e0f2f1)',
      padding: '20px',
      fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <button
            onClick={() => setPhase('lobby')}
            style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            ← 返回大厅
          </button>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#444' }}>选择你的宠物 🐾</h1>
        </div>

        {/* Tip */}
        <p style={{ textAlign: 'center', color: '#999', fontSize: 13, marginBottom: 24 }}>
          ⭐ 推荐宠物是根据当前赛事维度评分最高的宠物；悬停雷达图查看各维度详情
        </p>

        {/* Pet cards – recommended first */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', paddingBottom: 20 }}>
          {ranked.map(({ pet, rank }) => (
            <PetCard
              key={pet.id}
              pet={pet}
              isSelected={selectedPet === pet.id}
              isRecommended={rank === 1}
              recommendRank={rank <= 2 ? rank : undefined}
              accentColor={accentColor}
              isHovered={hovered === pet.id}
              onSelect={() => handleSelect(pet.id as PetId)}
              onHover={(id) => setHovered(id as PetId | null)}
              radarMaxValue={100}
            />
          ))}
        </div>

        {/* Next button */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            onClick={handleNext}
            disabled={!selectedPet}
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
            }}
          >
            前往喂食 🍰
          </button>
        </div>
      </div>
    </div>
  );
}
