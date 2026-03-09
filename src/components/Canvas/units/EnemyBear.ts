import type { UnitStats } from "../../../types/game";

/**
 * 敵：クマ先生を描画する関数
 * 圧倒的な巨体と、強力な「腕のなぎ払い」アニメーションを実装。
 */
export const drawEnemyBear = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 攻撃アニメーションのシークエンス計算 (2.5秒周期)
	const attackCycle = (timestamp % 2500) / 2000;
	const isAttacking = attackCycle > 0.7;
	// 腕を大きく回転させるための補間値
	const armSwing = isAttacking
		? Math.sin(((attackCycle - 0.7) * Math.PI) / 0.3)
		: 0;

	// 足元の影 (巨体に合わせて大きく濃く描画)
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 25, stats.radius * 1.5, 8, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 3;
	ctx.fillStyle = stats.color;

	// 1. 胴体 (重厚なシルエットを角丸矩形で表現)
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

	// 2. 丸い耳 (頭部の左右に配置)
	ctx.beginPath();
	ctx.arc(-stats.radius * 0.7, -stats.radius * 1.5, 10, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(stats.radius * 0.7, -stats.radius * 1.5, 10, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 3. 顔のパーツ
	const faceX = stats.radius * 0.5;
	const faceY = -stats.radius * 0.8;
	ctx.fillStyle = "#333";
	// 小さな目 (巨体との対比で威圧感を出す)
	ctx.fillRect(faceX + 5, faceY, 5, 2);
	// 鼻
	ctx.beginPath();
	ctx.arc(faceX + 15, faceY + 10, 4, 0, Math.PI * 2);
	ctx.fill();

	// 4. 強力な腕のなぎ払い
	ctx.save();
	// 肩の位置を起点に回転移動
	ctx.translate(stats.radius * 0.5, faceY + 20);
	ctx.rotate(armSwing * -1.5); // マイナス方向（前方）へ大きく回転

	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.roundRect(0, -10, 50, 25, 10); // 前方に長く伸ばす
	ctx.fill();
	ctx.stroke();

	// 鋭い爪 (攻撃のインパクトの瞬間のみ視認性を上げる)
	if (isAttacking) {
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 2;
		// 3本の爪をループで描画
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
