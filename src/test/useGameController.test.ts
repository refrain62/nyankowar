import { renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { describe, expect, it, vi } from "vitest";
import { STAGES } from "../constants/stages";
import { UNIT_TYPES } from "../constants/units";
import type { GameAudio } from "../hooks/useGameAudio";
import { useGameController } from "../hooks/useGameController";
import type { GameState, StageConfig } from "../types/game";

describe("useGameController", () => {
	// GameAudio の全メソッドをモック化し、型安全性を確保
	const mockAudio = {
		isAudioEnabled: true,
		setIsAudioEnabled: vi.fn(),
		initAudio: vi.fn(),
		startBGM: vi.fn(),
		stopBGM: vi.fn(),
		pauseBGM: vi.fn(),
		resumeBGM: vi.fn(),
		playSystemSE: vi.fn(),
		playCharinSound: vi.fn(),
		playUpgradeSound: vi.fn(),
		playGashiSound: vi.fn(),
		playCannonChargeSound: vi.fn(),
		playCannonExplosionSound: vi.fn(),
		playVictoryFanfare: vi.fn(),
		playDefeatJingle: vi.fn(),
	} as unknown as GameAudio;

	const createInitialState = (): GameState => ({
		money: 500,
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
		cooldowns: { BASIC: 0 },
		lastTime: 0,
		lastAttackSoundTime: 0,
		gameState: "start",
	});

	const setup = () => {
		const state = createInitialState();
		const stateRef = { current: state } as RefObject<GameState>;
		const setUi = vi.fn();
		const setCurrentStage = vi.fn();
		const currentStageRef = { current: STAGES[1] } as RefObject<StageConfig>;

		const { result } = renderHook(() =>
			useGameController(
				stateRef,
				mockAudio,
				setUi,
				STAGES[1],
				setCurrentStage,
				currentStageRef,
			),
		);

		return { controller: result.current, state, setUi, setCurrentStage };
	};

	it("startGame: ステージを開始すると状態がリセットされ、BGMが再生されること", () => {
		const { controller, state } = setup();
		const stage = STAGES[2];
		controller.startGame(stage);

		expect(state.gameState).toBe("play");
		expect(state.baseHp).toBe(stage.baseHp);
		expect(mockAudio.startBGM).toHaveBeenCalledWith(stage.id);
	});

	it("handleSpawn: クールダウン中(1ms以上)はユニットを召喚できないこと", () => {
		const { controller, state } = setup();
		state.money = 1000;
		state.cooldowns.BASIC = 1; // わずかにクールダウン中
		controller.handleSpawn("BASIC");
		expect(state.allies.length).toBe(0);
	});

	it("handleUpgrade: レベル1から2へのアップグレードで、正確に200円消費され、レベルが2になること", () => {
		const { controller, state } = setup();
		state.money = 500;
		state.walletLevel = 1;
		controller.handleUpgrade();
		expect(state.walletLevel).toBe(2);
		expect(state.money).toBe(300); // 500 - (1 * 200) = 300
	});

	it("handleSpawn: 所持金が足りない場合(コスト未満)、ユニットを召喚できないこと", () => {
		const { controller, state } = setup();
		const cost = 50; // BASICのコスト
		state.money = cost - 1; // 49円
		state.cooldowns.BASIC = 0;
		controller.handleSpawn("BASIC");
		expect(state.allies.length).toBe(0);
		expect(state.money).toBe(49);
	});

	it("handleUpgrade: レベル上限(8)に達している場合、アップグレードが実行されないこと", () => {
		const { controller, state } = setup();
		state.walletLevel = 8;
		state.money = 2000;
		controller.handleUpgrade();
		expect(state.walletLevel).toBe(8);
		expect(state.money).toBe(2000); // 減少していない
	});

	it("handleCannon: 500ms後に敵HPが150減少し、120pxノックバックし、200ms後に発射フラグがリセットされること", () => {
		vi.useFakeTimers();
		const { controller, state } = setup();
		state.cannonCharge = 100;
		state.enemies = [
			{
				id: 1,
				x: 500,
				y: 0,
				type: "enemy",
				unitType: "ENEMY",
				/* 
				   型安全性の確保: anyを排除し、UNIT_TYPES.ENEMYをベースにテストに必要なHP(200)を上書き。
				   期待値検証において、キャノン砲のダメージ150を差し引いた後のHPが正確に50であることを確認するため。
				*/
				stats: { ...UNIT_TYPES.ENEMY, hp: 200 },
				currentHp: 200,
			},
		];

		controller.handleCannon();
		expect(state.isCannonCharging).toBe(true);

		// 500ms 進める (発射!)
		vi.advanceTimersByTime(500);
		expect(state.isCannonCharging).toBe(false);
		expect(state.isCannonFiring).toBe(true);
		expect(state.enemies[0].currentHp).toBe(50); // 200 - 150
		expect(state.enemies[0].x).toBe(620); // 500 + 120 (ノックバック)

		// さらに 200ms 進める (発射エフェクト終了)
		vi.advanceTimersByTime(200);
		expect(state.isCannonFiring).toBe(false);

		vi.useRealTimers();
	});
});
