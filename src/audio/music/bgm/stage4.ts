import { playOsc } from '../../core/player';

/**
 * 第4章: 月面拠点
 * 高音の揺らぎとエコーによる宇宙的アンビエント
 */
export const playStage4 = (ctx: AudioContext, step: number) => {
  const notes = [1046.50, 1567.98, 1318.51, 2093.00]; // C6, G6, E6, C7
  const freq = notes[step % 4] + Math.sin(step) * 20; // 微細な揺らぎ
  
  // メイン音
  playOsc(ctx, { freq, type: 'sine', dur: 1.0, vol: 0.03 });
  
  // 残響
  setTimeout(() => {
    playOsc(ctx, { freq: freq * 0.5, type: 'sine', dur: 0.5, vol: 0.01 });
  }, 600);
};
