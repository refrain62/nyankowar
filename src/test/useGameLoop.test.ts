import { renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { describe, expect, it, vi } from "vitest";
import { STAGES } from "../constants/stages";
import type { GameAudio } from "../hooks/useGameAudio";
import { useGameLoop } from "../hooks/useGameLoop";
import type { GameState, StageConfig } from "../types/game";

describe("useGameLoop", () => {
	it("loopが呼び出され、requestAnimationFrameが実行されること", () => {
		const requestSpy = vi.spyOn(window, "requestAnimationFrame");
		const canvasRef = {
			current: document.createElement("canvas"),
		} as RefObject<HTMLCanvasElement>;
		const stateRef = {
			current: {
				gameState: "play",
				lastTime: 0,
				cooldowns: {},
			} as unknown as GameState,
		} as RefObject<GameState>;
		const audioRef = {
			current: {} as unknown as GameAudio,
		} as RefObject<GameAudio>;
		const stageRef = { current: STAGES[1] } as RefObject<StageConfig>;
		const setUi = vi.fn();

		renderHook(() =>
			useGameLoop(canvasRef, stateRef, audioRef, stageRef, setUi),
		);

		expect(requestSpy).toHaveBeenCalled();
		requestSpy.mockRestore();
	});

	it("アンマウント時にcancelAnimationFrameが呼び出されること", () => {
		const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
		const canvasRef = {
			current: document.createElement("canvas"),
		} as RefObject<HTMLCanvasElement>;
		const stateRef = {
			current: {
				gameState: "play",
				lastTime: 0,
				cooldowns: {},
			} as unknown as GameState,
		} as RefObject<GameState>;
		const audioRef = {
			current: {} as unknown as GameAudio,
		} as RefObject<GameAudio>;
		const stageRef = { current: STAGES[1] } as RefObject<StageConfig>;
		const setUi = vi.fn();

		const { unmount } = renderHook(() =>
			useGameLoop(canvasRef, stateRef, audioRef, stageRef, setUi),
		);

		unmount();
		expect(cancelSpy).toHaveBeenCalled();
		cancelSpy.mockRestore();
	});
});
