import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS } from '../data/gameData';
import { StageScene } from '../components/StageScene';
import { SkillEffect } from '../components/SkillEffect';
import { SkillScore } from '../components/SkillScore';
import { performContest } from '../utils/gameLogic';
import { getGrade } from '../utils/scoring';
import type { FinalScore } from '../types';

const SKILL_COLORS = ['#a78bfa', '#f472b6', '#34d399'];

interface SkillResult {
  skillIndex: number;
  score: number; // 0–100 normalized for display
  isCrit: boolean;
}

export function PerformancePage() {
  const { selectedPet, selectedContest, selectedFoods, setPhase, setFinalScore, saveHighScore } = useGameStore();
  const [currentSkill, setCurrentSkill] = useState(-1);
  const [skillVisible, setSkillVisible] = useState(false);
  const [isCrit, setIsCrit] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [done, setDone] = useState(false);
  const [skillResults, setSkillResults] = useState<SkillResult[]>([]);
  const finalRef = useRef<FinalScore | null>(null);
  const runOnce = useRef(false);

  useEffect(() => {
    if (runOnce.current) return;
    runOnce.current = true;
    if (!selectedPet || !selectedContest) { setPhase('lobby'); return; }

    const result = performContest(selectedPet, selectedContest, selectedFoods);
    finalRef.current = result;

    const pet = PETS.find(p => p.id === selectedPet)!;

    for (let i = 0; i < 3; i++) {
      const delay = i * 3000;
      setTimeout(() => {
        setCurrentSkill(i);
        setSkillVisible(true);
        const hasCrit = Math.random() < result.critRate;
        setIsCrit(hasCrit);

        // Compute a 0-100 display score for this skill
        const skillBonus = pet.skills[i]?.bonus ?? {};
        const dims = ['mind', 'emotion', 'curiosity', 'power'] as const;
        const skillSum = dims.reduce((s, d) => s + (skillBonus[d] ?? 0), 0);
        const maxPossible = 30; // approximate max skill bonus sum
        const baseScore = Math.min((skillSum / maxPossible) * 100, 100);
        const critBonus = hasCrit ? 15 : 0;
        const moodBonus = (result.mood / 100) * 10;
        const finalSkillScore = Math.min(baseScore + critBonus + moodBonus, 100);

        setSkillResults(prev => {
          const next = [...prev];
          next[i] = { skillIndex: i, score: Math.round(finalSkillScore), isCrit: hasCrit };
          return next;
        });

        setTimeout(() => setSkillVisible(false), 2200);
      }, delay);
    }

    setTimeout(() => {
      setFinalScore(result);
      saveHighScore();
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
  const grade = finalRef.current ? getGrade(finalRef.current.total) : null;

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

      {/* Real-time skill scores */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {pet.skills.map((skill, i) => (
          <SkillScore
            key={i}
            index={i}
            skillName={skill.name}
            score={skillResults[i]?.score ?? 0}
            isActive={skillResults[i] !== undefined}
            isCrit={skillResults[i]?.isCrit ?? false}
            color={SKILL_COLORS[i % SKILL_COLORS.length]}
          />
        ))}
      </div>

      {/* Skill progress dots */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        {pet.skills.map((skill, i) => (
          <div key={i} style={{
            padding: '6px 14px', borderRadius: 10,
            background: currentSkill === i ? SKILL_COLORS[i] : skillResults[i] ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
            color: 'white', fontSize: 13, fontWeight: 700,
            boxShadow: currentSkill === i ? `0 0 16px ${SKILL_COLORS[i]}` : 'none',
            transition: 'all 0.3s',
          }}>
            {skillResults[i] ? '✅' : currentSkill === i ? '▶' : '○'} {skill.name}
          </div>
        ))}
      </div>

      {/* Final score */}
      {done && (
        <div style={{ marginTop: 28, textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ color: '#aaa', fontSize: 14, marginBottom: 4 }}>
            表演完成！等级：<span style={{ color: '#ffd700', fontWeight: 800, fontSize: 18 }}>{grade}</span>
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: '#ffd700', textShadow: '0 0 30px #ffd700' }}>
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
