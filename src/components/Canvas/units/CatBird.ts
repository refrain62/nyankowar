import { type UnitStats } from '../../../types/game';

export const drawCatBird = (ctx: CanvasRenderingContext2D, stats: UnitStats, timestamp: number) => {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.beginPath(); ctx.ellipse(0, 40, stats.radius, 4, 0, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.fillStyle = stats.color; ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
  
  // ぶら下がった足
  const legDangle = Math.sin(timestamp / 100) * 3;
  ctx.beginPath();
  ctx.moveTo(-5, -10); ctx.lineTo(-8, 5 + legDangle);
  ctx.moveTo(5, -10); ctx.lineTo(8, 5 - legDangle);
  ctx.stroke();

  // 空飛ぶ体
  ctx.beginPath(); ctx.ellipse(0, -20, stats.radius * 1.2, stats.radius * 0.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  
  // くちばし
  ctx.fillStyle = '#f1c40f';
  ctx.beginPath(); ctx.moveTo(stats.radius, -22); ctx.lineTo(stats.radius + 18, -18); ctx.lineTo(stats.radius, -14); ctx.fill(); ctx.stroke();
  
  // 羽
  ctx.fillStyle = stats.color;
  const wingSwing = Math.sin(timestamp / 40) * 25;
  ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(-25, -20 + wingSwing); ctx.lineTo(-15, -45 + wingSwing); ctx.closePath(); ctx.fill(); ctx.stroke();

  // 目
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(stats.radius * 0.5, -22, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
