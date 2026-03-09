import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useGameAudio } from "../hooks/useGameAudio";

/**
 * 【責任】オーディオ制御フックのテスト。
 * Web Audio APIのモックを通じて、音響ライフサイクルの健全性を検証します。
 */
describe("useGameAudio", () => {
	it("setIsAudioEnabled: 音声の有効/無効を切り替えられること", () => {
		const { result } = renderHook(() => useGameAudio());

		expect(result.current.isAudioEnabled).toBe(true);

		act(() => {
			result.current.setIsAudioEnabled(false);
		});

		expect(result.current.isAudioEnabled).toBe(false);
	});

	it("startBGM: BGMを開始するとタイマーがセットされること", () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useGameAudio());

		act(() => {
			result.current.startBGM(1);
		});

		// 内部的な setTimeout によるループ開始を確認
		expect(vi.getTimerCount()).toBeGreaterThan(0);

		vi.useRealTimers();
	});
});
