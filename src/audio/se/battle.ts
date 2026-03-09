import { playOsc } from "../core/player";

/**
 * 戦闘に関連する効果音（SE）の定義。
 * 複数の異なる波形を重ねる（レイヤリング）ことで、複雑な質感を表現しています。
 */

/**
 * 打撃音 (ガシッ！)
 */
export const playGashi = (ctx: AudioContext) => {
	const now = ctx.currentTime;
	// レイヤー1: 低音の衝撃（矩形波で「重み」を出す）
	playOsc(ctx, { freq: 150, type: "square", dur: 0.1, vol: 0.08, endFreq: 40 });

	// レイヤー2: 高音のノイズ成分（のこぎり波で「鋭さ」を出す）
	const o = ctx.createOscillator();
	const g = ctx.createGain();
	o.type = "sawtooth";
	o.frequency.setValueAtTime(800, now);
	g.gain.setValueAtTime(0.05, now);
	// 非常に短い時間で減衰させて「アタック感」のみを抽出
	g.gain.linearRampToValueAtTime(0, now + 0.04);

	o.connect(g);
	g.connect(ctx.destination);
	o.start(now);
	o.stop(now + 0.04);
};

/**
 * にゃんこ砲：エネルギー充填音
 * ピッチが低域から高域へ急激にスウィープする電子音。
 */
export const playCannonCharge = (ctx: AudioContext) => {
	playOsc(ctx, {
		freq: 100,
		type: "sawtooth", // 豊かな倍音を含む波形
		dur: 0.5,
		vol: 0.1,
		endFreq: 1200, // 高音へ駆け上がる
	});
};

/**
 * にゃんこ砲：発射・爆発音
 * 超低域のスウィープとノイズを組み合わせた大音響。
 */
export const playCannonExplosion = (ctx: AudioContext) => {
	// レイヤー1: 腹に響く重低音
	playOsc(ctx, { freq: 80, type: "square", dur: 1.5, vol: 0.2, endFreq: 10 });

	// レイヤー2: 爆発の瞬間的な閃光感（鋭い高音ノイズ）
	playOsc(ctx, {
		freq: 400,
		type: "sawtooth",
		dur: 0.2,
		vol: 0.1,
		endFreq: 50,
	});
};
