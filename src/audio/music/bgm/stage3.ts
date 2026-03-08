import { playOsc } from '../../core/player';

/**
 * 第3章: 深夜の森
 * スクエア波のベース音とハイハット風SE
 */
export const playStage3 = (ctx: AudioContext, step: number) => {
  const notes = [130.81, 146.83, 155.56, 130.81]; // C3, D3, Eb3, C3
  // 重低音ベース
  playOsc(ctx, { freq: notes[step % 4], type: 'square', dur: 0.15, vol: 0.05 });
  
  // 裏拍のノイズ風リズム
  setTimeout(() => {
    playOsc(ctx, { freq: notes[step % 4] * 2, type: 'sine', dur: 0.05, vol: 0.02 });
  }, 200);
};
