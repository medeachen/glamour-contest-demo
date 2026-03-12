import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS } from '../data/gameData';
import { StageScene } from '../components/StageScene';
import { SkillEffect } from '../components/SkillEffect';
import { SkillScore } from '../components/SkillScore';
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
  const [skillScores, setSkillScores] = useState<number[]>([-1, -1, -1]);
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

        // Animate skill score
        const dims = ['mind', 'emotion', 'curiosity', 'power'] as const;
        const skillPet = PETS.find(p => p.id === selectedPet);
        const skillDimScore = skillPet
          ? dims.reduce((sum, d) => sum + (skillPet.skills[i]?.bonus[d] ?? 0), 0)
          : 0;
        const baseScore = 40 + skillDimScore * 0.6 + (hasCrit ? 20 : 0);
        const target = Math.min(100, Math.max(10, baseScore));

        let current = 0;
        const step = target / 20;
        const iv = setInterval(() => {
          current = Math.min(current + step, target);
          setSkillScores(prev => {
            const next = [...prev];
            next[i] = Math.round(current);
            return next;
          });
          if (current >= target) clearInterval(iv);
        }, 50);

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

      {/* Skill indicator + real-time scores */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {pet.skills.map((skill, i) => (
          <div key={i} style={{
            padding: '10px 18px', borderRadius: 14, minWidth: 160,
            background: currentSkill === i ? `${SKILL_COLORS[i]}22` : 'rgba(255,255,255,0.06)',
            border: `1.5px solid ${currentSkill >= i ? SKILL_COLORS[i] : 'rgba(255,255,255,0.1)'}`,
            transition: 'all 0.4s',
          }}>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              {currentSkill > i ? '✅' : currentSkill === i ? '▶' : '○'} {skill.name}
            </div>
            {skillScores[i] >= 0 && (
              <SkillScore
                skillName={skill.name}
                score={skillScores[i]}
                color={SKILL_COLORS[i]}
              />
            )}
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
