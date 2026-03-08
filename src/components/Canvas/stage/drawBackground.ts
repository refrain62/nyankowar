import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants/gameStats';

/**
 * ステージの背景（空、山、雲、地面）を描画する関数
 */
export const drawBackground = (ctx: CanvasRenderingContext2D, timestamp: number) => {
  // 1. 空のグラデーション
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  sky.addColorStop(0, '#85c1e9');
  sky.addColorStop(1, '#d6eaf8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2. 遠景（山）
  ctx.fillStyle = '#5dade2';
  ctx.beginPath(); ctx.moveTo(-50, CANVAS_HEIGHT - 50); ctx.lineTo(150, 100); ctx.lineTo(350, CANVAS_HEIGHT - 50); ctx.fill();
  ctx.fillStyle = '#3498db';
  ctx.beginPath(); ctx.moveTo(200, CANVAS_HEIGHT - 50); ctx.lineTo(450, 150); ctx.lineTo(700, CANVAS_HEIGHT - 50); ctx.fill();

  // 3. 雲（ゆっくり流れる）
  const cloudX = (timestamp / 100) % (CANVAS_WIDTH + 200) - 100;
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const drawSingleCloud = (cx: number, cy: number) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.arc(cx + 25, cy - 5, 25, 0, Math.PI * 2);
    ctx.arc(cx + 50, cy, 20, 0, Math.PI * 2);
    ctx.fill();
  };
  drawSingleCloud(cloudX, 50);
  drawSingleCloud(cloudX - 400, 80);

  // 4. 地面（芝生と土）
  ctx.fillStyle = '#229954'; // 芝生
  ctx.fillRect(0, CANVAS_HEIGHT - 55, CANVAS_WIDTH, 10);
  ctx.fillStyle = '#7d6608'; // 土
  ctx.fillRect(0, CANVAS_HEIGHT - 45, CANVAS_WIDTH, 45);
};
