import type { UnitStats } from "../../../types/game";

export const drawDogEnemy = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
) => {
	// 足元の影
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 15, stats.radius * 1.2, 5, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = stats.color;
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2.5;

	// 体 (少し楕円)
	ctx.beginPath();
	ctx.ellipse(0, 0, stats.radius * 1.2, stats.radius, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 耳 (垂れ耳)
	ctx.fillStyle = "#2c3e50";
	ctx.beginPath();
	ctx.arc(-stats.radius * 0.8, -stats.radius * 0.5, 8, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(stats.radius * 0.8, -stats.radius * 0.5, 8, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 鼻
	ctx.fillStyle = "#17202a";
	ctx.beginPath();
	ctx.arc(stats.radius * 0.6, 5, 4, 0, Math.PI * 2);
	ctx.fill();

	// 目 (鋭い光)
	ctx.fillStyle = "#ff0000";
	ctx.beginPath();
	ctx.arc(stats.radius * 0.3, -5, 4, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(-stats.radius * 0.1, -5, 4, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = "#fff";
	ctx.beginPath();
	ctx.arc(stats.radius * 0.35, -6, 1, 0, Math.PI * 2);
	ctx.fill();
};
