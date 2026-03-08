import { playOsc } from '../../core/player';

/**
 * 第1章: 昼の草原
 * 明るい三角波のピコピコサウンド
 */
export const playStage1 = (ctx: AudioContext, step: number) => {
  const notes = [261.63, 329.63, 392.00, 349.23]; // C, E, G, F
  playOsc(ctx, { freq: notes[step % 4], type: 'triangle', dur: 0.35, vol: 0.04 });
};
