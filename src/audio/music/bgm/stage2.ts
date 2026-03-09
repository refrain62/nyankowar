import { playOsc } from "../../core/player";

/**
 * 第2章: 夕暮れの平原
 * ゆったりとした時間の流れを感じさせる、哀愁漂うアンビエント。
 * 正弦波（sine）の柔らかな響きを活用。
 */
export const playStage2 = (ctx: AudioContext, step: number) => {
	// テンポを遅くするため、2拍に1回だけ音を生成
	if (step % 2 !== 0) return;

	// マイナーコードの構成音 (A3, C4, E4, D4)
	const notes = [220.0, 261.63, 329.63, 293.66]; 
	
	playOsc(ctx, {
		freq: notes[(step / 2) % 4],
		type: "sine",
		dur: 0.7, // 長く持続させ、空間の広がりを表現
		vol: 0.06,
	});
};
