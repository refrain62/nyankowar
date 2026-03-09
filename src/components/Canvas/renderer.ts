import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	type GameState,
	type StageConfig,
	type UnitStats,
} from "../../types/game";
import { drawBackground } from "./stage/drawBackground";
import { drawCastle } from "./stage/drawCastle";

// 各ユニットの個別描画ロジックをインポート
import { drawCatBasic } from "./units/CatBasic";
import { drawCatBattle } from "./units/CatBattle";
import { drawCatBird } from "./units/CatBird";
import { drawCatCow } from "./units/CatCow";
import { drawCatFish } from "./units/CatFish";
import { drawCatLegs } from "./units/CatLegs";
import { drawCatLizard } from "./units/CatLizard";
import { drawCatTank } from "./units/CatTank";
import { drawDogEnemy } from "./units/DogEnemy";
import { drawEnemyBear } from "./units/EnemyBear";
import { drawEnemyHippo } from "./units/EnemyHippo";
import { drawEnemySnake } from "./units/EnemySnake";

/**
 * 【設計意図】ゲーム全体のメイン描画関数。
 * 1フレームごとに背景、城、ユニット、エフェクト、UIの順にレイヤーを重ねて描画します。
 * 外部の画像アセット（PNG/JPG）を一切使用せず、全て Canvas API のプリミティブ（円、線、矩形）で構成されています。
 */
export const drawGame = (
	ctx: CanvasRenderingContext2D,
	s: GameState,
	stage: StageConfig,
	timestamp: number,
) => {
	// 画面のクリア
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	// タイトル画面専用の描画
	if (s.gameState === "title") {
		drawTitleBackground(ctx, timestamp);
		return;
	}

	// 1. 背景（ステージ固有の空や雲、山など）
	drawBackground(ctx, stage, timestamp);

	// 2. 城（拠点）の描画
	// 味方の城（左側）
	drawCastle(ctx, 40, "#d5dbdb", "#3498db");
	// 敵の城（右側）
	drawCastle(ctx, CANVAS_WIDTH - 120, "#566573", "#e74c3c");

	// 3. 城のHPバー
	drawHpBars(ctx, s.baseHp, s.enemyBaseHp, stage);

	// 4. ユニットの描画
	const allUnits = [...s.allies, ...s.enemies];
	for (const u of allUnits) {
		// 全ユニット共通の「呼吸（上下の揺れ）」アニメーション
		const bob = Math.sin(timestamp / 50) * 5;
		const curY = u.y + bob;

		ctx.save();
		ctx.translate(u.x, curY);
		// 敵ユニットの場合は左右反転させて描画
		if (u.type === "enemy") ctx.scale(-1, 1);

		ctx.strokeStyle = "#333";
		ctx.lineWidth = 2;

		// ユニットの種類に応じた描画関数を呼び出し
		switch (u.unitType) {
			case "BASIC":
				drawCatBasic(ctx, u.stats, timestamp);
				break;
			case "TANK":
				drawCatTank(ctx, u.stats, timestamp);
				break;
			case "BATTLE":
				drawCatBattle(ctx, u.stats, timestamp);
				break;
			case "LEGS":
				drawCatLegs(ctx, u.stats, timestamp);
				break;
			case "COW":
				drawCatCow(ctx, u.stats, timestamp);
				break;
			case "BIRD":
				drawCatBird(ctx, u.stats, timestamp);
				break;
			case "FISH":
				drawCatFish(ctx, u.stats, timestamp);
				break;
			case "LIZARD":
				drawCatLizard(ctx, u.stats, timestamp);
				break;
			case "ENEMY":
				drawDogEnemy(ctx, u.stats);
				break;
			case "HIPPO":
				drawEnemyHippo(ctx, u.stats, timestamp);
				break;
			case "SNAKE":
				drawEnemySnake(ctx, u.stats, timestamp);
				break;
			case "BEAR":
				drawEnemyBear(ctx, u.stats, timestamp);
				break;
		}
		ctx.restore();

		// ユニット個別のHPバー（頭上に配置）
		const hpBarY =
			u.unitType === "TANK" || u.unitType === "BEAR"
				? curY - u.stats.radius * 2.8
				: curY - u.stats.radius - 20;

		ctx.fillStyle = "rgba(0,0,0,0.3)";
		ctx.fillRect(u.x - 20, hpBarY, 40, 4);
		ctx.fillStyle = u.type === "ally" ? "#2ecc71" : "#e74c3c";
		ctx.fillRect(u.x - 20, hpBarY, (u.currentHp / u.stats.hp) * 40, 4);
	}

	// 5. UI オーバーレイ（所持金、働きネコレベル）
	drawUiOverlay(ctx, s.money, s.walletLevel);

	// 6. 特殊エフェクト（にゃんこ砲の充填・発射）
	if (s.isCannonCharging) drawCannonChargeEffect(ctx);
	if (s.isCannonFiring) drawCannonEffect(ctx);
};

/**
 * タイトル画面の背景とマスコットキャラクターの描画。
 */
const drawTitleBackground = (
	ctx: CanvasRenderingContext2D,
	timestamp: number,
) => {
	const groundY = CANVAS_HEIGHT - 55;

	// 空のグラデーション
	const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
	sky.addColorStop(0, "#85c1e9");
	sky.addColorStop(1, "#d6eaf8");
	ctx.fillStyle = sky;
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	// 地面（芝生と土）
	ctx.fillStyle = "#229954";
	ctx.fillRect(0, groundY, CANVAS_WIDTH, 8);
	ctx.fillStyle = "#7d6608";
	ctx.fillRect(0, groundY + 8, CANVAS_WIDTH, 47);

	// デモンストレーション用のキャラクター
	const drawTitleCat = (
		x: number,
		unitType: string,
		stats: Pick<UnitStats, "radius" | "color">,
	) => {
		const bob = Math.sin((timestamp + x * 10) / 50) * 8;
		ctx.save();
		ctx.translate(x, groundY - 15 + bob);
		ctx.strokeStyle = "#333";
		ctx.lineWidth = 2;
		if (unitType === "BASIC") drawCatBasic(ctx, stats as UnitStats, timestamp);
		if (unitType === "TANK") drawCatTank(ctx, stats as UnitStats, timestamp);
		if (unitType === "BATTLE")
			drawCatBattle(ctx, stats as UnitStats, timestamp);
		ctx.restore();
	};

	drawTitleCat(CANVAS_WIDTH * 0.3, "BASIC", { radius: 18, color: "#ffffff" });
	drawTitleCat(CANVAS_WIDTH * 0.5, "TANK", { radius: 25, color: "#f0f0f0" });
	drawTitleCat(CANVAS_WIDTH * 0.7, "BATTLE", { radius: 18, color: "#ffcccc" });
};

/**
 * 拠点（城）のHPバーの描画。
 */
const drawHpBars = (
	ctx: CanvasRenderingContext2D,
	baseHp: number,
	enemyBaseHp: number,
	stage: StageConfig,
) => {
	ctx.fillStyle = "#fff";
	ctx.strokeStyle = "#000";
	ctx.lineWidth = 1;
	const barY = CANVAS_HEIGHT - 155;

	// 味方のHP
	ctx.fillRect(30, barY, 100, 10);
	ctx.strokeRect(30, barY, 100, 10);
	ctx.fillStyle = "#3498db";
	ctx.fillRect(30, barY, Math.max(0, (baseHp / stage.baseHp) * 100), 10);

	// 敵のHP
	ctx.fillStyle = "#fff";
	ctx.fillRect(CANVAS_WIDTH - 130, barY, 100, 10);
	ctx.strokeRect(CANVAS_WIDTH - 130, barY, 100, 10);
	ctx.fillStyle = "#e74c3c";
	ctx.fillRect(
		CANVAS_WIDTH - 130,
		barY,
		(enemyBaseHp / stage.enemyBaseHp) * 100,
		10,
	);
};

/**
 * 右上の所持金パネルの描画。
 */
const drawUiOverlay = (
	ctx: CanvasRenderingContext2D,
	money: number,
	walletLevel: number,
) => {
	ctx.fillStyle = "rgba(0,0,0,0.7)";
	ctx.beginPath();
	ctx.roundRect(10, 10, 180, 70, 10);
	ctx.fill();

	ctx.fillStyle = "#f1c40f";
	ctx.font = "bold 22px Arial";
	ctx.fillText(`$ ${Math.floor(money)}`, 25, 40);

	ctx.fillStyle = "#fff";
	ctx.font = "14px Arial";
	ctx.fillText(`Lv.${walletLevel} 働きネコ`, 25, 65);
};

/**
 * にゃんこ砲の充填（レーン表示）エフェクト。
 */
const drawCannonChargeEffect = (ctx: CanvasRenderingContext2D) => {
	ctx.strokeStyle = "rgba(241, 196, 15, 0.5)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(100, CANVAS_HEIGHT - 75);
	ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 75);
	ctx.stroke();
};

/**
 * にゃんこ砲の発射（閃光）エフェクト。
 */
const drawCannonEffect = (ctx: CanvasRenderingContext2D) => {
	ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
	ctx.fillRect(100, CANVAS_HEIGHT - 95, CANVAS_WIDTH, 40);
	ctx.strokeStyle = "#f1c40f";
	ctx.lineWidth = 4;
	ctx.strokeRect(100, CANVAS_HEIGHT - 95, CANVAS_WIDTH, 40);
};
