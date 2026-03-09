import { playOsc } from "../../core/player";

/**
 * 第2章: 夕暮れの平原
 * ゆったりとしたサイン波の哀愁漂うメロディ
 */
export const playStage2 = (ctx: AudioContext, step: number) => {
	// 2拍に1回だけ鳴らす
	if (step % 2 !== 0) return;
	const notes = [220.0, 261.63, 329.63, 293.66]; // A3, C4, E4, D4
	playOsc(ctx, {
		freq: notes[(step / 2) % 4],
		type: "sine",
		dur: 0.7,
		vol: 0.06,
	});
};
