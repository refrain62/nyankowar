import type { StageConfig } from "../../types/game";

export const stage4: StageConfig = {
	id: 4,
	name: "宇宙: 月面拠点",
	baseHp: 1500,
	enemyBaseHp: 3000,
	enemySpawnRate: 2500,
	enemyHpMultiplier: 2.0,
	background: {
		skyTop: "#000000",
		skyBottom: "#1c2833",
		mountainFar: "#566573",
		mountainNear: "#2c3e50",
		grass: "#d5dbdb",
		dirt: "#85929e",
	},
};
