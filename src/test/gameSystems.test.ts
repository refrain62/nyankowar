import { describe, expect, it, vi } from "vitest";
import { STAGES } from "../constants/stages";
import {
	processUnitsAndCombat,
	spawnEnemies,
	updateCooldowns,
	updateEconomy,
} from "../logic/gameSystems";
import type { GameState } from "../types/game";

describe("gameSystems", () => {
	const mockAudio = {
		playCharinSound: vi.fn(),
		playGashiSound: vi.fn(),
		stopBGM: vi.fn(),
		playVictoryFanfare: vi.fn(),
		playDefeatJingle: vi.fn(),
	} as any;

	const createInitialState = (): GameState => ({
		money: 0,
		walletLevel: 1,
		baseHp: 1000,
		enemyBaseHp: 1000,
		allies: [],
		enemies: [],
		cannonCharge: 0,
		isCannonCharging: false,
		isCannonFiring: false,
		enemySpawnTimer: 0,
		unitCounts: {},
		cooldowns: { BASIC: 1000 },
		lastTime: 0,
		lastAttackSoundTime: 0,
		gameState: "play",
	});

	it("updateEconomy: 働きネコのレベルに応じて所持金が増えること", () => {
		const state = createInitialState();
		updateEconomy(state, 1); // 1秒経過
		// 初期レベル1: 30 + 1*20 = 50
		expect(state.money).toBe(50);
	});

	it("updateCooldowns: 時間経過でクールダウンが減り、完了時にSEが鳴ること", () => {
		const state = createInitialState();
		updateCooldowns(state, 1, mockAudio); // 1秒経過
		expect(state.cooldowns.BASIC).toBe(0);
		expect(mockAudio.playCharinSound).toHaveBeenCalled();
	});

	it("spawnEnemies: タイマーが閾値を超えると敵が生成されること", () => {
		const state = createInitialState();
		const stage = STAGES[1];
		state.enemySpawnTimer = stage.enemySpawnRate - 100;
		spawnEnemies(state, 0.2, stage); // 200ms経過
		expect(state.enemies.length).toBe(1);
		expect(state.enemySpawnTimer).toBe(0);
	});

	it("processUnitsAndCombat: 射程内のユニット同士がダメージを与え合うこと", () => {
		const state = createInitialState();
		state.allies.push({
			id: 1,
			x: 400,
			y: 0,
			type: "ally",
			unitType: "BASIC",
			stats: { range: 100, damage: 10, hp: 100 } as any,
			currentHp: 100,
		});
		state.enemies.push({
			id: 2,
			x: 450,
			y: 0,
			type: "enemy",
			unitType: "ENEMY",
			stats: { range: 100, damage: 10, hp: 100 } as any,
			currentHp: 100,
		});

		processUnitsAndCombat(state, 1, mockAudio, STAGES[1], 1000);

		expect(state.allies[0].currentHp).toBeLessThan(100);
		expect(state.enemies[0].currentHp).toBeLessThan(100);
		expect(mockAudio.playGashiSound).toHaveBeenCalled();
	});
});
