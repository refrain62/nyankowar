import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { STAGES } from "../constants/stages";
import { useGameController } from "../hooks/useGameController";
import type { GameState } from "../types/game";

describe("useGameController", () => {
	const mockAudio = {
		initAudio: vi.fn(),
		startBGM: vi.fn(),
		stopBGM: vi.fn(),
		playSystemSE: vi.fn(),
		playUpgradeSound: vi.fn(),
	} as any;

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
		const stateRef = { current: state };
		const setUi = vi.fn();
		const setCurrentStage = vi.fn();
		const currentStageRef = { current: STAGES[1] };

		const { result } = renderHook(() =>
			useGameController(
				stateRef as any,
				mockAudio,
				setUi,
				STAGES[1],
				setCurrentStage,
				currentStageRef as any,
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

	it("handleSpawn: 所持金が足りる場合のみユニットが召喚されること", () => {
		const { controller, state } = setup();
		state.money = 0; // 召喚できない
		controller.handleSpawn("BASIC");
		expect(state.allies.length).toBe(0);

		state.money = 500; // 召喚できる
		controller.handleSpawn("BASIC");
		expect(state.allies.length).toBe(1);
		expect(state.money).toBeLessThan(500);
	});

	it("handleUpgrade: 最大レベルに達するとアップグレードできないこと", () => {
		const { controller, state } = setup();
		state.walletLevel = 8;
		state.money = 10000;
		controller.handleUpgrade();
		expect(state.walletLevel).toBe(8);
		expect(mockAudio.playUpgradeSound).not.toHaveBeenCalled();
	});
});
