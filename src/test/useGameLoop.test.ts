import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { STAGES } from "../constants/stages";
import { useGameLoop } from "../hooks/useGameLoop";

describe("useGameLoop", () => {
	it("loopが呼び出され、requestAnimationFrameが実行されること", () => {
		const requestSpy = vi.spyOn(window, "requestAnimationFrame");
		const canvasRef = { current: document.createElement("canvas") };
		const stateRef = { current: { gameState: "play", lastTime: 0, cooldowns: {} } };
		const audioRef = { current: {} };
		const stageRef = { current: STAGES[1] };
		const setUi = vi.fn();

		renderHook(() =>
			useGameLoop(
				canvasRef as any,
				stateRef as any,
				audioRef as any,
				stageRef as any,
				setUi,
			),
		);

		expect(requestSpy).toHaveBeenCalled();
		requestSpy.mockRestore();
	});

	it("アンマウント時にcancelAnimationFrameが呼び出されること", () => {
		const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
		const canvasRef = { current: document.createElement("canvas") };
		const stateRef = { current: { gameState: "play", lastTime: 0, cooldowns: {} } };
		const audioRef = { current: {} };
		const stageRef = { current: STAGES[1] };
		const setUi = vi.fn();

		const { unmount } = renderHook(() =>
			useGameLoop(
				canvasRef as any,
				stateRef as any,
				audioRef as any,
				stageRef as any,
				setUi,
			),
		);

		unmount();
		expect(cancelSpy).toHaveBeenCalled();
		cancelSpy.mockRestore();
	});
});
