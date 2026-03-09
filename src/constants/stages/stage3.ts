import type { StageConfig } from "../../types/game";

export const stage3: StageConfig = {
	id: 3,
	name: "日本: 深夜の森",
	baseHp: 1200,
	enemyBaseHp: 2000,
	enemySpawnRate: 3000,
	enemyHpMultiplier: 1.5,
	background: {
		skyTop: "#1a1a2e",
		skyBottom: "#16213e",
		mountainFar: "#0f3460",
		mountainNear: "#16213e",
		grass: "#1b4332",
		dirt: "#081c15",
	},
};
