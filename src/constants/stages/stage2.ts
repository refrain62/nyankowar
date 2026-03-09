import type { StageConfig } from "../../types/game";

export const stage2: StageConfig = {
	id: 2,
	name: "日本: 夕暮れの平原",
	baseHp: 1000,
	enemyBaseHp: 1500,
	enemySpawnRate: 3500,
	enemyHpMultiplier: 1.2,
	background: {
		skyTop: "#d35400",
		skyBottom: "#f39c12",
		mountainFar: "#a04000",
		mountainNear: "#873600",
		grass: "#1e8449",
		dirt: "#512e5f",
	},
};
