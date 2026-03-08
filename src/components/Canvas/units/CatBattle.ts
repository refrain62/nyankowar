import { type UnitStats } from '../../../types/game';

export const drawCatBattle = (ctx: CanvasRenderingContext2D, stats: UnitStats, timestamp: number) => {
  const walk = Math.sin(timestamp / 80) * 4;
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.ellipse(0, 15, stats.radius, 5, 0, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.fillStyle = stats.color; ctx.strokeStyle = '#333'; ctx.lineWidth = 2.5;
  
  // 足
  ctx.beginPath();
  ctx.rect(-10, 5, 5, 8 + walk); ctx.rect(5, 5, 5, 8 - walk);
  ctx.fill(); ctx.stroke();

  // 体
  ctx.beginPath(); ctx.arc(0, 0, stats.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  
  // 赤い耳
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.moveTo(-stats.radius * 0.6, -stats.radius * 0.5); ctx.lineTo(-stats.radius * 1.2, -stats.radius * 1.4); ctx.lineTo(-stats.radius * 0.2, -stats.radius * 1.0);
  ctx.moveTo(stats.radius * 0.6, -stats.radius * 0.5); ctx.lineTo(stats.radius * 1.2, -stats.radius * 1.4); ctx.lineTo(stats.radius * 0.2, -stats.radius * 1.0);
  ctx.fill(); ctx.stroke();
  
  // 目
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-stats.radius * 0.5, -5); ctx.lineTo(-stats.radius * 0.1, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(stats.radius * 0.5, -5); ctx.lineTo(stats.radius * 0.1, 0); ctx.stroke();
  
  // 斧
  ctx.save();
  ctx.translate(stats.radius * 0.8, 0);
  ctx.rotate(Math.sin(timestamp / 100) * 0.5);
  ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -30); ctx.stroke();
  const grad = ctx.createLinearGradient(0, -30, 20, -10);
  grad.addColorStop(0, '#bdc3c7'); grad.addColorStop(1, '#7f8c8d');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(25, -35, 20, -10); ctx.lineTo(0, -15); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.restore();
};
