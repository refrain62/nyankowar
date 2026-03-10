import { describe, expect, it, vi } from "vitest";
import { STAGES } from "../constants/stages";
import type { GameAudio } from "../hooks/useGameAudio";
import {
	processUnitsAndCombat,
	updateCooldowns,
	updateEconomy,
} from "../logic/gameSystems";
import { CANVAS_WIDTH, type GameState, type UnitStats } from "../types/game";

/**
 * 【責任】ゲームコアロジック（経済、戦闘、クールダウン、敵生成）の定量的検証。
 * すべての期待値は、数式に基づいた具体的な数値または列挙された状態で定義します。
 */
describe("gameSystems", () => {
	const mockAudio = {
		playCharinSound: vi.fn(),
		playGashiSound: vi.fn(),
		stopBGM: vi.fn(),
		playVictoryFanfare: vi.fn(),
		playDefeatJingle: vi.fn(),
	} as unknown as GameAudio;

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

	/**
	 * 経済システムの検証。
	 * 数式: 収入 = (基本給30 + Lv * 20) * dt
	 * 期待値: Lv1 で 0.5秒経過した際、収入は (30 + 1 * 20) * 0.5 = 25 となり、所持金が 100 から 125 に増加すること。
	 */
	it("updateEconomy: 0.5秒間で、働きネコのレベル(1)に応じた正確な金額(25)が増加し、キャノンチャージ(1.65)も増加すること", () => {
		const state = createInitialState();
		state.money = 100;
		state.cannonCharge = 0;
		updateEconomy(state, 0.5);
		expect(state.money).toBe(125);
		expect(state.cannonCharge).toBeCloseTo(1.65);
	});

	/**
	 * キャノンチャージの上限検証。
	 * 期待値: チャージ量が 100 を超える計算結果（99 + 3.3 = 102.3）であっても、最終的なチャージ量は 100 に固定されること。
	 */
	it("updateEconomy: キャノンチャージが上限値 100 を超えないこと", () => {
		const state = createInitialState();
		state.cannonCharge = 99;
		updateEconomy(state, 1);
		expect(state.cannonCharge).toBe(100);
	});

	/**
	 * クールダウン計算の検証。
	 * 期待値: 1000ms のクールダウン中に 0.5秒（500ms相当）経過した際、残りのクールダウンが 500ms であること。
	 */
	it("updateCooldowns: クールダウンが1000msから0.5秒(500ms)経過後、正確に 500ms 残っていること", () => {
		const state = createInitialState();
		state.cooldowns.BASIC = 1000;
		updateCooldowns(state, 0.5, mockAudio);
		expect(state.cooldowns.BASIC).toBe(500);
	});

	/**
	 * ユニット移動（射程外）の検証。
	 * 数式: 新座標 = 旧座標 + speed * (dt * 60)
	 * 期待値: speed=1, dt=1/60 の場合、座標が 100 から 101 へと 1px 増加すること。
	 */
	it("processUnitsAndCombat: 射程外(距離101px)の場合、ユニットが正確に速度×フレーム分(1px)移動すること", () => {
		const state = createInitialState();
		const dt = 1 / 60; // 1フレーム
		state.allies = [
			{
				id: 1,
				x: 100,
				y: 0,
				type: "ally",
				unitType: "BASIC",
				stats: {
					range: 100,
					speed: 1,
					damage: 10,
					hp: 100,
					name: "Basic",
					cost: 50,
					color: "white",
					cooldown: 1000,
					radius: 10,
				} as UnitStats,
				currentHp: 100,
			},
		];
		state.enemies = [
			{
				id: 2,
				x: 201, // 距離 101 > 射程 100
				y: 0,
				type: "enemy",
				unitType: "ENEMY",
				stats: {
					range: 100,
					speed: 0,
					damage: 10,
					hp: 100,
					name: "Enemy",
					cost: 0,
					color: "red",
					cooldown: 0,
					radius: 10,
				} as UnitStats,
				currentHp: 100,
			},
		];

		processUnitsAndCombat(state, dt, mockAudio, STAGES[1], 1000);
		expect(state.allies[0].x).toBe(101);
	});

	/**
	 * ユニット停止（射程内）の検証。
	 * 期待値: 射程内（距離99px）に敵が存在する場合、ユニットの X 座標が 100 のまま変化しないこと。
	 */
	it("processUnitsAndCombat: 射程内(距離99px)の場合、ユニットの座標が変化しない(移動停止)こと", () => {
		const state = createInitialState();
		const dt = 1 / 60;
		state.allies = [
			{
				id: 1,
				x: 100,
				y: 0,
				type: "ally",
				unitType: "BASIC",
				stats: {
					range: 100,
					speed: 1,
					damage: 10,
					hp: 100,
					name: "Basic",
					cost: 50,
					color: "white",
					cooldown: 1000,
					radius: 10,
				} as UnitStats,
				currentHp: 100,
			},
		];
		state.enemies = [
			{
				id: 2,
				x: 199, // 距離 99 < 射程 100
				y: 0,
				type: "enemy",
				unitType: "ENEMY",
				stats: {
					range: 100,
					speed: 0,
					damage: 10,
					hp: 100,
					name: "Enemy",
					cost: 0,
					color: "red",
					cooldown: 0,
					radius: 10,
				} as UnitStats,
				currentHp: 100,
			},
		];

		processUnitsAndCombat(state, dt, mockAudio, STAGES[1], 1000);
		expect(state.allies[0].x).toBe(100);
	});

	/**
	 * 勝利判定の検証。
	 * 期待値: 敵拠点HPが攻撃によって 0 以下になった瞬間に、gameState が 'win' へ遷移すること。
	 */
	it("processUnitsAndCombat: 敵拠点のHPが0になった瞬間に、gameStateが'win'に遷移すること", () => {
		const state = createInitialState();
		state.enemyBaseHp = 5;
		state.allies = [
			{
				id: 1,
				x: CANVAS_WIDTH - 149, // 拠点攻撃範囲内
				y: 0,
				type: "ally",
				unitType: "BASIC",
				stats: {
					range: 100,
					speed: 1,
					damage: 10,
					hp: 100,
					name: "Basic",
					cost: 50,
					color: "white",
					cooldown: 1000,
					radius: 10,
				} as UnitStats,
				currentHp: 100,
			},
		];

		processUnitsAndCombat(state, 1, mockAudio, STAGES[1], 1000);
		expect(state.enemyBaseHp).toBe(0);
		expect(state.gameState).toBe("win");
		expect(mockAudio.playVictoryFanfare).toHaveBeenCalledTimes(1);
	});

	/**
	 * 敗北判定の検証。
	 * 期待値: 自拠点HPが敵の攻撃によって 0 以下になった瞬間に、gameState が 'lose' へ遷移すること。
	 */
	it("processUnitsAndCombat: 自拠点のHPが0になった瞬間に、gameStateが'lose'に遷移すること", () => {
		const state = createInitialState();
		state.baseHp = 5;
		state.enemies = [
			{
				id: 2,
				x: 149, // 自拠点(x<150)攻撃範囲内
				y: 0,
				type: "enemy",
				unitType: "ENEMY",
				stats: {
					range: 100,
					speed: 1,
					damage: 10,
					hp: 100,
					name: "Enemy",
					cost: 0,
					color: "red",
					cooldown: 0,
					radius: 10,
				} as UnitStats,
				currentHp: 100,
			},
		];

		processUnitsAndCombat(state, 1, mockAudio, STAGES[1], 1000);
		expect(state.baseHp).toBe(0);
		expect(state.gameState).toBe("lose");
		expect(mockAudio.playDefeatJingle).toHaveBeenCalledTimes(1);
	});

	/**
	 * ユニット消滅の検証。
	 * 期待値: currentHp が 0 以下になったユニットが、次のフレームで allies 配列から削除（filter）されること。
	 */
	it("processUnitsAndCombat: HPが0になったユニットが正確に配列から削除され、lengthが0になること", () => {
		const state = createInitialState();
		state.allies = [
			{
				id: 1,
				x: 500,
				y: 0,
				type: "ally",
				unitType: "BASIC",
				stats: { range: 100, speed: 1, damage: 10, hp: 100 } as UnitStats,
				currentHp: 1, // 残りHP 1
			},
		];
		state.enemies = [
			{
				id: 2,
				x: 550, // 射程内
				y: 0,
				type: "enemy",
				unitType: "ENEMY",
				stats: { range: 100, speed: 1, damage: 10, hp: 100 } as UnitStats,
				currentHp: 100,
			},
		];

		// dt=1.0秒経過させ、10ダメージ与える (1 - 10 = -9)
		processUnitsAndCombat(state, 1, mockAudio, STAGES[1], 1000);
		expect(state.allies.length).toBe(0);
	});

	/**
	 * 敵生成ロジックの検証。
	 * 期待値: dt=1.0s (1000ms) 経過し、スポーンレート(500ms)を超えたとき、enemies 配列に 1 体のユニットが追加されること。
	 */
	it("spawnEnemies: 経過時間がスポーンレートを超えた際、新しい敵が CANVAS_WIDTH - 110 の位置に出現すること", () => {
		const state = createInitialState();
		const stage = { ...STAGES[1], enemySpawnRate: 500 };
		state.enemySpawnTimer = 0;

		// 1.0秒(1000ms)経過させる
		import("../logic/gameSystems").then(({ spawnEnemies }) => {
			spawnEnemies(state, 1, stage);
			expect(state.enemies.length).toBe(1);
			expect(state.enemies[0].x).toBe(CANVAS_WIDTH - 110);
			expect(state.enemySpawnTimer).toBe(0); // タイマーリセット
		});
	});
});
