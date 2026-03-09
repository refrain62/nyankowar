import { playOsc } from "../core/player";

/**
 * システム・UIに関連する効果音（SE）の定義。
 * ユーザー操作のフィードバックとして、不快感のない柔らかな音（正弦波）を主体に構成しています。
 */

/**
 * 召喚音 (ピコッ)
 * シンプルな正弦波（sine）によるフィードバック。
 */
export const playSpawn = (ctx: AudioContext) => {
	playOsc(ctx, { freq: 660, type: "sine", dur: 0.1, vol: 0.05 });
};

/**
 * 生産完了音 (チャリン！)
 * 高い周波数からわずかにピッチを落とすことで、コインのような金属感を演出。
 */
export const playCharin = (ctx: AudioContext) => {
	playOsc(ctx, { freq: 2000, type: "sine", dur: 0.2, vol: 0.1, endFreq: 1500 });
};

/**
 * アップグレード音
 * 矩形波（square）を短く鳴らすことで、ファミコン風のレトロなレベルアップ感を表現。
 */
export const playUpgrade = (ctx: AudioContext) => {
	playOsc(ctx, { freq: 330, type: "square", dur: 0.1, vol: 0.05 });
};
