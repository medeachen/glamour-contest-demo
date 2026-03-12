import type { Pet } from '../types';
import { RadarChart } from './RadarChart';
import { calculateSparkle } from '../utils/gameLogic';

interface Props {
  pet: Pet;
  isRecommended?: boolean;
  isSelected?: boolean;
  accentColor?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function PetCard({
  pet,
  isRecommended = false,
  isSelected = false,
  accentColor = '#9c27b0',
  onClick,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const sparkle = calculateSparkle(pet.affection, 50);

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: 'white',
        borderRadius: 24,
        padding: 20,
        cursor: onClick ? 'pointer' : 'default',
        width: 220,
        boxShadow: isSelected
          ? `0 8px 32px ${accentColor}44`
          : '0 4px 12px rgba(0,0,0,0.07)',
        border: isSelected
          ? `2px solid ${accentColor}`
          : isRecommended
          ? '2px solid #ffd700'
          : '2px solid transparent',
        transition: 'all 0.3s',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {isRecommended && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #ffd700, #ffb300)',
            color: '#5a3a00',
            borderRadius: 12,
            padding: '3px 12px',
            fontSize: 12,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(255,193,7,0.4)',
          }}
        >
          ⭐ 推荐
        </div>
      )}

      <div style={{ fontSize: 36, marginBottom: 4 }}>{pet.icon}</div>
      <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#333', fontWeight: 800 }}>
        {pet.name}
      </h3>

      {/* Radar thumbnail */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
        <RadarChart
          values={pet.baseStats}
          sparkle={sparkle}
          maxValue={100}
          color={accentColor}
          size={140}
        />
      </div>

      {isSelected && (
        <div style={{ marginTop: 8, color: accentColor, fontWeight: 700, fontSize: 14 }}>
          ✅ 已选择
        </div>
      )}
    </div>
  );
}
