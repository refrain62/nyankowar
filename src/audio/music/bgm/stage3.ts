import { playOsc } from '../../core/player';

export const playStage3 = (ctx: AudioContext, step: number) => {
  // 1ステップで2回鳴らす (高速化)
  const notes = [130.81, 146.83, 164.81, 130.81]; // C3, D3, E3, C3 (重低音)
  playOsc(ctx, { freq: notes[step % 4], type: 'square', dur: 0.15, vol: 0.07 });
  
  // 裏打ちのハイハット的な音
  setTimeout(() => {
    playOsc(ctx, { freq: 4000, type: 'sine', dur: 0.02, vol: 0.02 });
  }, 200);
};
