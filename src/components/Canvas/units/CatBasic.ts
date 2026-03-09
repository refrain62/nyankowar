import type { UnitStats } from "../../../types/game";

/**
 * 基本的なネコを描画する関数
 * 画像アセットを一切使わず、Canvas API のプリミティブ（円、矩形）のみで構成されています。
 */
export const drawCatBasic = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 歩行アニメーションの揺れ。Math.sin を利用して 0 を中心に上下に動かす。
	const walk = Math.sin(timestamp / 80) * 5;

	// 足元の影 (半透明の楕円)
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 15, stats.radius, 5, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.fillStyle = stats.color;
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2.5;

	// 1. 手足
	// 胴体より先に描画（レイヤーとして後ろに配置）することで、奥行きを表現しています。
	ctx.beginPath();
	// 後ろ側の足 (walkの値を反転させて交互に動くように見せる)
	ctx.rect(-12, 5, 5, 8 + walk);
	ctx.rect(7, 5, 5, 8 - walk);
	// 前側の足
	ctx.rect(-15, -5, 5, 8 - walk);
	ctx.rect(10, -5, 5, 8 + walk);
	ctx.fill();
	ctx.stroke();

	// 2. 胴体 (メインとなる円。stats.radius を基準にスケーリング)
	ctx.beginPath();
	ctx.arc(0, 0, stats.radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 3. 耳 (三角形のパスを組み合わせて作成)
	ctx.beginPath();
	// 左耳: 胴体の左上付近から外側へ伸ばす
	ctx.moveTo(-stats.radius * 0.6, -stats.radius * 0.5);
	ctx.lineTo(-stats.radius * 1.1, -stats.radius * 1.3);
	ctx.lineTo(-stats.radius * 0.2, -stats.radius * 1.0);
	// 右耳: 胴体の右上付近から外側へ伸ばす
	ctx.moveTo(stats.radius * 0.6, -stats.radius * 0.5);
	ctx.lineTo(stats.radius * 1.1, -stats.radius * 1.3);
	ctx.lineTo(stats.radius * 0.2, -stats.radius * 1.0);
	ctx.fill();
	ctx.stroke();

	// 4. 目 (縦長の矩形で「無表情」なかわいさを表現)
	ctx.fillStyle = "#333";
	// Y座標をわずかにマイナスすることで、顔の印象を少し上に持ち上げる
	ctx.fillRect(-stats.radius * 0.4, -3, 3, 7);
	ctx.fillRect(stats.radius * 0.2, -3, 3, 7);

	// ハイライト (目に生命を宿す白い点)
	ctx.fillStyle = "#fff";
	ctx.fillRect(-stats.radius * 0.4, -2, 1, 2);
	ctx.fillRect(stats.radius * 0.2, -2, 1, 2);

	ctx.restore();
};
