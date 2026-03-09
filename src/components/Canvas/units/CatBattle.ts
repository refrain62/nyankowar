import type { UnitStats } from "../../../types/game";

/**
 * バトルネコを描画する関数
 * 真紅の耳と巨大な斧が特徴の攻撃ユニット。
 */
export const drawCatBattle = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 攻撃的な速い歩行リズム。Math.sin の周波数を上げてキビキビとした動きを表現。
	const walk = Math.sin(timestamp / 80) * 4;

	// 足元の影
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 15, stats.radius, 5, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.fillStyle = stats.color;
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2.5;

	// 1. 足 (体より先に描画)
	ctx.beginPath();
	ctx.rect(-10, 5, 5, 8 + walk);
	ctx.rect(5, 5, 5, 8 - walk);
	ctx.fill();
	ctx.stroke();

	// 2. 胴体
	ctx.beginPath();
	ctx.arc(0, 0, stats.radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 3. 真紅の耳 (戦闘意欲を表現)
	ctx.fillStyle = "#c0392b";
	ctx.beginPath();
	// 左耳: 通常より大きく鋭い耳
	ctx.moveTo(-stats.radius * 0.6, -stats.radius * 0.5);
	ctx.lineTo(-stats.radius * 1.2, -stats.radius * 1.4);
	ctx.lineTo(-stats.radius * 0.2, -stats.radius * 1.0);
	// 右耳
	ctx.moveTo(stats.radius * 0.6, -stats.radius * 0.5);
	ctx.lineTo(stats.radius * 1.2, -stats.radius * 1.4);
	ctx.lineTo(stats.radius * 0.2, -stats.radius * 1.0);
	ctx.fill();
	ctx.stroke();

	// 4. 目 (鋭い目つき。細い線で表現)
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(-stats.radius * 0.5, -5);
	ctx.lineTo(-stats.radius * 0.1, 0);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(stats.radius * 0.5, -5);
	ctx.lineTo(stats.radius * 0.1, 0);
	ctx.stroke();

	// 5. 斧 (アニメーションとグラデーション)
	ctx.save();
	// 胴体の右側に配置し、常に小さく揺らして威嚇する。
	ctx.translate(stats.radius * 0.8, 0);
	ctx.rotate(Math.sin(timestamp / 100) * 0.5);

	// 柄
	ctx.strokeStyle = "#5d4037";
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(0, 10);
	ctx.lineTo(0, -30);
	ctx.stroke();

	// 刃 (グラデーションによる金属質の表現)
	const grad = ctx.createLinearGradient(0, -30, 20, -10);
	grad.addColorStop(0, "#bdc3c7");
	grad.addColorStop(1, "#7f8c8d");
	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.moveTo(0, -30);
	// 曲線（quadraticCurveTo）で「斧の刃」のしなりを表現
	ctx.quadraticCurveTo(25, -35, 20, -10);
	ctx.lineTo(0, -15);
	ctx.fill();
	ctx.stroke();

	ctx.restore();
	ctx.restore();
};
