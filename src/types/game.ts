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
	type: "ally" | "enemy";
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

/**
 * ゲーム全体の動的状態を定義
 */
export interface GameState {
	money: number;
	walletLevel: number;
	baseHp: number;
	enemyBaseHp: number;
	cannonCharge: number;
	isCannonCharging: boolean;
	isCannonFiring: boolean;
	allies: Unit[];
	enemies: Unit[];
	enemySpawnTimer: number;
	unitCounts: Record<string, number>;
	lastTime: number;
	lastAttackSoundTime: number;
	gameState: "title" | "start" | "play" | "pause" | "win" | "lose";
	cooldowns: Record<string, number>;
}

/**
 * UI表示用の状態を定義 (ReactのStateとして管理される)
 */
export interface UIState {
	money: number;
	walletLevel: number;
	baseHp: number;
	enemyBaseHp: number;
	cannonCharge: number;
	gameState: "title" | "start" | "play" | "pause" | "win" | "lose";
	cooldownPercents: Record<string, number>;
}
