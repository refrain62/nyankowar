import { playOsc } from "../core/player";

/**
 * 勝利ファンファーレ
 */
export const playVictory = (ctx: AudioContext) => {
	[523.25, 659.25, 783.99, 1046.5].forEach((f) => {
		playOsc(ctx, { freq: f, type: "square", dur: 0.4, vol: 0.05 });
	});
};

/**
 * 敗北ジングル
 */
export const playDefeat = (ctx: AudioContext) => {
	[261.63, 233.08, 207.65, 196.0].forEach((f) => {
		playOsc(ctx, { freq: f, type: "sawtooth", dur: 0.6, vol: 0.05 });
	});
};
