import type { UnitStats } from "../../../types/game";

/**
 * 敵：ニョロを描画する関数
 * ベジェ曲線による波打つ胴体と、アニメーションする舌が特徴。
 */
export const drawEnemySnake = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 全身のうねり（波打ち）をsin波で計算
	const wave = Math.sin(timestamp / 100) * 10;

	// 足元の影 (細長い胴体に合わせて楕円を横に伸ばす)
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 15, stats.radius * 2, 4, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2;
	ctx.fillStyle = stats.color;

	// 1. 胴体 (太い線とベジェ曲線を組み合わせて「うねり」を表現)
	ctx.beginPath();
	ctx.moveTo(30, wave); // 前方
	ctx.quadraticCurveTo(15, -wave, 0, wave); // 中間1
	ctx.quadraticCurveTo(-15, -wave, -30, wave); // 中間2（尻尾側）

	ctx.lineWidth = 10; // 線の太さで胴体の厚みを出す
	ctx.lineCap = "round";
	ctx.stroke();

	ctx.lineWidth = 2; // 装飾用にリセット

	// 2. 頭部 (先端に円を配置)
	ctx.beginPath();
	ctx.arc(35, wave - 2, 8, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 3. 舌 (高速な周期でチロチロと出す演出)
	if (Math.sin(timestamp / 50) > 0.5) {
		ctx.strokeStyle = "#e74c3c";
		ctx.beginPath();
		// 二股の舌をV字のパスで描画
		ctx.moveTo(43, wave - 2);
		ctx.lineTo(50, wave - 4);
		ctx.moveTo(43, wave - 2);
		ctx.lineTo(50, wave);
		ctx.stroke();
	}

	// 4. つぶらな目
	ctx.fillStyle = "#333";
	ctx.beginPath();
	ctx.arc(38, wave - 4, 1.5, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};
