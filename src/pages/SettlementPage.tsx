import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PETS, CONTESTS, DIM_LABELS } from '../data/gameData';
import { RadarChart } from '../components/RadarChart';

const GRADE_COLORS: Record<string, string> = { S: '#ffd700', A: '#c0c0c0', B: '#cd7f32', C: '#7ec8e3', D: '#aaa' };
const GRADE_BG: Record<string, string> = {
  S: 'linear-gradient(135deg, #fff8dc, #ffd700, #ff8c00)',
  A: 'linear-gradient(135deg, #f0f0f0, #c0c0c0, #888)',
  B: 'linear-gradient(135deg, #f5deb3, #cd7f32, #8b4513)',
  C: 'linear-gradient(135deg, #e0f7ff, #7ec8e3, #5599bb)',
  D: 'linear-gradient(135deg, #f5f5f5, #aaa, #777)',
};

const GRADE_FX: Record<string, { bg: string; particles: string; title: string; subtitle: string }> = {
  S: {
    bg: 'linear-gradient(160deg, #2a1a00, #1a0a00, #3a2a00)',
    particles: '🌟✨🏆🎉🌠💫',
    title: '传奇级表演！',
    subtitle: '无与伦比，震撼全场！观众沸腾，历史铭记！',
  },
  A: {
    bg: 'linear-gradient(160deg, #1a1a2e, #0d0d1a, #2a2a40)',
    particles: '⭐🥈✨🎊🎉',
    title: '出色表演！',
    subtitle: '精彩纷呈，赢得全场热烈掌声！',
  },
  B: {
    bg: 'linear-gradient(160deg, #1a0d00, #0a0800, #2a1a00)',
    particles: '🥉⭐🎶🎵',
    title: '良好表演！',
    subtitle: '稳扎稳打，给观众留下美好印象！',
  },
  C: {
    bg: 'linear-gradient(160deg, #001a2e, #000d1a, #002a3a)',
    particles: '💙🌊⭐',
    title: '不错的表演！',
    subtitle: '虽有遗憾，但已展现出真诚的努力！',
  },
  D: {
    bg: 'linear-gradient(160deg, #1a1a1a, #0d0d0d, #2a2a2a)',
    particles: '💪🌱😊',
    title: '完成表演！',
    subtitle: '参与比赛本身就是勇气的体现，继续加油！',
  },
};

function FloatingParticles({ grade }: { grade: string }) {
  const chars = (GRADE_FX[grade]?.particles ?? '⭐').split('');
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {chars.map((char, i) =>
        Array.from({ length: 3 }, (_, j) => (
          <motion.div
            key={`${i}-${j}`}
            style={{ position: 'absolute', fontSize: 20 + Math.random() * 16, left: `${Math.random() * 100}%`, top: '-40px' }}
            animate={{ y: ['0vh', '110vh'], rotate: [0, 360], opacity: [0.8, 0] }}
            transition={{ duration: 3 + Math.random() * 4, delay: (i * 3 + j) * 0.4, repeat: Infinity, ease: 'linear' }}
          >
            {char}
          </motion.div>
        ))
      )}
    </div>
  );
}

export function SettlementPage() {
  const { finalScore, selectedPet, selectedContest, highScores, resetGame } = useGameStore();
  const [gradeVisible, setGradeVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setGradeVisible(true), 300);
    setTimeout(() => setContentVisible(true), 1000);
  }, []);

  if (!finalScore || !selectedPet || !selectedContest) { return null; }

  const pet = PETS.find(p => p.id === selectedPet)!;
  const contest = CONTESTS.find(c => c.id === selectedContest)!;
  const hs = highScores[selectedContest];
  const isNewRecord = hs && Math.round(hs.score) === Math.round(finalScore.total);

  const fx = GRADE_FX[finalScore.grade] ?? GRADE_FX['D'];

  return (
    <div style={{ minHeight: '100vh', background: fx.bg, padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Ambient particles */}
      <FloatingParticles grade={finalScore.grade} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Contest name */}
        <div style={{ fontSize: 14, color: '#aaa', marginBottom: 16 }}>{contest.icon} {contest.name}</div>

        {/* Pet big display */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          style={{ fontSize: 100, textAlign: 'center', marginBottom: 8 }}
        >
          {pet.icon}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 4 }}
        >
          {pet.name}
        </motion.div>

        {/* Grade badge */}
        <motion.div
          style={{
            width: 96, height: 96, borderRadius: '50%', background: GRADE_BG[finalScore.grade],
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px auto',
            fontSize: 60, fontWeight: 900, color: 'white',
            boxShadow: `0 0 40px ${GRADE_COLORS[finalScore.grade]}88`,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={gradeVisible ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {finalScore.grade}
        </motion.div>

        {/* Title & subtitle */}
        <AnimatePresence>
          {contentVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 28, fontWeight: 900, color: GRADE_COLORS[finalScore.grade], textShadow: `0 0 20px ${GRADE_COLORS[finalScore.grade]}` }}>
                {fx.title}
              </div>
              <div style={{ color: '#ccc', fontSize: 15, marginTop: 6, maxWidth: 360 }}>
                {fx.subtitle}
              </div>
              <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>
                {finalScore.comment}
              </div>

              {isNewRecord && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ fontSize: 18, color: '#ffd700', fontWeight: 800, marginTop: 8 }}
                >
                  🎉 新纪录！
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary stats – grade only, no raw numbers */}
        {contentVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '10px 20px', textAlign: 'center', minWidth: 110 }}>
              <div style={{ color: '#aaa', fontSize: 11, marginBottom: 3 }}>综合等级</div>
              <div style={{ color: GRADE_COLORS[finalScore.grade], fontSize: 22, fontWeight: 900 }}>{finalScore.grade}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '10px 20px', textAlign: 'center', minWidth: 110 }}>
              <div style={{ color: '#aaa', fontSize: 11, marginBottom: 3 }}>暴击数</div>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{finalScore.critCount}次</div>
            </div>
            {hs && (
              <div style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 14, padding: '10px 20px', textAlign: 'center', minWidth: 110 }}>
                <div style={{ color: '#aaa', fontSize: 11, marginBottom: 3 }}>历史最高</div>
                <div style={{ color: '#ffd700', fontSize: 18, fontWeight: 800 }}>{hs.grade}</div>
              </div>
            )}
          </motion.div>
        )}

        {/* View details button */}
        {contentVisible && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: 20 }}>
            <button
              onClick={() => setDetailOpen(v => !v)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ddd', borderRadius: 12, padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              {detailOpen ? '收起详细评分 ▲' : '查看详细评分 ▼'}
            </button>
          </motion.div>
        )}

        {/* Detail modal/panel */}
        <AnimatePresence>
          {detailOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', width: '100%', marginTop: 12 }}
            >
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Radar */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <RadarChart values={finalScore.afterBonus} maxValue={200} color="#a78bfa" size={180} />
                </div>
                <div style={{ fontSize: 11, color: '#888', textAlign: 'center', marginBottom: 16 }}>悬停雷达图查看精确数值</div>

                {/* Score table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: '#ddd' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left', color: '#aaa' }}>维度</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa' }}>基础</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa' }}>食物</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa' }}>技能</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa' }}>合计</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa' }}>权重</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right', color: '#aaa' }}>得分</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(['mind', 'emotion', 'curiosity', 'power'] as const).map(dim => (
                        <tr key={dim} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          <td style={{ padding: '5px 8px', fontWeight: 700, color: '#e8d5ff' }}>{DIM_LABELS[dim]}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center' }}>{finalScore.baseStats[dim]}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', color: '#86efac' }}>+{finalScore.foodBonus[dim]}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', color: '#7dd3fc' }}>+{finalScore.skillBonus[dim]}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center' }}>{Math.round(finalScore.afterCrit[dim])}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', color: '#fbbf24' }}>×{finalScore.weights[dim]}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: '#ffd700' }}>{Math.round(finalScore.weighted[dim])}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid rgba(255,255,255,0.3)' }}>
                        <td colSpan={6} style={{ padding: '6px 8px', fontWeight: 700, color: '#fff' }}>总分</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 900, color: '#ffd700', fontSize: 16 }}>{Math.round(finalScore.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Other stats */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 }}>
                  {[
                    { label: '💕 暴击次数', value: `${finalScore.critCount}次` },
                    { label: '😊 心情值', value: `${finalScore.mood}/100` },
                    { label: '✨ 闪光值', value: finalScore.sparkle.toFixed(1) },
                    { label: '⚡ 暴击率', value: `${(finalScore.critRate * 100).toFixed(1)}%` },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '8px 14px', textAlign: 'center', minWidth: 100, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ color: '#aaa', fontSize: 11, marginBottom: 3 }}>{item.label}</div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: contentVisible ? 1 : 0 }}
          style={{ marginTop: 32, paddingBottom: 40 }}
        >
          <button onClick={resetGame}
            style={{ background: 'linear-gradient(135deg, #a78bfa, #f472b6)', color: 'white', border: 'none', borderRadius: 16, padding: '14px 48px', fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(167,139,250,0.4)' }}>
            🏠 回到大厅
          </button>
        </motion.div>
      </div>
    </div>
  );
}
