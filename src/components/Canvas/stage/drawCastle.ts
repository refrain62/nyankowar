import { CANVAS_HEIGHT } from '../../../constants/gameStats';

/**
 * お城（拠点）を描画する関数
 */
export const drawCastle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseColor: string,
  flagColor: string
) => {
  ctx.save();
  
  // メインの塔
  ctx.fillStyle = baseColor;
  ctx.fillRect(x, CANVAS_HEIGHT - 150, 80, 100);
  
  // 門
  ctx.fillStyle = '#333';
  ctx.fillRect(x + 25, CANVAS_HEIGHT - 90, 30, 40);
  
  // 屋根
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.moveTo(x - 10, CANVAS_HEIGHT - 150);
  ctx.lineTo(x + 40, CANVAS_HEIGHT - 200);
  ctx.lineTo(x + 90, CANVAS_HEIGHT - 150);
  ctx.fill();
  
  // 旗竿
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 40, CANVAS_HEIGHT - 200);
  ctx.lineTo(x + 40, CANVAS_HEIGHT - 230);
  ctx.stroke();
  
  // なびく旗
  ctx.fillStyle = flagColor;
  ctx.fillRect(x + 40, CANVAS_HEIGHT - 230, 30, 20);
  
  ctx.restore();
};
