import type { StageConfig } from "../../types/game";

export const stage1: StageConfig = {
	id: 1,
	name: "日本: 昼の草原",
	baseHp: 1000,
	enemyBaseHp: 1000,
	enemySpawnRate: 4000,
	enemyHpMultiplier: 1.0,
	background: {
		skyTop: "#85c1e9",
		skyBottom: "#d6eaf8",
		mountainFar: "#5dade2",
		mountainNear: "#3498db",
		grass: "#229954",
		dirt: "#7d6608",
	},
};
