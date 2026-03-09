import type { UnitStats } from "../../../types/game";

/**
 * ネコトカゲを描画する関数
 * 長い胴体と尻尾、そして圧倒的な「火炎放射 (Fire Blast)」のエフェクトが最大の特徴。
 */
export const drawCatLizard = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 4本の足を順番に動かす歩行アニメーション
	const walk = Math.sin(timestamp / 80) * 3;

	// 攻撃シークエンスの計算 (2秒周期)
	const attackCycle = (timestamp % 2000) / 2000;
	// 60%~95%のタイミングで火を噴く
	const isFiring = attackCycle > 0.6 && attackCycle < 0.95;
	const firePower = isFiring
		? Math.sin(((attackCycle - 0.6) * Math.PI) / 0.35)
		: 0;

	// 足元の影
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 15, stats.radius * 2, 6, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2.5;
	ctx.fillStyle = stats.color;

	// 1. 四本足 (トカゲらしい這うような低い配置)
	ctx.beginPath();
	ctx.rect(-20, 5, 5, 8 + walk);
	ctx.rect(-5, 5, 5, 8 - walk);
	ctx.rect(10, 5, 5, 8 + walk);
	ctx.rect(25, 5, 5, 8 - walk);
	ctx.fill();
	ctx.stroke();

	// 2. 尻尾 (二次ベジェ曲線で大きくしなり、スイングさせる)
	const tailSwing = Math.sin(timestamp / 80) * 10;
	ctx.beginPath();
	ctx.moveTo(-15, 0); // 胴体後部
	ctx.quadraticCurveTo(-45, -35 + tailSwing, -70, 10 + tailSwing);
	ctx.stroke();

	// 3. 胴体 (トカゲ特有の低い重心を表現する楕円)
	ctx.beginPath();
	ctx.ellipse(0, 5, stats.radius * 1.8, stats.radius * 0.8, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 4. 背中のトゲ (ループで3つ描画。爬虫類らしさを強調)
	ctx.fillStyle = "#1e8449";
	for (let i = 0; i < 3; i++) {
		ctx.beginPath();
		ctx.moveTo(-15 + i * 15, -2); // 胴体上部
		ctx.lineTo(-7 + i * 15, -18); // 先端
		ctx.lineTo(0 + i * 15, -2);
		ctx.fill();
		ctx.stroke();
	}

	// 5. 頭部 (攻撃時にグイッと前に乗り出す演出)
	ctx.save();
	// firePower（火を噴く勢い）に合わせて、首を前に伸ばし、少し沈み込ませる
	ctx.translate(firePower * 15, -firePower * 5);
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.arc(stats.radius * 1.6, -8, stats.radius * 0.75, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 耳・目
	ctx.beginPath();
	ctx.moveTo(stats.radius * 1.3, -14);
	ctx.lineTo(stats.radius * 1.0, -24);
	ctx.lineTo(stats.radius * 1.7, -18);
	ctx.moveTo(stats.radius * 1.9, -14);
	ctx.lineTo(stats.radius * 2.2, -24);
	ctx.lineTo(stats.radius * 1.5, -18);
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = "#333";
	ctx.beginPath();
	ctx.arc(stats.radius * 1.9, -10, 2.5, 0, Math.PI * 2);
	ctx.fill();

	// 6. 火炎放射 (Fire Blast) エフェクト
	// 複数のレイヤーとグラデーションを重ねて「熱量」を表現
	if (isFiring) {
		const headX = stats.radius * 2.3; // 口の位置
		const headY = -8;
		const fireReach = firePower * 120; // 射程距離。firePowerに連動して伸びる
		const flicker = Math.sin(timestamp / 20) * 5; // 激しい火の粉の揺らぎ

		// レイヤー1: 外側の赤いゆらめき (広範囲な炎の熱気)
		ctx.fillStyle = "#e74c3c";
		ctx.beginPath();
		ctx.moveTo(headX, headY);
		// 上側の輪郭
		ctx.bezierCurveTo(
			headX + fireReach * 0.5,
			headY - 40 + flicker,
			headX + fireReach,
			headY - 20,
			headX + fireReach,
			headY,
		);
		// 下側の輪郭
		ctx.bezierCurveTo(
			headX + fireReach,
			headY + 20,
			headX + fireReach * 0.5,
			headY + 40 - flicker,
			headX,
			headY,
		);
		ctx.fill();

		// レイヤー2: 内側の高温部 (グラデーションによるコアの表現)
		const fireGrad = ctx.createLinearGradient(
			headX,
			headY,
			headX + fireReach,
			headY,
		);
		fireGrad.addColorStop(0, "#f1c40f"); // 吐き出し口付近は超高温(黄色)
		fireGrad.addColorStop(0.6, "#e67e22"); // 中間は燃焼中(オレンジ)
		fireGrad.addColorStop(1, "rgba(231, 76, 60, 0)"); // 先端は空気と混ざり消える(赤から透明へ)

		ctx.fillStyle = fireGrad;
		ctx.beginPath();
		ctx.moveTo(headX, headY);
		ctx.quadraticCurveTo(
			headX + fireReach * 0.5,
			headY - 20,
			headX + fireReach * 0.8,
			headY,
		);
		ctx.quadraticCurveTo(headX + fireReach * 0.5, headY + 20, headX, headY);
		ctx.fill();

		// レイヤー3: 最中心部 (白い光。最も熱い火炎の核)
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.ellipse(
			headX + 10,
			headY,
			15 * firePower, // 勢いに合わせて膨らむ
			5 * firePower,
			0,
			0,
			Math.PI * 2,
		);
		ctx.fill();
	}
	ctx.restore();

	ctx.restore();
};
