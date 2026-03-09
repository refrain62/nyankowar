import type { UnitStats } from "../../../types/game";

/**
 * ネコノトリを描画する関数
 * 横向きの頭部に対し、奥行きのある（手前と奥の）耳を正しく配置
 */
export const drawCatBird = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 地面に映る影
	ctx.fillStyle = "rgba(0,0,0,0.05)";
	ctx.beginPath();
	ctx.ellipse(0, 40, stats.radius, 4, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.fillStyle = stats.color;
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2;

	// 1. ぶら下がった足
	const legDangle = Math.sin(timestamp / 100) * 3;
	ctx.beginPath();
	ctx.moveTo(-5, -10);
	ctx.lineTo(-8, 5 + legDangle);
	ctx.moveTo(5, -10);
	ctx.lineTo(8, 5 - legDangle);
	ctx.stroke();

	// 2. 空飛ぶ体 (楕円)
	ctx.beginPath();
	ctx.ellipse(
		0,
		-20,
		stats.radius * 1.2,
		stats.radius * 0.8,
		0,
		0,
		Math.PI * 2,
	);
	ctx.fill();
	ctx.stroke();

	// 3. 奥側の耳 (先に描画して隠す)
	ctx.fillStyle = "#ddd"; // 少し暗くして奥行きを出す
	ctx.beginPath();
	ctx.moveTo(-5, -25);
	ctx.lineTo(-12, -35);
	ctx.lineTo(2, -30);
	ctx.fill();
	ctx.stroke();

	// 4. くちばし
	ctx.fillStyle = "#f1c40f";
	ctx.beginPath();
	ctx.moveTo(stats.radius, -22);
	ctx.lineTo(stats.radius + 18, -18);
	ctx.lineTo(stats.radius, -14);
	ctx.fill();
	ctx.stroke();

	// 5. 手前側の耳
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.moveTo(5, -25);
	ctx.lineTo(0, -38);
	ctx.lineTo(12, -28);
	ctx.fill();
	ctx.stroke();

	// 6. 羽 (羽ばたきアニメーション)
	ctx.fillStyle = stats.color;
	const wingSwing = Math.sin(timestamp / 40) * 25;
	ctx.beginPath();
	ctx.moveTo(0, -20);
	ctx.lineTo(-25, -20 + wingSwing);
	ctx.lineTo(-15, -45 + wingSwing);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

	// 7. 目 (顔の横側に配置)
	ctx.fillStyle = "#333";
	ctx.beginPath();
	ctx.arc(stats.radius * 0.5, -22, 2.5, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};
