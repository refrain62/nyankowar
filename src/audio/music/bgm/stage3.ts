import { playOsc } from "../../core/player";

/**
 * 第3章: 深夜の森
 * 緊張感のある低音ベースと、静寂を破るリズム。
 * 矩形波（square）による太いベースサウンドが特徴。
 */
export const playStage3 = (ctx: AudioContext, step: number) => {
	// 重厚なベースライン (C3, D3, Eb3, C3)
	const notes = [130.81, 146.83, 155.56, 130.81];

	// 1. メインの重低音ベース
	playOsc(ctx, {
		freq: notes[step % 4],
		type: "square",
		dur: 0.15, // 短く切って「刻み」を表現
		vol: 0.05,
	});

	// 2. 裏拍のハイハット風エフェクト
	// setTimeout を使って 200ms 後（半拍後）に高域を鳴らす
	setTimeout(() => {
		playOsc(ctx, {
			freq: notes[step % 4] * 2, // オクターブ上の音
			type: "sine",
			dur: 0.05,
			vol: 0.02,
		});
	}, 200);
};
