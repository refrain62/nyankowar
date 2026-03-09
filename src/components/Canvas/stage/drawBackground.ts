import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	type StageConfig,
} from "../../../types/game";

/**
 * 【責任】ステージの背景描画。
 * パララックス（視差）効果を利用し、遠景と近景の移動速度を変えることで
 * 2Dながら奥行きのある空間を表現します。
 */
export const drawBackground = (
	ctx: CanvasRenderingContext2D,
	stage: StageConfig,
	timestamp: number,
) => {
	const { background: bg } = stage;

	// 1. 空のグラデーション (画面全体)
	const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
	skyGrad.addColorStop(0, bg.skyTop);
	skyGrad.addColorStop(1, bg.skyBottom);
	ctx.fillStyle = skyGrad;
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	// 2. 遠くの山 (最背面。非常にゆっくりと動かす)
	// ループ範囲を -1 からにすることで、画面端での切れ目を防止
	const mountainFarOffset = (timestamp / 100) % 200;
	ctx.fillStyle = bg.mountainFar;
	for (let i = -1; i < 5; i++) {
		ctx.beginPath();
		ctx.moveTo(i * 200 - mountainFarOffset, CANVAS_HEIGHT - 55); // 左裾
		ctx.lineTo(i * 200 + 100 - mountainFarOffset, CANVAS_HEIGHT - 120); // 頂点
		ctx.lineTo(i * 200 + 200 - mountainFarOffset, CANVAS_HEIGHT - 55); // 右裾
		ctx.fill();
	}

	// 3. 近くの山 (中景。遠くの山より早く動かし、奥行きを強調)
	const mountainNearOffset = (timestamp / 50) % 300;
	ctx.fillStyle = bg.mountainNear;
	for (let i = -1; i < 4; i++) {
		ctx.beginPath();
		ctx.moveTo(i * 300 - mountainNearOffset, CANVAS_HEIGHT - 55); // 左裾
		ctx.lineTo(i * 300 + 150 - mountainNearOffset, CANVAS_HEIGHT - 90); // 頂点
		ctx.lineTo(i * 300 + 300 - mountainNearOffset, CANVAS_HEIGHT - 55); // 右裾
		ctx.fill();
	}

	// 4. 地面 (最前面。芝生と土の2層構造)
	// 芝生 (上層)
	ctx.fillStyle = bg.grass;
	ctx.fillRect(0, CANVAS_HEIGHT - 55, CANVAS_WIDTH, 8); 
	// 土 (下層)
	ctx.fillStyle = bg.dirt;
	ctx.fillRect(0, CANVAS_HEIGHT - 47, CANVAS_WIDTH, 47); 

	// 5. 流れる雲 (半透明の複数の円を組み合わせて「もくもく感」を出す)
	const cloudOffset = (timestamp / 30) % (CANVAS_WIDTH + 200);
	ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	
	const drawCloud = (x: number, y: number) => {
		ctx.beginPath();
		ctx.arc(x, y, 20, 0, Math.PI * 2);           // 左の塊
		ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2); // 中央の大きな塊
		ctx.arc(x + 50, y, 20, 0, Math.PI * 2);      // 右の塊
		ctx.fill();
	};

	// 異なる高度とタイミングで2つの雲を描画
	drawCloud(CANVAS_WIDTH - cloudOffset, 50);
	drawCloud(CANVAS_WIDTH + 400 - cloudOffset, 80);
};
