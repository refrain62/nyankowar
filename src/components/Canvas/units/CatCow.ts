import { type UnitStats } from '../../../types/game';

/**
 * ウシねこを描画する関数
 * 横向きの牛の体に、正面を向いたネコ顔が乗っているデザイン
 */
export const drawCatCow = (ctx: CanvasRenderingContext2D, stats: UnitStats, timestamp: number) => {
  // 足の動きアニメーション
  const walkCycle = Math.sin(timestamp / 80) * 5;

  // 足元の影
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.ellipse(0, 15, stats.radius * 1.8, 6, 0, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2.5;
  ctx.fillStyle = stats.color;

  // 1. 牛の胴体 (横に長い楕円)
  ctx.beginPath();
  ctx.ellipse(-5, 0, stats.radius * 1.5, stats.radius * 0.9, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // 2. 四本足
  ctx.beginPath();
  // 後ろ足
  ctx.rect(-stats.radius * 1.2, 5, 6, 10 + walkCycle); 
  ctx.rect(-stats.radius * 0.8, 5, 6, 10 - walkCycle);
  // 前足
  ctx.rect(stats.radius * 0.2, 5, 6, 10 + walkCycle);
  ctx.rect(stats.radius * 0.6, 5, 6, 10 - walkCycle);
  ctx.fill(); ctx.stroke();

  // 3. 尻尾
  ctx.beginPath();
  ctx.moveTo(-stats.radius * 1.5, -5);
  ctx.quadraticCurveTo(-stats.radius * 2.0, -15, -stats.radius * 1.8, 5);
  ctx.stroke();

  // 4. 牛柄
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(-15, -5, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, 2, 5, 0, Math.PI * 2); ctx.fill();

  // 5. ネコ顔 (正面を向いて胴体の先に乗っている)
  ctx.save();
  ctx.translate(stats.radius * 1.2, -stats.radius * 0.5); // 胴体の右上に配置
  
  // 顔の輪郭
  ctx.fillStyle = stats.color;
  ctx.beginPath(); ctx.arc(0, 0, stats.radius * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  
  // 角 (牛の象徴)
  const hornGrad = ctx.createLinearGradient(0, -5, 0, -15);
  hornGrad.addColorStop(0, '#f1c40f'); hornGrad.addColorStop(1, '#f39c12');
  ctx.fillStyle = hornGrad;
  ctx.beginPath(); ctx.moveTo(-8, -5); ctx.lineTo(-12, -18); ctx.lineTo(-4, -8); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -5); ctx.lineTo(12, -18); ctx.lineTo(4, -8); ctx.fill(); ctx.stroke();

  // ネコ目 (いつもの表情)
  ctx.fillStyle = '#333';
  ctx.fillRect(-6, -2, 3, 6); ctx.fillRect(2, -2, 3, 6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-6, -1, 1, 2); ctx.fillRect(2, -1, 1, 2);
  
  ctx.restore();

  ctx.restore();
};
