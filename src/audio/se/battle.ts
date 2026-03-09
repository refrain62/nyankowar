import { playOsc } from "../core/player";

/**
 * 打撃音 (ガシッ！)
 */
export const playGashi = (ctx: AudioContext) => {
	const now = ctx.currentTime;
	playOsc(ctx, { freq: 150, type: "square", dur: 0.1, vol: 0.08, endFreq: 40 });
	const o = ctx.createOscillator();
	const g = ctx.createGain();
	o.type = "sawtooth";
	o.frequency.setValueAtTime(800, now);
	g.gain.setValueAtTime(0.05, now);
	g.gain.linearRampToValueAtTime(0, now + 0.04);
	o.connect(g);
	g.connect(ctx.destination);
	o.start(now);
	o.stop(now + 0.04);
};

/**
 * にゃんこ砲：エネルギー充填音
 * ピッチが急上昇する電子音
 */
export const playCannonCharge = (ctx: AudioContext) => {
	playOsc(ctx, {
		freq: 100,
		type: "sawtooth",
		dur: 0.5,
		vol: 0.1,
		endFreq: 1200,
	});
};

/**
 * にゃんこ砲：発射・爆発音
 * 低音の響く爆発
 */
export const playCannonExplosion = (ctx: AudioContext) => {
	playOsc(ctx, { freq: 80, type: "square", dur: 1.5, vol: 0.2, endFreq: 10 });
	// 高音のノイズを混ぜて鋭さを出す
	playOsc(ctx, {
		freq: 400,
		type: "sawtooth",
		dur: 0.2,
		vol: 0.1,
		endFreq: 50,
	});
};
