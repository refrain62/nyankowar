import type { UnitStats } from "../../../types/game";

export const drawEnemySnake = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	const wave = Math.sin(timestamp / 100) * 10;

	// 足元の影
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 15, stats.radius * 2, 4, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2;
	ctx.fillStyle = stats.color;

	// 1. 体 (波打つ)
	ctx.beginPath();
	ctx.moveTo(30, wave);
	ctx.quadraticCurveTo(15, -wave, 0, wave);
	ctx.quadraticCurveTo(-15, -wave, -30, wave);
	ctx.lineWidth = 10;
	ctx.lineCap = "round";
	ctx.stroke();
	ctx.lineWidth = 2;

	// 2. 頭部
	ctx.beginPath();
	ctx.arc(35, wave - 2, 8, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 3. 舌 (攻撃時にチロチロ出る)
	if (Math.sin(timestamp / 50) > 0.5) {
		ctx.strokeStyle = "#e74c3c";
		ctx.beginPath();
		ctx.moveTo(43, wave - 2);
		ctx.lineTo(50, wave - 4);
		ctx.moveTo(43, wave - 2);
		ctx.lineTo(50, wave);
		ctx.stroke();
	}

	// 4. 目
	ctx.fillStyle = "#333";
	ctx.beginPath();
	ctx.arc(38, wave - 4, 1.5, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};
