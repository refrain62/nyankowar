import type { UnitStats } from "../../../types/game";

/**
 * タンクネコを描画する関数
 * 壁役としての「重厚感」を出すため、縦長のシルエットが特徴。
 */
export const drawCatTank = (
	ctx: CanvasRenderingContext2D,
	stats: UnitStats,
	timestamp: number,
) => {
	// ゆっくりとした歩行揺れ。重々しさを出すため、周波数を低めに設定。
	const walk = Math.sin(timestamp / 100) * 3;

	// 足元の影 (安定感を出すために少し広めに描画)
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.beginPath();
	ctx.ellipse(0, 10, stats.radius * 1.2, 6, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.save();
	ctx.fillStyle = stats.color;
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 3;

	// 1. 短い足 (安定した土台を表現するため、胴体の下部に配置)
	ctx.beginPath();
	ctx.rect(-15, 5, 6, 10 + walk);
	ctx.rect(10, 5, 6, 10 - walk);
	ctx.fill();
	ctx.stroke();

	// 2. 縦長い胴体 (丸みを帯びた矩形 roundRect を使用)
	ctx.beginPath();
	ctx.roundRect(
		-stats.radius * 0.8, // 中央から左右に均等に広げる
		-stats.radius * 2.5, // 負のY方向（上方向）へ大きく伸ばす
		stats.radius * 1.6, // 胴体の幅
		stats.radius * 2.8, // 胴体の全高
		12, // 四隅の角丸
	);
	ctx.fill();
	ctx.stroke();

	// 3. 耳 (胴体の頂点付近に配置)
	const earY = -stats.radius * 2.5;
	ctx.beginPath();
	ctx.moveTo(-stats.radius * 0.6, earY);
	ctx.lineTo(-stats.radius * 1.0, earY - 15);
	ctx.lineTo(-stats.radius * 0.2, earY - 10);
	ctx.moveTo(stats.radius * 0.6, earY);
	ctx.lineTo(stats.radius * 1.0, earY - 15);
	ctx.lineTo(stats.radius * 0.2, earY - 10);
	ctx.fill();
	ctx.stroke();

	// 4. 目 (他のネコより少し横長にし、「耐え忍ぶ」表情を演出)
	ctx.fillStyle = "#333";
	const eyeY = -stats.radius * 1.8;
	ctx.fillRect(-stats.radius * 0.4, eyeY, 4, 3);
	ctx.fillRect(stats.radius * 0.1, eyeY, 4, 3);

	ctx.restore();
};
