import { playOsc } from '../../core/player';

export const playStage4 = (ctx: AudioContext, step: number) => {
  // 不規則なリズムに見えるように設定
  const notes = [1046.50, 1567.98, 1318.51, 2093.00]; // C6, G6, E6, C7
  const freq = notes[step % 4] + Math.sin(step) * 50; // 音程を揺らす
  
  playOsc(ctx, { freq, type: 'sine', dur: 1.2, vol: 0.04 });
  
  // 遠くで鳴るエコー
  setTimeout(() => {
    playOsc(ctx, { freq: freq * 0.5, type: 'sine', dur: 0.5, vol: 0.01 });
  }, 600);
};
