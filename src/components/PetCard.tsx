import type { Pet } from '../types';
import { AppRadarChart } from './AppRadarChart';
import { computeRecommendation } from '../utils/scoring';

const MAX_DESCRIPTION_LENGTH = 28;

interface Props {
  pet: Pet;
  recommended?: boolean;
  accentColor?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function PetCard({ pet, recommended = false, accentColor = '#9c27b0', isSelected = false, onClick }: Props) {
  const score = computeRecommendation(pet);

  const radarData = [
    { name: '头脑', value: pet.baseStats.mind },
    { name: '情感', value: pet.baseStats.emotion },
    { name: '好奇', value: pet.baseStats.curiosity },
    { name: '力量', value: pet.baseStats.power },
  ];

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: 20,
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        width: 200,
        textAlign: 'center',
        boxShadow: isSelected
          ? `0 8px 32px ${accentColor}44`
          : recommended
          ? '0 6px 24px rgba(255,193,7,0.3)'
          : '0 4px 12px rgba(0,0,0,0.07)',
        border: isSelected
          ? `2px solid ${accentColor}`
          : recommended
          ? '2px solid #ffc107'
          : '2px solid transparent',
        transform: isSelected ? 'translateY(-4px)' : 'none',
        transition: 'all 0.3s',
        position: 'relative',
      }}
      aria-label={`${pet.name}，综合推荐评分 ${score}`}
    >
      {/* Recommended badge */}
      {recommended && (
        <div style={{
          position: 'absolute',
          top: -10,
          right: -8,
          background: 'linear-gradient(135deg, #ffc107, #ff8f00)',
          color: 'white',
          borderRadius: 12,
          padding: '3px 10px',
          fontSize: 11,
          fontWeight: 800,
          boxShadow: '0 2px 8px rgba(255,193,7,0.4)',
          zIndex: 1,
        }}>
          ⭐ 推荐
        </div>
      )}

      {/* Avatar */}
      <div style={{ fontSize: 48, margin: '4px 0 8px' }}>{pet.icon}</div>

      {/* Name */}
      <div style={{ fontWeight: 800, fontSize: 16, color: '#333', marginBottom: 4 }}>{pet.name}</div>
      <div style={{ color: '#888', fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>{pet.description.slice(0, MAX_DESCRIPTION_LENGTH)}…</div>

      {/* Radar thumbnail */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
        <AppRadarChart
          data={radarData}
          maxValue={100}
          color={isSelected ? accentColor : '#a78bfa'}
          size={140}
          ariaLabel={`${pet.name}属性雷达：${radarData.map(d => `${d.name}${d.value}`).join('，')}`}
        />
      </div>

      {isSelected && (
        <div style={{ color: accentColor, fontWeight: 700, fontSize: 13, marginTop: 4 }}>✅ 已选择</div>
      )}
    </div>
  );
}
