import type { UnitStats } from "../../../types/game";

/**
 * ネコフィッシュを描画する関数
 * 魚の胴体にネコの手足が生え、先端にネコ顔がついているハイブリッドデザイン。
 */
export const drawCatFish = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 尾びれと手足の独立したアニメーション周期
	const wave = Math.sin(timestamp / 100) * 5;
	const walk = Math.sin(timestamp / 80) * 4;

	// 足元の影 (横に長い胴体をカバー)
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 15, stats.radius * 1.8, 5, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2.5;
	ctx.fillStyle = stats.color; // 魚らしい淡い色合い

	// 1. 魚の胴体 (流線型の楕円)
	ctx.beginPath();
	ctx.ellipse(0, 0, stats.radius * 1.6, stats.radius, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 2. 尾びれ (Math.rotate を使ったしなやかな揺れ)
	ctx.save();
	// 胴体の左端(後ろ側)に起点を移動
	ctx.translate(-stats.radius * 1.6, 0);
	ctx.rotate(wave * 0.05);
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(-stats.radius * 0.8, -15);
	ctx.lineTo(-stats.radius * 0.5, 0);
	ctx.lineTo(-stats.radius * 0.8, 15);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.restore();

	// 3. 背びれ
	ctx.beginPath();
	ctx.moveTo(0, -stats.radius);
	ctx.lineTo(-15, -stats.radius - 12);
	ctx.lineTo(10, -stats.radius - 5);
	ctx.fill();
	ctx.stroke();

	// 4. ネコの手足 (魚の腹部から生やすことで「地上を歩く魚」を表現)
	ctx.beginPath();
	// 前足
	ctx.rect(stats.radius * 0.3, stats.radius * 0.5, 6, 8 + walk);
	// 後ろ足
	ctx.rect(-stats.radius * 0.8, stats.radius * 0.5, 6, 8 - walk);
	ctx.fill();
	ctx.stroke();

	// 5. ネコ顔 (正面を向いて魚の「頭部」として配置)
	ctx.save();
	// 配置位置を魚の先端(右側)に調整
	ctx.translate(stats.radius * 1.2, -stats.radius * 0.2);

	// 顔の輪郭
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.arc(0, 0, stats.radius * 0.75, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 耳 (上部左右にピンと立てる)
	ctx.beginPath();
	// 左耳
	ctx.moveTo(-stats.radius * 0.4, -stats.radius * 0.4);
	ctx.lineTo(-stats.radius * 0.7, -stats.radius * 0.9);
	ctx.lineTo(-stats.radius * 0.1, -stats.radius * 0.7);
	// 右耳
	ctx.moveTo(stats.radius * 0.4, -stats.radius * 0.4);
	ctx.lineTo(stats.radius * 0.7, -stats.radius * 0.9);
	ctx.lineTo(stats.radius * 0.1, -stats.radius * 0.7);
	ctx.fill();
	ctx.stroke();

	// 目 (無表情な矩形)
	ctx.fillStyle = "#333";
	ctx.fillRect(-5, -2, 3, 6);
	ctx.fillRect(2, -2, 3, 6);
	// ハイライト
	ctx.fillStyle = "#fff";
	ctx.fillRect(-5, -1, 1, 2);
	ctx.fillRect(2, -1, 1, 2);

	ctx.restore();

	ctx.restore();
};
