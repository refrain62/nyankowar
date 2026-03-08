import { playOsc } from '../../core/player';

export const playStage2 = (ctx: AudioContext, step: number) => {
  // 2ステップに1回だけ鳴らすことでゆったりさせる
  if (step % 2 !== 0) return;
  const notes = [220.00, 261.63, 196.00, 220.00]; // A3, C4, G3, A3
  playOsc(ctx, { freq: notes[(step / 2) % 4], type: 'sine', dur: 0.8, vol: 0.06 });
};
