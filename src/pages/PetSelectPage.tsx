import { useGameStore } from '../store/gameStore';
import { PETS } from '../data/gameData';
import type { PetId } from '../types';
import { PetModel } from '../components/PetModel';
import { PetCard } from '../components/PetCard';
import { AppRadarChart } from '../components/AppRadarChart';
import { computeRecommendation, buildDisplayStats } from '../utils/scoring';

export function PetSelectPage() {
  const { setPhase, selectPet, selectedPet, selectedContest } = useGameStore();

  function handleSelect(id: PetId) {
    selectPet(id);
  }

  function handleNext() {
    if (selectedPet) setPhase('feeding');
  }

  const contestColors: Record<string, string> = { elegance: '#3a5080', sweet: '#e91e8c', dashing: '#f57c00', fresh: '#2e7d32', charm: '#c62828' };
  const accentColor = selectedContest ? contestColors[selectedContest] : '#9c27b0';

  // Neutral baseline mood used for radar preview on selection screen (no food selected yet)
  const PREVIEW_MOOD_VALUE = 50;

  // Sort pets by equal-weight 5D recommendation score
  const sortedPets = [...PETS].sort((a, b) => computeRecommendation(b) - computeRecommendation(a));

  // Determine top recommended pet (by computeRecommendation)
  const topPetId = sortedPets[0]?.id ?? null;

  const activePet = selectedPet ? PETS.find(p => p.id === selectedPet) : null;

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

        {/* ── Horizontal 3-column layout ── */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* LEFT column – pet cards using PetCard component */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220, flex: '0 0 auto' }}>
            {sortedPets.map((pet) => {
              const isTop = pet.id === topPetId;
              return (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  recommended={isTop}
                  accentColor={accentColor}
                  isSelected={selectedPet === pet.id}
                  onClick={() => handleSelect(pet.id)}
                />
              );
            })}
          </div>

          {/* CENTER column – AppRadarChart */}
          <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {activePet ? (
              <div style={{ background: 'white', borderRadius: 24, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>五维能力雷达</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <AppRadarChart
                    data={(() => {
                      const s = buildDisplayStats(activePet.baseStats, activePet.affection, PREVIEW_MOOD_VALUE);
                      return [
                        { name: '头脑', value: s.mind },
                        { name: '情感', value: s.emotion },
                        { name: '好奇', value: s.curiosity },
                        { name: '力量', value: s.power },
                        { name: '闪光', value: s.sparkle },
                      ];
                    })()}
                    maxValue={100}
                    color={accentColor}
                    size={220}
                    ariaLabel={`${activePet.name}五维能力雷达`}
                  />
                </div>
                <div style={{ fontSize: 12, color: '#aaa' }}>悬停数据点查看精确数值</div>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 24, padding: 40, textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🐾</div>
                <div style={{ color: '#aaa', fontSize: 15 }}>选择一只宠物查看能力雷达</div>
              </div>
            )}
          </div>

          {/* RIGHT column – pet detail & actions */}
          <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activePet ? (
              <>
                {/* Pet card */}
                <div style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                  <PetModel petId={activePet.id} size={160} animate />
                  <h2 style={{ margin: '8px 0 4px', fontSize: 22, color: '#333', fontWeight: 800 }}>
                    {activePet.icon} {activePet.name}
                  </h2>
                  <p style={{ color: '#777', fontSize: 12, margin: '0 0 12px', lineHeight: 1.6 }}>{activePet.description}</p>
                </div>

                {/* Skills preview */}
                <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 10 }}>表演技能</div>
                  {activePet.skills.map((skill, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0', borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none' }}>
                      <span style={{ background: `${accentColor}22`, color: accentColor, borderRadius: 8, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{i + 1}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>{skill.name}</div>
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{skill.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button onClick={handleNext}
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, #9c27b0)`,
                    color: 'white', border: 'none', borderRadius: 16, padding: '14px 0', fontSize: 17,
                    fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'all 0.3s', width: '100%',
                  }}>
                  前往喂食 🍰
                </button>
              </>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 24, padding: 32, textAlign: 'center' }}>
                <div style={{ color: '#bbb', fontSize: 14 }}>← 从左侧选择宠物</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
