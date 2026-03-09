import { playOsc } from "../core/player";

/**
 * 召喚音 (ピコッ)
 */
export const playSpawn = (ctx: AudioContext) => {
	playOsc(ctx, { freq: 660, type: "sine", dur: 0.1, vol: 0.05 });
};

/**
 * 生産完了音 (チャリン！)
 */
export const playCharin = (ctx: AudioContext) => {
	playOsc(ctx, { freq: 2000, type: "sine", dur: 0.2, vol: 0.1, endFreq: 1500 });
};

/**
 * アップグレード音
 */
export const playUpgrade = (ctx: AudioContext) => {
	playOsc(ctx, { freq: 330, type: "square", dur: 0.1, vol: 0.05 });
};
