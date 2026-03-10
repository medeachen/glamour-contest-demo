import type { Contest, Pet, Food } from '../types';

export const CONTESTS: Contest[] = [
  {
    id: 'elegance',
    name: '风华绝伦赛',
    icon: '🌸',
    description: '展示优雅与情感的绝妙表演，以情感和好奇心征服评审！',
    weights: { emotion: 2.0, curiosity: 1.5, mind: 1.0, power: 0.5 },
    theme: 'elegance',
    themeColor: '#f8b4c8',
  },
  {
    id: 'wild',
    name: '狂野冲击赛',
    icon: '⚡',
    description: '力量与智慧的极限碰撞，以力量和头脑震撼全场！',
    weights: { power: 2.0, mind: 1.5, curiosity: 1.0, emotion: 0.5 },
    theme: 'wild',
    themeColor: '#ffd080',
  },
  {
    id: 'creative',
    name: '奇思妙想赛',
    icon: '🧩',
    description: '头脑与好奇心的创意盛宴，用独特想象力赢得满堂彩！',
    weights: { mind: 2.0, curiosity: 1.5, emotion: 1.0, power: 0.5 },
    theme: 'creative',
    themeColor: '#b4d4ff',
  },
];

export const PETS: Pet[] = [
  {
    id: 'snow',
    name: '雪团团',
    icon: '🐕',
    description: '蓬松雪白的毛团，充满活力与力量，最爱辛辣食物！',
    baseStats: { mind: 50, emotion: 55, curiosity: 60, power: 85 },
    affection: 70,
    tastePreference: { spicy: 15, bitter: 10, sweet: 5, salty: -5, sour: -15 },
    colorPrimary: '#ffffff',
    colorSecondary: '#ffd700',
    skills: [
      { name: '蓬毛旋风', description: '蓬松的毛发旋转成风暴！', bonus: { power: 20, curiosity: 10 } },
      { name: '雪球冲锋', description: '如雪球般高速冲撞！', bonus: { power: 25, mind: 5 } },
      { name: '绒光爆裂', description: '绒毛爆发出耀眼光芒！', bonus: { emotion: 15, power: 10, curiosity: 5 } },
    ],
  },
  {
    id: 'hamster',
    name: '圆咕噜',
    icon: '🐹',
    description: '圆滚滚的可爱仓鼠，情感丰富细腻，超爱甜食！',
    baseStats: { mind: 65, emotion: 85, curiosity: 55, power: 50 },
    affection: 75,
    tastePreference: { sweet: 15, salty: 10, sour: 5, spicy: -5, bitter: -15 },
    colorPrimary: '#fff5e0',
    colorSecondary: '#ffb6c1',
    skills: [
      { name: '腮帮气球', description: '腮帮子鼓成气球状，超可爱！', bonus: { emotion: 20, curiosity: 10 } },
      { name: '滚滚圆舞曲', description: '像球一样优雅翻滚！', bonus: { emotion: 25, mind: 5 } },
      { name: '星屑撒花', description: '洒下满天星屑与花瓣！', bonus: { emotion: 15, mind: 10, curiosity: 5 } },
    ],
  },
  {
    id: 'raccoon',
    name: '影丸',
    icon: '🦝',
    description: '神秘聪明的浣熊，头脑发达好奇心旺盛，偏爱酸味！',
    baseStats: { mind: 80, emotion: 60, curiosity: 75, power: 40 },
    affection: 65,
    tastePreference: { sour: 15, spicy: 10, bitter: 5, sweet: -5, salty: -15 },
    colorPrimary: '#b0c4de',
    colorSecondary: '#2f4f4f',
    skills: [
      { name: '幻影分身', description: '制造多个幻影迷惑对手！', bonus: { mind: 20, curiosity: 10 } },
      { name: '月光把戏', description: '借助月光施展神秘魔术！', bonus: { mind: 25, emotion: 5 } },
      { name: '环尾彩虹', description: '尾巴划出绚丽彩虹弧线！', bonus: { curiosity: 20, mind: 5, emotion: 5 } },
    ],
  },
];

export const FOODS: Food[] = [
  { id: 'sweet', name: '甜蜜果', icon: '🍰', taste: '甜味', statBonus: { emotion: 15, curiosity: 5 } },
  { id: 'sour', name: '酸涩果', icon: '🍋', taste: '酸味', statBonus: { mind: 15, curiosity: 5 } },
  { id: 'bitter', name: '苦涩果', icon: '🍵', taste: '苦味', statBonus: { power: 10, mind: 10 } },
  { id: 'spicy', name: '辛辣果', icon: '🌶️', taste: '辣味', statBonus: { power: 15, curiosity: 5 } },
  { id: 'salty', name: '咸脆果', icon: '🧂', taste: '咸味', statBonus: { curiosity: 15, emotion: 5 } },
];

export const DIM_LABELS: Record<string, string> = {
  mind: '头脑',
  emotion: '情感',
  curiosity: '好奇',
  power: '力量',
};
