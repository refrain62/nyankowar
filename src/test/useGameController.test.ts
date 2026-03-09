import { renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { describe, expect, it, vi } from "vitest";
import { STAGES } from "../constants/stages";
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

	it("handleCannon: チャージが100%の時のみ発動し、直後に isCannonCharging が true になること", () => {
		const { controller, state } = setup();

		// チャージ不足 (99%)
		state.cannonCharge = 99;
		controller.handleCannon();
		expect(state.isCannonCharging).toBe(false);

		// チャージ完了 (100%)
		state.cannonCharge = 100;
		controller.handleCannon();
		expect(state.isCannonCharging).toBe(true); // 充填開始
		expect(state.isCannonFiring).toBe(false); // まだ発射されていない
		expect(state.cannonCharge).toBe(0); // 数値はリセット
	});
});
