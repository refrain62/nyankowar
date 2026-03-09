import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	type StageConfig,
} from "../../../types/game";

/**
 * ステージの背景を描画する関数
 */
export const drawBackground = (
	ctx: CanvasRenderingContext2D,
	stage: StageConfig,
	timestamp: number,
) => {
	const { background: bg } = stage;

	// 1. 空のグラデーション
	const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
	skyGrad.addColorStop(0, bg.skyTop);
	skyGrad.addColorStop(1, bg.skyBottom);
	ctx.fillStyle = skyGrad;
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	// 2. 遠くの山 (ゆっくり動く)
	const mountainFarOffset = (timestamp / 100) % 200;
	ctx.fillStyle = bg.mountainFar;
	for (let i = -1; i < 5; i++) {
		ctx.beginPath();
		ctx.moveTo(i * 200 - mountainFarOffset, CANVAS_HEIGHT - 55);
		ctx.lineTo(i * 200 + 100 - mountainFarOffset, CANVAS_HEIGHT - 120);
		ctx.lineTo(i * 200 + 200 - mountainFarOffset, CANVAS_HEIGHT - 55);
		ctx.fill();
	}

	// 3. 近くの山 (少し早く動く)
	const mountainNearOffset = (timestamp / 50) % 300;
	ctx.fillStyle = bg.mountainNear;
	for (let i = -1; i < 4; i++) {
		ctx.beginPath();
		ctx.moveTo(i * 300 - mountainNearOffset, CANVAS_HEIGHT - 55);
		ctx.lineTo(i * 300 + 150 - mountainNearOffset, CANVAS_HEIGHT - 90);
		ctx.lineTo(i * 300 + 300 - mountainNearOffset, CANVAS_HEIGHT - 55);
		ctx.fill();
	}

	// 4. 地面 (芝生と土)
	ctx.fillStyle = bg.grass;
	ctx.fillRect(0, CANVAS_HEIGHT - 55, CANVAS_WIDTH, 8); // 芝生を少し薄く
	ctx.fillStyle = bg.dirt;
	ctx.fillRect(0, CANVAS_HEIGHT - 47, CANVAS_WIDTH, 47); // 土の厚みも調整

	// 5. 雲
	const cloudOffset = (timestamp / 30) % (CANVAS_WIDTH + 200);
	ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	const drawCloud = (x: number, y: number) => {
		ctx.beginPath();
		ctx.arc(x, y, 20, 0, Math.PI * 2);
		ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
		ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
		ctx.fill();
	};
	drawCloud(CANVAS_WIDTH - cloudOffset, 50);
	drawCloud(CANVAS_WIDTH + 400 - cloudOffset, 80);
};
