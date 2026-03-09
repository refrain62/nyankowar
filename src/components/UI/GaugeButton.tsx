import type React from "react";

/**
 * ゲージ演出付きの汎用ボタンコンポーネント
 *
 * ユニットのクールタイムやにゃんこ砲のチャージを、
 * 背景のグラデーションが下から上へ溜まる演出で表現します。
 */
interface GaugeButtonProps {
	onClick: () => void; // クリック時の処理
	disabled: boolean; // ボタンを無効化するかどうか
	label: React.ReactNode; // ボタン内に表示する内容 (テキストやHTML)
	percent: number; // ゲージの溜まり具合 (0 to 100)
	readyColor: string; // チャージ完了時の背景色
	gaugeColor: string; // チャージ中のゲージの色
	width?: string; // ボタンの幅 (デフォルト 140px)
}

export const GaugeButton: React.FC<GaugeButtonProps> = ({
	onClick,
	disabled,
	label,
	percent,
	readyColor,
	gaugeColor,
	width = "140px",
}) => {
	// 100%溜まっていて、かつ無効化されていない場合に「準備完了」とする
	const isReady = percent >= 100 && !disabled;

	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			style={{
				padding: "15px",
				width,
				// 準備完了時は単色、チャージ中はグラデーションでゲージを表現
				background: isReady
					? readyColor
					: `linear-gradient(to top, ${gaugeColor} ${percent}%, #95a5a6 ${percent}%)`,
				color: "#fff",
				border: "none",
				borderRadius: "8px",
				cursor: isReady ? "pointer" : "default",
				fontWeight: "bold",
				overflow: "hidden",
				position: "relative",
				boxShadow: isReady ? "0 4px #27ae60" : "none", // 準備完了時のみ影をつけて立体感を出す
			}}
		>
			{/* 文字がゲージに埋もれないよう、前面に配置 */}
			<span style={{ position: "relative", zIndex: 1 }}>{label}</span>
		</button>
	);
};
