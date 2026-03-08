import { type Unit, CANVAS_WIDTH, CANVAS_HEIGHT, type StageConfig } from '../../types/game';
import { drawBackground } from './stage/drawBackground';
import { drawCastle } from './stage/drawCastle';

// ユニット描画
import { drawCatBasic } from './units/CatBasic';
import { drawCatTank } from './units/CatTank';
import { drawCatBattle } from './units/CatBattle';
import { drawCatLegs } from './units/CatLegs';
import { drawCatCow } from './units/CatCow';
import { drawCatBird } from './units/CatBird';
import { drawCatFish } from './units/CatFish';
import { drawCatLizard } from './units/CatLizard';
import { drawDogEnemy } from './units/DogEnemy';
import { drawEnemyHippo } from './units/EnemyHippo';
import { drawEnemySnake } from './units/EnemySnake';
import { drawEnemyBear } from './units/EnemyBear';

/**
 * ゲーム全体のメイン描画関数
 */
export const drawGame = (ctx: CanvasRenderingContext2D, s: any, stage: StageConfig, timestamp: number) => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (s.gameState === 'title') { drawTitleBackground(ctx, timestamp); return; }

  drawBackground(ctx, stage, timestamp);
  drawCastle(ctx, 40, '#d5dbdb', '#3498db');
  drawCastle(ctx, CANVAS_WIDTH - 120, '#566573', '#e74c3c');
  drawHpBars(ctx, s.baseHp, s.enemyBaseHp, stage);

  s.units.forEach((u: Unit) => {
    const bob = Math.sin(timestamp / 50) * 5;
    const curY = u.y + bob;
    ctx.save(); ctx.translate(u.x, curY);
    if (u.type === 'enemy') ctx.scale(-1, 1);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2;

    switch (u.unitType) {
      case 'BASIC': drawCatBasic(ctx, u.stats, timestamp); break;
      case 'TANK':  drawCatTank(ctx, u.stats, timestamp); break;
      case 'BATTLE': drawCatBattle(ctx, u.stats, timestamp); break;
      case 'LEGS':  drawCatLegs(ctx, u.stats, timestamp); break;
      case 'COW':   drawCatCow(ctx, u.stats, timestamp); break;
      case 'BIRD':  drawCatBird(ctx, u.stats, timestamp); break;
      case 'FISH':  drawCatFish(ctx, u.stats, timestamp); break;
      case 'LIZARD': drawCatLizard(ctx, u.stats, timestamp); break;
      case 'ENEMY': drawDogEnemy(ctx, u.stats); break;
      case 'HIPPO': drawEnemyHippo(ctx, u.stats, timestamp); break;
      case 'SNAKE': drawEnemySnake(ctx, u.stats, timestamp); break;
      case 'BEAR':  drawEnemyBear(ctx, u.stats, timestamp); break;
    }
    ctx.restore();

    const hpBarY = (u.unitType === 'TANK' || u.unitType === 'BEAR') ? curY - u.stats.radius * 2.8 : curY - u.stats.radius - 20;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(u.x - 20, hpBarY, 40, 4);
    ctx.fillStyle = u.type === 'ally' ? '#2ecc71' : '#e74c3c';
    ctx.fillRect(u.x - 20, hpBarY, (u.currentHp / u.stats.hp) * 40, 4);
  });

  drawUiOverlay(ctx, s.money, s.walletLevel);
  if (s.isCannonCharging) drawCannonChargeEffect(ctx);
  if (s.isCannonFiring) drawCannonEffect(ctx);
};

/**
 * タイトル画面の背景とキャラクター
 */
const drawTitleBackground = (ctx: CanvasRenderingContext2D, timestamp: number) => {
  const groundY = CANVAS_HEIGHT - 55; // 地面の基準位置

  // 背景描画
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  sky.addColorStop(0, '#85c1e9'); sky.addColorStop(1, '#d6eaf8');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#229954'; ctx.fillRect(0, groundY, CANVAS_WIDTH, 8);
  ctx.fillStyle = '#7d6608'; ctx.fillRect(0, groundY + 8, CANVAS_WIDTH, 47);
  
  const drawTitleCat = (x: number, unitType: string, stats: any) => {
    const bob = Math.sin((timestamp + x * 10) / 50) * 8;
    // 地面の高さ(groundY) - 足元の補正(15px) でキャラを配置
    ctx.save(); ctx.translate(x, groundY - 15 + bob); ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
    if (unitType === 'BASIC') drawCatBasic(ctx, stats, timestamp);
    if (unitType === 'TANK') drawCatTank(ctx, stats, timestamp);
    if (unitType === 'BATTLE') drawCatBattle(ctx, stats, timestamp);
    ctx.restore();
  };

  drawTitleCat(CANVAS_WIDTH * 0.3, 'BASIC', { radius: 18, color: '#ffffff' });
  drawTitleCat(CANVAS_WIDTH * 0.5, 'TANK', { radius: 25, color: '#f0f0f0' });
  drawTitleCat(CANVAS_WIDTH * 0.7, 'BATTLE', { radius: 18, color: '#ffcccc' });
};

const drawHpBars = (ctx: CanvasRenderingContext2D, baseHp: number, enemyBaseHp: number, stage: StageConfig) => {
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
  const barY = CANVAS_HEIGHT - 155;
  ctx.fillRect(30, barY, 100, 10); ctx.strokeRect(30, barY, 100, 10);
  ctx.fillStyle = '#3498db'; ctx.fillRect(30, barY, Math.max(0, (baseHp / stage.baseHp) * 100), 10);
  ctx.fillStyle = '#fff';
  ctx.fillRect(CANVAS_WIDTH - 130, barY, 100, 10); ctx.strokeRect(CANVAS_WIDTH - 130, barY, 100, 10);
  ctx.fillStyle = '#e74c3c'; ctx.fillRect(CANVAS_WIDTH - 130, barY, (enemyBaseHp / stage.enemyBaseHp) * 100, 10);
};

const drawUiOverlay = (ctx: CanvasRenderingContext2D, money: number, walletLevel: number) => {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.beginPath(); ctx.roundRect(10, 10, 180, 70, 10); ctx.fill();
  ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 22px Arial'; ctx.fillText(`$ ${Math.floor(money)}`, 25, 40);
  ctx.fillStyle = '#fff'; ctx.font = '14px Arial'; ctx.fillText(`Lv.${walletLevel} 働きネコ`, 25, 65);
};

const drawCannonChargeEffect = (ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = 'rgba(241, 196, 15, 0.5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(100, CANVAS_HEIGHT - 75); ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 75); ctx.stroke();
};

const drawCannonEffect = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(100, CANVAS_HEIGHT - 95, CANVAS_WIDTH, 40);
  ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 4;
  ctx.strokeRect(100, CANVAS_HEIGHT - 95, CANVAS_WIDTH, 40);
};
