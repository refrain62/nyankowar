import { CANVAS_HEIGHT } from '../../../types/game';

/**
 * 拠点の城を描画する関数
 */
export const drawCastle = (ctx: CanvasRenderingContext2D, x: number, bodyColor: string, flagColor: string) => {
  const groundY = CANVAS_HEIGHT - 55; // 地面の高さに合わせる

  ctx.save();
  ctx.translate(x, groundY);

  // 1. 土台
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(0, -80, 80, 80, [10, 10, 0, 0]);
  ctx.fill(); ctx.stroke();

  // 2. 屋上の凸凹
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(5 + i * 25, -95, 15, 15);
    ctx.strokeRect(5 + i * 25, -95, 15, 15);
  }

  // 3. 門
  ctx.fillStyle = '#2c3e50';
  ctx.beginPath();
  ctx.roundRect(20, -40, 40, 40, [20, 20, 0, 0]);
  ctx.fill();

  // 4. 旗
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, -80); ctx.lineTo(10, -130);
  ctx.stroke();
  
  ctx.fillStyle = flagColor;
  ctx.beginPath();
  ctx.moveTo(10, -130); ctx.lineTo(40, -120); ctx.lineTo(10, -110);
  ctx.fill(); ctx.stroke();

  ctx.restore();
};
