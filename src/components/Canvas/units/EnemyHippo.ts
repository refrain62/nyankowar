import type { UnitStats } from "../../../types/game";

/**
 * 敵：カバちゃんを描画する関数
 * 右向きにパーツを配置。renderer側の ctx.scale(-1, 1) によって左を向いて進む仕様。
 */
export const drawEnemyHippo = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 攻撃アニメーションの周期計算 (2秒周期)
	const attackCycle = (timestamp % 2000) / 2000;
	const isAttacking = attackCycle > 0.8; // 周期の終盤で口を開ける

	// 足元の影
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 20, stats.radius * 1.5, 6, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2.5;
	ctx.fillStyle = stats.color;

	// 1. 巨大な胴体 (角丸矩形でどっしり感を表現)
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

	// 2. 四本足 (歩行リズムに合わせて上下させる)
	const legY = stats.radius * 0.8;
	const walkOffset = Math.sin(timestamp / 100) * 3;
	// 足を1本ずつ個別のパスで描画
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

	// 3. 頭部（あごの開閉）
	ctx.save();
	// 攻撃時に頭全体を少し前に突き出す演出
	ctx.translate(
		stats.radius * 0.5 + (isAttacking ? 5 : 0),
		-stats.radius * 0.8,
	);

	// 3a. 上あご (鼻と目を含むパーツ)
	ctx.save();
	// 攻撃時にわずかに上に跳ね上げる
	ctx.rotate(isAttacking ? -0.3 : 0);
	ctx.beginPath();
	ctx.roundRect(-10, -25, 60, 30, 8); // 右（前方）へ大きく伸ばす
	ctx.fill();
	ctx.stroke();
	// 鼻の穴
	ctx.fillStyle = "#333";
	ctx.beginPath();
	ctx.arc(35, -15, 3, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(20, -15, 3, 0, Math.PI * 2);
	ctx.fill();
	// 小さな目
	ctx.fillRect(5, -20, 4, 2);
	ctx.restore();

	// 3b. 下あご (攻撃時に大きく開く)
	ctx.save();
	ctx.translate(0, 5); // 上あごとの接点
	ctx.rotate(isAttacking ? 0.5 : 0); // 下方向へ回転
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.roundRect(-8, 0, 55, 15, 5);
	ctx.fill();
	ctx.stroke();
	// 鋭い牙 (攻撃時のみ出現)
	if (isAttacking) {
		ctx.fillStyle = "#fff";
		// 2本の牙を描画
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

	// 4. 耳 (胴体の後方上部に配置)
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.arc(-stats.radius * 0.5, -stats.radius * 0.8, 6, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	ctx.restore();
};
