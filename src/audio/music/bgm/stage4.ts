import { playOsc } from "../../core/player";

/**
 * 第4章: 月面拠点
 * 高音の揺らぎとディレイによる宇宙的・無機質なアンビエント。
 * 高周波数帯域の正弦波（sine）を多用。
 */
export const playStage4 = (ctx: AudioContext, step: number) => {
	// 超高音域のキラキラした音階 (C6, G6, E6, C7)
	const notes = [1046.5, 1567.98, 1318.51, 2093.0]; 
	
	// 音程に微細なビブラート（揺らぎ）を加えて、浮遊感を出す
	const freq = notes[step % 4] + Math.sin(step) * 20; 

	// 1. メイン音 (長く残るクリスタルな響き)
	playOsc(ctx, { 
		freq, 
		type: "sine", 
		dur: 1.0, 
		vol: 0.03 
	});

	// 2. 擬似ディレイ（残響）
	// 約600ms後にオクターブ下の音を小さく鳴らすことで、エコー効果を表現
	setTimeout(() => {
		playOsc(ctx, { 
			freq: freq * 0.5, 
			type: "sine", 
			dur: 0.5, 
			vol: 0.01 
		});
	}, 600);
};
