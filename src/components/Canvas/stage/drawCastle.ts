import { CANVAS_HEIGHT } from "../../../types/game";

/**
 * 【責任】拠点の城（城郭）を描画。
 * 味方側（青系）と敵側（赤系）で共通のパーツ構成を使用し、色のみを出し分けます。
 */
export const drawCastle = (
	ctx: CanvasRenderingContext2D,
	x: number,
	bodyColor: string,
	flagColor: string,
) => {
	const groundY = CANVAS_HEIGHT - 55; // 地面の接地面を基準点とする

	ctx.save();
	ctx.translate(x, groundY);

	// 1. 本丸（土台）
	ctx.fillStyle = bodyColor;
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 3;
	ctx.beginPath();
	// 角丸設定の配列 [左上, 右上, 右下, 左下]
	// 接地面（下側）は角を丸めず、屋根側（上側）のみ丸める。
	ctx.roundRect(0, -80, 80, 80, [10, 10, 0, 0]);
	ctx.fill();
	ctx.stroke();

	// 2. 狭間（屋上の凸凹）
	// ループで3つの突起を描画し、城郭らしさを強調。
	for (let i = 0; i < 3; i++) {
		const rectX = 5 + i * 25;
		const rectY = -95;
		ctx.fillRect(rectX, rectY, 15, 15);
		ctx.strokeRect(rectX, rectY, 15, 15);
	}

	// 3. 城門 (半円アーチ状の入り口)
	ctx.fillStyle = "#2c3e50";
	ctx.beginPath();
	ctx.roundRect(20, -40, 40, 40, [20, 20, 0, 0]);
	ctx.fill();

	// 4. 旗（シンボル）
	// 旗竿
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(10, -80);
	ctx.lineTo(10, -130);
	ctx.stroke();

	// 旗布 (三角形のパス)
	ctx.fillStyle = flagColor;
	ctx.beginPath();
	ctx.moveTo(10, -130); // 竿の頂点
	ctx.lineTo(40, -120); // 旗の先端
	ctx.lineTo(10, -110); // 竿への戻り
	ctx.fill();
	ctx.stroke();

	ctx.restore();
};
