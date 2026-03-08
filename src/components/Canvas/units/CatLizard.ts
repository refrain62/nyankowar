import { type UnitStats } from '../../../types/game';

/**
 * ネコトカゲを描画する関数
 * 圧倒的な火炎放射（火炎の奔流）を実装
 */
export const drawCatLizard = (ctx: CanvasRenderingContext2D, stats: UnitStats, timestamp: number) => {
  const walk = Math.sin(timestamp / 80) * 3;
  
  // 攻撃アニメーションの計算
  const attackCycle = (timestamp % 2000) / 2000;
  const isFiring = attackCycle > 0.6 && attackCycle < 0.95;
  const firePower = isFiring ? Math.sin((attackCycle - 0.6) * Math.PI / 0.35) : 0;

  // 足元の影
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.ellipse(0, 15, stats.radius * 2, 6, 0, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2.5;
  ctx.fillStyle = stats.color;

  // 1. 足 (4本)
  ctx.beginPath();
  ctx.rect(-20, 5, 5, 8 + walk); ctx.rect(-5, 5, 5, 8 - walk);
  ctx.rect(10, 5, 5, 8 + walk); ctx.rect(25, 5, 5, 8 - walk);
  ctx.fill(); ctx.stroke();

  // 2. 尻尾
  const tailSwing = Math.sin(timestamp / 80) * 10;
  ctx.beginPath(); ctx.moveTo(-15, 0); ctx.quadraticCurveTo(-45, -35 + tailSwing, -70, 10 + tailSwing); ctx.stroke();

  // 3. 胴体
  ctx.beginPath(); ctx.ellipse(0, 5, stats.radius * 1.8, stats.radius * 0.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // 4. 背中のトゲ
  ctx.fillStyle = '#1e8449';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-15 + i * 15, -2); ctx.lineTo(-7 + i * 15, -18); ctx.lineTo(0 + i * 15, -2); ctx.fill(); ctx.stroke();
  }

  // 5. 頭部 (攻撃時にグイッと前に出る)
  ctx.save();
  ctx.translate(firePower * 15, -firePower * 5);
  ctx.fillStyle = stats.color;
  ctx.beginPath(); ctx.arc(stats.radius * 1.6, -8, stats.radius * 0.75, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  
  // 耳・目
  ctx.beginPath(); ctx.moveTo(stats.radius * 1.3, -14); ctx.lineTo(stats.radius * 1.0, -24); ctx.lineTo(stats.radius * 1.7, -18);
  ctx.moveTo(stats.radius * 1.9, -14); ctx.lineTo(stats.radius * 2.2, -24); ctx.lineTo(stats.radius * 1.5, -18);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(stats.radius * 1.9, -10, 2.5, 0, Math.PI * 2); ctx.fill();

  // 6. 圧倒的な火炎放射 (Fire Blast)
  if (isFiring) {
    const headX = stats.radius * 2.3;
    const headY = -8;
    const fireReach = firePower * 120; // 射程を伸ばす
    const flicker = Math.sin(timestamp / 20) * 5; // 激しい揺らぎ

    // 炎のベース (外側の赤いゆらめき)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(headX, headY);
    ctx.bezierCurveTo(headX + fireReach * 0.5, headY - 40 + flicker, headX + fireReach, headY - 20, headX + fireReach, headY);
    ctx.bezierCurveTo(headX + fireReach, headY + 20, headX + fireReach * 0.5, headY + 40 - flicker, headX, headY);
    ctx.fill();

    // 炎の芯 (中央のオレンジ〜黄色の高温部)
    const fireGrad = ctx.createLinearGradient(headX, headY, headX + fireReach, headY);
    fireGrad.addColorStop(0, '#f1c40f'); // 根元は黄色
    fireGrad.addColorStop(0.6, '#e67e22'); // 中間はオレンジ
    fireGrad.addColorStop(1, 'rgba(231, 76, 60, 0)'); // 先端は赤く消える
    
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.moveTo(headX, headY);
    ctx.quadraticCurveTo(headX + fireReach * 0.5, headY - 20, headX + fireReach * 0.8, headY);
    ctx.quadraticCurveTo(headX + fireReach * 0.5, headY + 20, headX, headY);
    ctx.fill();

    // 最中心部 (白い光)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(headX + 10, headY, 15 * firePower, 5 * firePower, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
};
