import { playOsc } from '../core/player';

/**
 * 打撃音 (ガシッ！)
 */
export const playGashi = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  // 低音の衝撃
  playOsc(ctx, { freq: 150, type: 'square', dur: 0.1, vol: 0.08, endFreq: 40 });
  // アタック音 (ノイズ風)
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(800, now);
  g.gain.setValueAtTime(0.05, now); g.gain.linearRampToValueAtTime(0, now + 0.04);
  o.connect(g); g.connect(ctx.destination);
  o.start(now); o.stop(now + 0.04);
};

/**
 * にゃんこ砲発射音
 */
export const playCannon = (ctx: AudioContext) => {
  // ウィィィンという充填
  playOsc(ctx, { freq: 100, type: 'sawtooth', dur: 0.5, vol: 0.1, endFreq: 800 });
  // ドォォォンという爆発
  playOsc(ctx, { freq: 60, type: 'square', dur: 1.5, vol: 0.2, endFreq: 10 });
};
