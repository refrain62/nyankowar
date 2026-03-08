import { type UnitStats } from '../../../types/game';

/**
 * ネコフィッシュを描画する関数
 * 魚の体からネコの手足が生え、顔だけがネコのデザイン
 */
export const drawCatFish = (ctx: CanvasRenderingContext2D, stats: UnitStats, timestamp: number) => {
  // アニメーション
  const wave = Math.sin(timestamp / 100) * 5;
  const walk = Math.sin(timestamp / 80) * 4;

  // 足元の影
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.ellipse(0, 15, stats.radius * 1.8, 5, 0, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2.5;
  ctx.fillStyle = stats.color; // 薄いピンク・赤系

  // 1. 魚の胴体
  ctx.beginPath();
  ctx.ellipse(0, 0, stats.radius * 1.6, stats.radius, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // 2. 尾びれ (揺れる)
  ctx.save();
  ctx.translate(-stats.radius * 1.6, 0);
  ctx.rotate(wave * 0.05);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-stats.radius * 0.8, -15);
  ctx.lineTo(-stats.radius * 0.5, 0);
  ctx.lineTo(-stats.radius * 0.8, 15);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();

  // 3. 背びれ
  ctx.beginPath();
  ctx.moveTo(0, -stats.radius);
  ctx.lineTo(-15, -stats.radius - 12);
  ctx.lineTo(10, -stats.radius - 5);
  ctx.fill(); ctx.stroke();

  // 4. ネコの手足 (魚の腹から生やす)
  ctx.beginPath();
  // 前足
  ctx.rect(stats.radius * 0.3, stats.radius * 0.5, 6, 8 + walk);
  // 後ろ足
  ctx.rect(-stats.radius * 0.8, stats.radius * 0.5, 6, 8 - walk);
  ctx.fill(); ctx.stroke();

  // 5. ネコ顔 (正面を向いて魚の先端に配置)
  ctx.save();
  ctx.translate(stats.radius * 1.2, -stats.radius * 0.2);
  
  // 顔の輪郭
  ctx.fillStyle = stats.color;
  ctx.beginPath(); ctx.arc(0, 0, stats.radius * 0.75, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  
  // 耳
  ctx.beginPath();
  ctx.moveTo(-stats.radius * 0.4, -stats.radius * 0.4); ctx.lineTo(-stats.radius * 0.7, -stats.radius * 0.9); ctx.lineTo(-stats.radius * 0.1, -stats.radius * 0.7);
  ctx.moveTo(stats.radius * 0.4, -stats.radius * 0.4); ctx.lineTo(stats.radius * 0.7, -stats.radius * 0.9); ctx.lineTo(stats.radius * 0.1, -stats.radius * 0.7);
  ctx.fill(); ctx.stroke();

  // 目
  ctx.fillStyle = '#333';
  ctx.fillRect(-5, -2, 3, 6); ctx.fillRect(2, -2, 3, 6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-5, -1, 1, 2); ctx.fillRect(2, -1, 1, 2);
  
  ctx.restore();

  ctx.restore();
};
