/**
 * Web Audio API を用いた基本的な音響生成エンジン。
 * 画像と同様、MP3等の音声ファイルを使わず、全ての音をコード上の周波数計算でリアルタイム合成します。
 */

/**
 * 汎用的なオシレーター（発振器）を生成して音を鳴らす関数。
 *
 * @param ctx AudioContext - ブラウザのオーディオ環境
 * @param options - 周波数、波形、長さ、音量、音程変化の設定
 */
export const playOsc = (
	ctx: AudioContext,
	{
		freq, // 開始周波数 (Hz)
		type = "sine", // 波形: sine(正弦波), square(矩形波), sawtooth(のこぎり波), triangle(三角波)
		dur = 0.1, // 持続時間 (秒)
		vol = 0.1, // 最大音量 (0.0 ~ 1.0)
		endFreq = null, // 終了時の周波数 (スウィープ音用)
	}: {
		freq: number;
		type?: OscillatorType;
		dur?: number;
		vol?: number;
		endFreq?: number | null;
	},
) => {
	const now = ctx.currentTime;
	const o = ctx.createOscillator(); // 音を作る発振器
	const g = ctx.createGain(); // 音量を調節するアンプ

	o.type = type;
	o.frequency.setValueAtTime(freq, now);

	// 音程の変化（スウィープ）の設定
	// 例: 100Hz -> 10Hz と下げることで「ドスッ」という衝撃音を作る
	if (endFreq !== null) {
		o.frequency.exponentialRampToValueAtTime(endFreq, now + dur);
	}

	// 音量の減衰（エンベロープ）の設定
	// 鳴り始めを vol にし、終了時に 0.001 へ指数関数的に下げることで自然な消え方にする
	g.gain.setValueAtTime(vol, now);
	g.gain.exponentialRampToValueAtTime(0.001, now + dur);

	// 接続: 発振器 -> 音量調節 -> スピーカー
	o.connect(g);
	g.connect(ctx.destination);

	o.start(now);
	o.stop(now + dur);
};
