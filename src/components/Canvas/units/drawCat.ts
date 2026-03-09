import type { UnitStats } from "../../../types/game";

/**
 * 味方ユニット（ネコ）を描画する関数
 */
export const drawCat = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	stats: UnitStats,
	unitType: string,
	currentHp: number,
	timestamp: number,
) => {
	const bob = Math.sin(timestamp / 50) * 5;
	const curY = y + bob;

	ctx.save();
	ctx.translate(x, curY);

	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2;
	ctx.fillStyle = stats.color;

	// 1. 特徴的なパーツの描画
	if (unitType === "LEGS") {
		// キモネコ: 長い足
		ctx.beginPath();
		ctx.moveTo(-5, 0);
		ctx.lineTo(-10, 40);
		ctx.moveTo(5, 0);
		ctx.lineTo(10, 40);
		ctx.stroke();
	}

	// 2. 体の描画
	if (unitType === "TANK") {
		ctx.beginPath();
		ctx.roundRect(
			-stats.radius * 0.8,
			-stats.radius * 2.5,
			stats.radius * 1.6,
			stats.radius * 2.8,
			10,
		);
		ctx.fill();
		ctx.stroke();
	} else if (unitType === "COW") {
		// ウシネコ: 少し横長の体
		ctx.beginPath();
		ctx.ellipse(
			0,
			0,
			stats.radius * 1.3,
			stats.radius * 0.9,
			0,
			0,
			Math.PI * 2,
		);
		ctx.fill();
		ctx.stroke();
		// 牛柄
		ctx.fillStyle = "#333";
		ctx.beginPath();
		ctx.arc(-5, -5, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(10, 2, 4, 0, Math.PI * 2);
		ctx.fill();
	} else {
		ctx.beginPath();
		ctx.arc(0, 0, stats.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}

	// 3. 耳・角の描画
	ctx.fillStyle = unitType === "BATTLE" ? "#c0392b" : stats.color;
	const earY = unitType === "TANK" ? -stats.radius * 2.5 : -stats.radius * 0.5;

	if (unitType === "COW") {
		// ウシネコ: 牛の角
		ctx.fillStyle = "#f1c40f";
		ctx.beginPath();
		ctx.moveTo(-10, -15);
		ctx.lineTo(-15, -25);
		ctx.lineTo(-5, -20);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(10, -15);
		ctx.lineTo(15, -25);
		ctx.lineTo(5, -20);
		ctx.fill();
	} else {
		ctx.beginPath();
		ctx.moveTo(-stats.radius * 0.6, earY);
		ctx.lineTo(-stats.radius * 1.0, earY - 15);
		ctx.lineTo(-stats.radius * 0.2, earY - 10);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(stats.radius * 0.6, earY);
		ctx.lineTo(stats.radius * 1.0, earY - 15);
		ctx.lineTo(stats.radius * 0.2, earY - 10);
		ctx.fill();
		ctx.stroke();
	}

	// 4. 目の描画
	ctx.fillStyle = "#333";
	const eyeY = unitType === "TANK" ? -stats.radius * 1.8 : -2;
	ctx.fillRect(-stats.radius * 0.4, eyeY, 3, 6);
	ctx.fillRect(stats.radius * 0.2, eyeY, 3, 6);

	// 5. 武器 (バトルネコの斧)
	if (unitType === "BATTLE") {
		ctx.save();
		ctx.translate(stats.radius * 0.8, 0);
		ctx.rotate(Math.sin(timestamp / 100) * 0.5);
		ctx.strokeStyle = "#5d4037";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(0, 10);
		ctx.lineTo(0, -30);
		ctx.stroke();
		ctx.fillStyle = "#95a5a6";
		ctx.beginPath();
		ctx.moveTo(0, -30);
		ctx.quadraticCurveTo(25, -35, 20, -10);
		ctx.lineTo(0, -15);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}

	ctx.restore();

	// 6. HPバー
	const hpBarBaseY =
		unitType === "TANK" ? curY - stats.radius * 2.8 : curY - stats.radius - 20;
	ctx.fillStyle = "rgba(0,0,0,0.3)";
	ctx.fillRect(x - 20, hpBarBaseY, 40, 4);
	ctx.fillStyle = "#2ecc71";
	ctx.fillRect(x - 20, hpBarBaseY, (currentHp / stats.hp) * 40, 4);
};
