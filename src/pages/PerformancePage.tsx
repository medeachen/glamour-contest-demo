import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS } from '../data/gameData';
import { StageScene } from '../components/StageScene';
import { SkillEffect } from '../components/SkillEffect';
import { performContest } from '../utils/gameLogic';
import type { FinalScore } from '../types';

const SKILL_COLORS = ['#a78bfa', '#f472b6', '#34d399'];

export function PerformancePage() {
  const { selectedPet, selectedContest, selectedFoods, setPhase, setFinalScore, saveHighScore } = useGameStore();
  const [currentSkill, setCurrentSkill] = useState(-1);
  const [skillVisible, setSkillVisible] = useState(false);
  const [isCrit, setIsCrit] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [done, setDone] = useState(false);
  const finalRef = useRef<FinalScore | null>(null);
  const runOnce = useRef(false);

  useEffect(() => {
    if (runOnce.current) return;
    runOnce.current = true;
    if (!selectedPet || !selectedContest) { setPhase('lobby'); return; }

    const result = performContest(selectedPet, selectedContest, selectedFoods);
    finalRef.current = result;

    // Sequence: skill 0 at t=0, skill 1 at t=3000, skill 2 at t=6000, done at t=9500
    for (let i = 0; i < 3; i++) {
      const delay = i * 3000;
      setTimeout(() => {
        setCurrentSkill(i);
        setSkillVisible(true);
        const hasCrit = Math.random() < result.critRate;
        setIsCrit(hasCrit);
        setTimeout(() => setSkillVisible(false), 2200);
      }, delay);
    }

    setTimeout(() => {
      setFinalScore(result);
      saveHighScore();
      // Animate score
      const target = result.total;
      let current = 0;
      const step = target / 60;
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        setDisplayScore(Math.round(current));
        if (current >= target) clearInterval(interval);
      }, 16);
      setDone(true);
    }, 9500);
  }, []);

  if (!selectedPet || !selectedContest) return null;

  const pet = PETS.find(p => p.id === selectedPet)!;
  const skillColor = currentSkill >= 0 ? SKILL_COLORS[currentSkill % SKILL_COLORS.length] : '#a78bfa';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0d0021, #1a0a2e, #0a1628)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 20, textShadow: '0 0 20px #a78bfa' }}>
        🎭 {pet.name} 的精彩表演！
      </h1>

      {/* Stage */}
      <div style={{ position: 'relative' }}>
        <StageScene petId={selectedPet} contestId={selectedContest ?? undefined} width={400} height={300} skillActive={skillVisible} skillColor={skillColor} />
        <SkillEffect
          skillName={currentSkill >= 0 ? pet.skills[currentSkill]?.name ?? '' : ''}
          isCrit={isCrit}
          visible={skillVisible}
          color={skillColor}
        />
      </div>

      {/* Skill indicator */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        {pet.skills.map((skill, i) => (
          <div key={i} style={{
            padding: '8px 18px', borderRadius: 12,
            background: currentSkill === i ? SKILL_COLORS[i] : 'rgba(255,255,255,0.1)',
            color: 'white', fontSize: 14, fontWeight: 700,
            boxShadow: currentSkill === i ? `0 0 20px ${SKILL_COLORS[i]}` : 'none',
            transition: 'all 0.3s',
          }}>
            {currentSkill > i ? '✅' : currentSkill === i ? '▶' : '○'} {skill.name}
          </div>
        ))}
      </div>

      {/* Score display */}
      {done && (
        <div style={{ marginTop: 28, textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ color: '#aaa', fontSize: 14, marginBottom: 4 }}>最终得分</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#ffd700', textShadow: '0 0 30px #ffd700' }}>
            {displayScore}
          </div>
          <button onClick={() => setPhase('settlement')}
            style={{ marginTop: 16, background: 'linear-gradient(135deg, #a78bfa, #f472b6)', color: 'white', border: 'none', borderRadius: 14, padding: '12px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(167,139,250,0.5)' }}>
            查看结果 →
          </button>
        </div>
      )}
    </div>
  );
}
