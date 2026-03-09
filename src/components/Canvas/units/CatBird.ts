import type { UnitStats } from "../../../types/game";

/**
 * ネコノトリを描画する関数
 * 空中を浮遊し、羽ばたくアニメーションと、奥行きのある耳の配置が特徴。
 */
export const drawCatBird = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 地面に映る影 (高度があるため、非常に薄く描画)
	ctx.fillStyle = "rgba(0,0,0,0.05)";
	ctx.beginPath();
	ctx.ellipse(0, 40, stats.radius, 4, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.fillStyle = stats.color;
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2;

	// 1. ぶら下がった足 (空中で力なく揺れている様子を表現)
	const legDangle = Math.sin(timestamp / 100) * 3;
	ctx.beginPath();
	ctx.moveTo(-5, -10);
	ctx.lineTo(-8, 5 + legDangle);
	ctx.moveTo(5, -10);
	ctx.lineTo(8, 5 - legDangle);
	ctx.stroke();

	// 2. 空飛ぶ胴体 (横長の楕円。高い位置に固定)
	ctx.beginPath();
	ctx.ellipse(
		0,
		-20, // 基準点(0,0)より上に配置
		stats.radius * 1.2, // 横幅
		stats.radius * 0.8, // 高さ
		0,
		0,
		Math.PI * 2,
	);
	ctx.fill();
	ctx.stroke();

	// 3. 奥側の耳 (体に隠れる部分。手前の耳より暗くして遠近感を出す)
	ctx.fillStyle = "#ddd";
	ctx.beginPath();
	ctx.moveTo(-5, -25);
	ctx.lineTo(-12, -35);
	ctx.lineTo(2, -30);
	ctx.fill();
	ctx.stroke();

	// 4. くちばし (鳥の象徴的な鋭いくちばし)
	ctx.fillStyle = "#f1c40f";
	ctx.beginPath();
	ctx.moveTo(stats.radius, -22); // 顔の右端
	ctx.lineTo(stats.radius + 18, -18); // 先端
	ctx.lineTo(stats.radius, -14);
	ctx.fill();
	ctx.stroke();

	// 5. 手前側の耳 (頭部の上に乗っている様子を表現)
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.moveTo(5, -25);
	ctx.lineTo(0, -38);
	ctx.lineTo(12, -28);
	ctx.fill();
	ctx.stroke();

	// 6. 羽 (羽ばたきアニメーション。高速な周期で上下させる)
	ctx.fillStyle = stats.color;
	const wingSwing = Math.sin(timestamp / 40) * 25; // 振幅を大きく設定
	ctx.beginPath();
	ctx.moveTo(0, -20); // 胴体中央
	ctx.lineTo(-25, -20 + wingSwing); // 先端
	ctx.lineTo(-15, -45 + wingSwing);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

	// 7. 目 (顔の横側に配置された鳥独特の視点)
	ctx.fillStyle = "#333";
	ctx.beginPath();
	ctx.arc(stats.radius * 0.5, -22, 2.5, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};
