import type { UnitStats } from "../../../types/game";

/**
 * キモねこを描画する関数
 * 攻撃時に高い位置から前方の地面に向かって腕を鋭く伸ばす演出
 */
export const drawCatLegs = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	const legLength = 100;

	// 攻撃アニメーションの計算 (約1.5秒周期)
	const attackCycle = (timestamp % 1500) / 1500;
	const isExtending = attackCycle > 0.7;
	const extension = isExtending
		? Math.sin(((attackCycle - 0.7) * Math.PI) / 0.3)
		: 0;

	// 足元の影
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(-15, 10, 10, 4, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(15, 10, 10, 4, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	// 攻撃時に体全体も少し前斜め下に沈み込む
	ctx.translate(extension * 10, -legLength + extension * 5);

	// 1. 長い脚
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(-8, 0);
	ctx.lineTo(-12, legLength / 2);
	ctx.lineTo(-15, legLength);
	ctx.moveTo(8, 0);
	ctx.lineTo(12, legLength / 2);
	ctx.lineTo(15, legLength);
	ctx.stroke();

	// 2. 地面を突く長い腕
	ctx.lineWidth = 2;
	ctx.beginPath();

	const armStartX = 10;
	const armStartY = 0;
	// 伸びる先を地面(legLength分下)に設定
	const targetX = 40 + extension * 100;
	const targetY = legLength - 5; // 地面スレスレ

	ctx.moveTo(armStartX, armStartY);
	// しなりながら地面へ向かう軌道
	ctx.bezierCurveTo(
		armStartX + 20,
		armStartY - 20,
		targetX - 20,
		targetY - 40,
		targetX,
		targetY,
	);
	ctx.stroke();

	// 手の先 (拳が地面を叩く)
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 3. 胴体
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.arc(0, 0, stats.radius * 1.2, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 4. 耳
	ctx.beginPath();
	ctx.moveTo(-stats.radius * 0.6, -stats.radius * 0.5);
	ctx.lineTo(-stats.radius * 1.1, -stats.radius * 1.3);
	ctx.lineTo(-stats.radius * 0.2, -stats.radius * 1.0);
	ctx.moveTo(stats.radius * 0.6, -stats.radius * 0.5);
	ctx.lineTo(stats.radius * 1.1, -stats.radius * 1.3);
	ctx.lineTo(stats.radius * 0.2, -stats.radius * 1.0);
	ctx.fill();
	ctx.stroke();

	// 5. 目
	ctx.fillStyle = "#333";
	ctx.beginPath();
	ctx.arc(-stats.radius * 0.4, 0, 2, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(stats.radius * 0.4, 0, 2, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};
