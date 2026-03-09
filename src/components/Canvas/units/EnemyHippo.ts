import type { UnitStats } from "../../../types/game";

/**
 * 敵：カバちゃんを描画する関数
 * 右向きに描くことで、rendererの反転(scale -1)によって左を向いて進むようになります。
 */
export const drawEnemyHippo = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 攻撃アニメーションの計算
	const attackCycle = (timestamp % 2000) / 2000;
	const isAttacking = attackCycle > 0.8;

	// 足元の影
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 20, stats.radius * 1.5, 6, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2.5;
	ctx.fillStyle = stats.color;

	// 1. 体
	ctx.beginPath();
	ctx.roundRect(
		-stats.radius * 1.2,
		-stats.radius * 0.5,
		stats.radius * 2.4,
		stats.radius * 1.5,
		10,
	);
	ctx.fill();
	ctx.stroke();

	// 2. 足 (4本)
	const legY = stats.radius * 0.8;
	const walkOffset = Math.sin(timestamp / 100) * 3;
	ctx.beginPath();
	ctx.rect(-20, legY, 8, 10 + walkOffset);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.rect(-5, legY, 8, 10 - walkOffset);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.rect(10, legY, 8, 10 + walkOffset);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.rect(25, legY, 8, 10 - walkOffset);
	ctx.fill();
	ctx.stroke();

	// 3. 顔 (右向きにパーツを配置)
	ctx.save();
	// 顔の位置を右側（進行方向の正面）へ
	ctx.translate(
		stats.radius * 0.5 + (isAttacking ? 5 : 0),
		-stats.radius * 0.8,
	);

	// 上あご
	ctx.save();
	ctx.rotate(isAttacking ? -0.3 : 0);
	ctx.beginPath();
	ctx.roundRect(-10, -25, 60, 30, 8); // 右側に伸ばす
	ctx.fill();
	ctx.stroke();
	// 鼻の穴 (右側に配置)
	ctx.fillStyle = "#333";
	ctx.beginPath();
	ctx.arc(35, -15, 3, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(20, -15, 3, 0, Math.PI * 2);
	ctx.fill();
	// 目 (顔の左寄りに配置)
	ctx.fillRect(5, -20, 4, 2);
	ctx.restore();

	// 下あご
	ctx.save();
	ctx.translate(0, 5);
	ctx.rotate(isAttacking ? 0.5 : 0);
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.roundRect(-8, 0, 55, 15, 5); // 右側に伸ばす
	ctx.fill();
	ctx.stroke();
	// 牙
	if (isAttacking) {
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.moveTo(35, 0);
		ctx.lineTo(38, -10);
		ctx.lineTo(41, 0);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(20, 0);
		ctx.lineTo(23, -10);
		ctx.lineTo(26, 0);
		ctx.fill();
		ctx.stroke();
	}
	ctx.restore();

	ctx.restore();

	// 4. 耳
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.arc(-stats.radius * 0.5, -stats.radius * 0.8, 6, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	ctx.restore();
};
