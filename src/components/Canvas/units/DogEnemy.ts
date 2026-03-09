import type { UnitStats } from "../../../types/game";

/**
 * 敵：わんこを描画する関数
 * 基本的な敵ユニットとして、シンプルながら威圧感のある赤い目が特徴。
 */
export const drawDogEnemy = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
) => {
	// 足元の影
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 15, stats.radius * 1.2, 5, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = stats.color;
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2.5;

	// 1. 体 (横長の楕円)
	ctx.beginPath();
	ctx.ellipse(0, 0, stats.radius * 1.2, stats.radius, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 2. 耳 (左右の垂れ耳を円で表現)
	ctx.fillStyle = "#2c3e50"; // 耳だけ少し暗い色
	// 左耳
	ctx.beginPath();
	ctx.arc(-stats.radius * 0.8, -stats.radius * 0.5, 8, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	// 右耳
	ctx.beginPath();
	ctx.arc(stats.radius * 0.8, -stats.radius * 0.5, 8, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 3. 鼻 (顔の先端寄りに配置)
	ctx.fillStyle = "#17202a";
	ctx.beginPath();
	ctx.arc(stats.radius * 0.6, 5, 4, 0, Math.PI * 2);
	ctx.fill();

	// 4. 目 (攻撃的な赤い光。小さなハイライトで生命感を出す)
	ctx.fillStyle = "#ff0000";
	// 右目
	ctx.beginPath();
	ctx.arc(stats.radius * 0.3, -5, 4, 0, Math.PI * 2);
	ctx.fill();
	// 左目
	ctx.beginPath();
	ctx.arc(-stats.radius * 0.1, -5, 4, 0, Math.PI * 2);
	ctx.fill();
	// ハイライト (白い点)
	ctx.fillStyle = "#fff";
	ctx.beginPath();
	ctx.arc(stats.radius * 0.35, -6, 1, 0, Math.PI * 2);
	ctx.fill();
};
