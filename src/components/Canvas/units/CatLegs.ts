import type { UnitStats } from "../../../types/game";

/**
 * キモねこを描画する関数
 * 高い打点から、しなりながら伸びる「ムチ腕」のアニメーションが最大の特徴です。
 */
export const drawCatLegs = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 長い脚の基準となる高さ (100px)
	const legLength = 100;

	// 攻撃アニメーションの計算 (約1.5秒周期)
	const attackCycle = (timestamp % 1500) / 1500;
	// 周期の終盤（70%以降）で腕を高速に伸ばす
	const isExtending = attackCycle > 0.7;
	// イージング（sin）をかけた伸縮値 (0.0 ~ 1.0)
	const extension = isExtending
		? Math.sin(((attackCycle - 0.7) * Math.PI) / 0.3)
		: 0;

	// 1. 足元の影 (左右それぞれの足元。胴体ではなく足の位置に合わせる)
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(-15, 10, 10, 4, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(15, 10, 10, 4, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	// 攻撃（腕の伸長）に合わせて、体全体も少し前斜め下に沈み込ませる（反動の表現）
	ctx.translate(extension * 10, -legLength + extension * 5);

	// 2. 長い脚 (折れ曲がった関節を折れ線で表現)
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 3;
	ctx.beginPath();
	// 左脚: 関節(legLength/2)を経て地面(legLength)へ
	ctx.moveTo(-8, 0);
	ctx.lineTo(-12, legLength / 2);
	ctx.lineTo(-15, legLength);
	// 右脚
	ctx.moveTo(8, 0);
	ctx.lineTo(12, legLength / 2);
	ctx.lineTo(15, legLength);
	ctx.stroke();

	// 3. 伸縮ムチ腕
	ctx.lineWidth = 2;
	ctx.beginPath();

	const armStartX = 10;
	const armStartY = 0;
	// 伸びる先のターゲット座標 (地面に向かって鋭く突く)
	const targetX = 40 + extension * 100;
	const targetY = legLength - 5; // 地面スレスレ

	ctx.moveTo(armStartX, armStartY);
	// 三次ベジェ曲線による「しなり」の表現。
	// コントロールポイントを調整してムチのようなしなり軌道を動的に生成。
	ctx.bezierCurveTo(
		armStartX + 20,
		armStartY - 20, // 制御点1: 少し上に持ち上げる
		targetX - 20,
		targetY - 40, // 制御点2: 急角度で落とし込む
		targetX,
		targetY, // 終点
	);
	ctx.stroke();

	// 手の先 (拳。地面を叩くインパクトを表現)
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 4. 胴体 (高い位置に浮遊する球体)
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.arc(0, 0, stats.radius * 1.2, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 5. 耳 (高い位置に合わせて比率を調整)
	ctx.beginPath();
	ctx.moveTo(-stats.radius * 0.6, -stats.radius * 0.5);
	ctx.lineTo(-stats.radius * 1.1, -stats.radius * 1.3);
	ctx.lineTo(-stats.radius * 0.2, -stats.radius * 1.0);
	ctx.moveTo(stats.radius * 0.6, -stats.radius * 0.5);
	ctx.lineTo(stats.radius * 1.1, -stats.radius * 1.3);
	ctx.lineTo(stats.radius * 0.2, -stats.radius * 1.0);
	ctx.fill();
	ctx.stroke();

	// 6. 目 (無表情な小さい点)
	ctx.fillStyle = "#333";
	ctx.beginPath();
	ctx.arc(-stats.radius * 0.4, 0, 2, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(stats.radius * 0.4, 0, 2, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};
