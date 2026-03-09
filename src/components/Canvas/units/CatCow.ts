import type { UnitStats } from "../../../types/game";

/**
 * ウシねこを描画する関数
 * 横向きの牛の胴体に、正面を向いたネコ顔が乗っているシュールなデザイン。
 */
export const drawCatCow = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// 足のパカパカした歩行アニメーション (4本足を交互に動かす)
	const walkCycle = Math.sin(timestamp / 80) * 5;

	// 足元の影 (4本足全体をカバーする幅広の楕円)
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 15, stats.radius * 1.8, 6, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2.5;
	ctx.fillStyle = stats.color;

	// 1. 牛の胴体 (横に長い楕円。stats.radius をベースにスケーリング)
	ctx.beginPath();
	ctx.ellipse(-5, 0, stats.radius * 1.5, stats.radius * 0.9, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 2. 四本足 (胴体の下側に均等に配置)
	ctx.beginPath();
	// 後ろ足2本 (walkCycleを反転させてリズムを作る)
	ctx.rect(-stats.radius * 1.2, 5, 6, 10 + walkCycle);
	ctx.rect(-stats.radius * 0.8, 5, 6, 10 - walkCycle);
	// 前足2本
	ctx.rect(stats.radius * 0.2, 5, 6, 10 + walkCycle);
	ctx.rect(stats.radius * 0.6, 5, 6, 10 - walkCycle);
	ctx.fill();
	ctx.stroke();

	// 3. 尻尾 (二次ベジェ曲線でしなりを表現)
	ctx.beginPath();
	ctx.moveTo(-stats.radius * 1.5, -5);
	ctx.quadraticCurveTo(-stats.radius * 2.0, -15, -stats.radius * 1.8, 5);
	ctx.stroke();

	// 4. 牛柄 (黒い斑点。胴体の上にバランスよく配置)
	ctx.fillStyle = "#333";
	ctx.beginPath();
	ctx.arc(-15, -5, 7, 0, Math.PI * 2); // 大きな斑点1
	ctx.fill();
	ctx.beginPath();
	ctx.arc(5, 2, 5, 0, Math.PI * 2); // 小さな斑点2
	ctx.fill();

	// 5. ネコ顔 (正面を向いて胴体の先端に乗っている)
	ctx.save();
	// 顔の配置位置を調整 (胴体の右端かつ少し上)
	ctx.translate(stats.radius * 1.2, -stats.radius * 0.5);

	// 顔の輪郭 (完璧な円形)
	ctx.fillStyle = stats.color;
	ctx.beginPath();
	ctx.arc(0, 0, stats.radius * 0.8, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 角 (牛の象徴。グラデーションで立体感を演出)
	const hornGrad = ctx.createLinearGradient(0, -5, 0, -15);
	hornGrad.addColorStop(0, "#f1c40f");
	hornGrad.addColorStop(1, "#f39c12");
	ctx.fillStyle = hornGrad;
	// 左角
	ctx.beginPath();
	ctx.moveTo(-8, -5);
	ctx.lineTo(-12, -18);
	ctx.lineTo(-4, -8);
	ctx.fill();
	ctx.stroke();
	// 右角
	ctx.beginPath();
	ctx.moveTo(8, -5);
	ctx.lineTo(12, -18);
	ctx.lineTo(4, -8);
	ctx.fill();
	ctx.stroke();

	// ネコ目 (ウシねこ特有の無機質な視線を矩形で表現)
	ctx.fillStyle = "#333";
	ctx.fillRect(-6, -2, 3, 6);
	ctx.fillRect(2, -2, 3, 6);
	// ハイライト
	ctx.fillStyle = "#fff";
	ctx.fillRect(-6, -1, 1, 2);
	ctx.fillRect(2, -1, 1, 2);

	ctx.restore();

	ctx.restore();
};
