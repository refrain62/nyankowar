import type { UnitStats } from "../../../types/game";

export const drawEnemyBear = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 攻撃アニメーションの計算
	const attackCycle = (timestamp % 2500) / 2000;
	const isAttacking = attackCycle > 0.7;
	const armSwing = isAttacking
		? Math.sin(((attackCycle - 0.7) * Math.PI) / 0.3)
		: 0;

	// 足元の影
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 25, stats.radius * 1.5, 8, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 3;
	ctx.fillStyle = stats.color;

	// 1. 体 (どっしりしたシルエット)
	ctx.beginPath();
	ctx.roundRect(
		-stats.radius,
		-stats.radius * 1.5,
		stats.radius * 2,
		stats.radius * 2.5,
		20,
	);
	ctx.fill();
	ctx.stroke();

	// 2. 耳
	ctx.beginPath();
	ctx.arc(-stats.radius * 0.7, -stats.radius * 1.5, 10, 0, Math.PI * 2);
	ctx.arc(stats.radius * 0.7, -stats.radius * 1.5, 10, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 3. 顔 (右向き)
	const faceX = stats.radius * 0.5;
	const faceY = -stats.radius * 0.8;
	ctx.fillStyle = "#333";
	ctx.fillRect(faceX + 5, faceY, 5, 2); // 目
	ctx.beginPath();
	ctx.arc(faceX + 15, faceY + 10, 4, 0, Math.PI * 2);
	ctx.fill(); // 鼻

	// 4. 腕のなぎ払い
	ctx.save();
	ctx.translate(stats.radius * 0.5, faceY + 20);
	ctx.rotate(armSwing * -1.5); // 大きく腕を振る
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.roundRect(0, -10, 50, 25, 10);
	ctx.fill();
	ctx.stroke();
	// 爪
	if (isAttacking) {
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 2;
		for (let i = 0; i < 3; i++) {
			ctx.beginPath();
			ctx.moveTo(45, i * 6 - 5);
			ctx.lineTo(60, i * 6 - 2);
			ctx.stroke();
		}
	}
	ctx.restore();

	ctx.restore();
};
