import "@testing-library/jest-dom";
import { vi } from "vitest";

// Canvas API のモック
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
	clearRect: vi.fn(),
	fillRect: vi.fn(),
	beginPath: vi.fn(),
	moveTo: vi.fn(),
	lineTo: vi.fn(),
	stroke: vi.fn(),
	fill: vi.fn(),
	arc: vi.fn(),
	save: vi.fn(),
	restore: vi.fn(),
	translate: vi.fn(),
	scale: vi.fn(),
	createLinearGradient: vi.fn().mockReturnValue({
		addColorStop: vi.fn(),
	}),
	roundRect: vi.fn(),
	fillText: vi.fn(),
});

// AudioContext のモック
function MockAudioContext() {
	return {
		state: "suspended",
		currentTime: 0,
		resume: vi.fn().mockResolvedValue(undefined),
		createOscillator: vi.fn().mockReturnValue({
			type: "",
			frequency: { setValueAtTime: vi.fn() },
			connect: vi.fn(),
			start: vi.fn(),
			stop: vi.fn(),
		}),
		createGain: vi.fn().mockReturnValue({
			gain: {
				setValueAtTime: vi.fn(),
				exponentialRampToValueAtTime: vi.fn(),
			},
			connect: vi.fn(),
		}),
		destination: {},
	};
}

const AudioContextSpy = vi.fn().mockImplementation(MockAudioContext);

// window オブジェクトに AudioContext を登録
Object.defineProperty(window, "AudioContext", {
	value: AudioContextSpy,
	writable: true,
});

// global 空間にも必要であれば登録
Object.defineProperty(globalThis, "AudioContext", {
	value: AudioContextSpy,
	writable: true,
});
