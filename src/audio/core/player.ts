/**
 * Web Audio API を用いた基本的な音響生成エンジン
 */

/**
 * 汎用的なオシレーターを生成して音を鳴らす
 * @param ctx AudioContext
 * @param options 周波数、波形、長さ、音量、音程変化などの設定
 */
export const playOsc = (
	ctx: AudioContext,
	{
		freq,
		type = "sine",
		dur = 0.1,
		vol = 0.1,
		endFreq = null,
	}: {
		freq: number;
		type?: OscillatorType;
		dur?: number;
		vol?: number;
		endFreq?: number | null;
	},
) => {
	const now = ctx.currentTime;
	const o = ctx.createOscillator();
	const g = ctx.createGain();

	o.type = type;
	o.frequency.setValueAtTime(freq, now);
	if (endFreq !== null) {
		o.frequency.exponentialRampToValueAtTime(endFreq, now + dur);
	}

	g.gain.setValueAtTime(vol, now);
	g.gain.exponentialRampToValueAtTime(0.001, now + dur);

	o.connect(g);
	g.connect(ctx.destination);

	o.start(now);
	o.stop(now + dur);
};
