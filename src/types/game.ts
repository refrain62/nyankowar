/**
 * ゲームの基本定数
 */
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 340; // 450 * 3/4 (approx)

/**
 * ユニットの基本性能を定義
 */
export interface UnitStats {
  name: string;
  cost: number;
  hp: number;
  speed: number;
  damage: number;
  color: string;
  cooldown: number;
  radius: number;
  range: number;
}

/**
 * 画面上のユニットインスタンスの定義
 */
export interface Unit {
  id: number;
  x: number;
  y: number;
  type: 'ally' | 'enemy';
  unitType: string;
  stats: UnitStats;
  currentHp: number;
}

/**
 * ステージの背景設定を定義
 */
export interface StageBackground {
  skyTop: string;
  skyBottom: string;
  mountainFar: string;
  mountainNear: string;
  grass: string;
  dirt: string;
}

/**
 * ステージの全体構成を定義
 */
export interface StageConfig {
  id: number;
  name: string;
  baseHp: number;
  enemyBaseHp: number;
  enemySpawnRate: number;
  enemyHpMultiplier: number;
  background: StageBackground;
}
