import { playOsc } from "../../core/player";

/**
 * 第1章: 昼の草原
 * 明るく軽快な8bit風サウンド。
 * 三角波（triangle）を使用し、ファミコンのメロディラインのような温かみのある質感を表現。
 */
export const playStage1 = (ctx: AudioContext, step: number) => {
	// 基本的なメジャーコード (C, E, G, F) のアルペジオ
	const notes = [261.63, 329.63, 392.0, 349.23];

	playOsc(ctx, {
		freq: notes[step % 4], // ステップごとに音階を循環
		type: "triangle",
		dur: 0.35, // 少し長めの余韻
		vol: 0.04, // BGMとして邪魔にならない控えめな音量
	});
};
