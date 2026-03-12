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
  // Track per-skill scores for real-time display
  const [skillScores, setSkillScores] = useState<number[]>([0, 0, 0]);
  const [skillStates, setSkillStates] = useState<('idle' | 'active' | 'done')[]>(['idle', 'idle', 'idle']);
  const [skillCrits, setSkillCrits] = useState<boolean[]>([false, false, false]);
  const finalRef = useRef<FinalScore | null>(null);
  const runOnce = useRef(false);

  useEffect(() => {
    if (runOnce.current) return;
    runOnce.current = true;
    if (!selectedPet || !selectedContest) { setPhase('lobby'); return; }

    const result = performContest(selectedPet, selectedContest, selectedFoods);
    finalRef.current = result;

    // Compute per-skill scores from weighted dims divided by 3 skills
    const dims = ['mind', 'emotion', 'curiosity', 'power'] as const;
    const pet = PETS.find(p => p.id === selectedPet)!;
    const perSkillScores = pet.skills.map((skill) => {
      return dims.reduce((s, d) => s + (skill.bonus[d] ?? 0) * (result.weights[d] ?? 1), 0);
    });

    for (let i = 0; i < 3; i++) {
      const delay = i * 3000;

      setTimeout(() => {
        // Each skill gets its own independent crit roll
        const hasCrit = Math.random() < result.critRate;
        setCurrentSkill(i);
        setSkillVisible(true);
        setIsCrit(hasCrit);
        setSkillCrits(prev => { const next = [...prev]; next[i] = hasCrit; return next; });
        setSkillStates(prev => { const next = [...prev]; next[i] = 'active'; return next; });

        // Animate skill score
        const target = perSkillScores[i] * (hasCrit ? result.critMultiplier : 1);
        let current = 0;
        const steps = 30;
        const inc = target / steps;
        let step = 0;
        const scoreInterval = setInterval(() => {
          step++;
          current = Math.min(current + inc, target);
          setSkillScores(prev => { const next = [...prev]; next[i] = current; return next; });
          if (step >= steps) clearInterval(scoreInterval);
        }, 50);

        setTimeout(() => {
          setSkillVisible(false);
          setSkillStates(prev => { const next = [...prev]; next[i] = 'done'; return next; });
        }, 2200);
      }, delay);
    }

    setTimeout(() => {
      setFinalScore(result);
      saveHighScore();
      // Animate total score
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

      {/* Real-time skill scores panel */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20, width: '100%', maxWidth: 460, flexDirection: 'column' }}>
        {pet.skills.map((skill, i) => (
          <SkillScore
            key={i}
            skillName={skill.name}
            score={skillScores[i]}
            isCrit={skillCrits[i]}
            state={skillStates[i]}
            color={SKILL_COLORS[i % SKILL_COLORS.length]}
          />
        ))}
      </div>

      {/* Total score display */}
      {done && (
        <div style={{ marginTop: 28, textAlign: 'center' }}>
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
