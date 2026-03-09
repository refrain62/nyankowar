import type React from "react";

interface TitleOverlayProps {
	onStart: () => void;
}

/**
 * 【責任】タイトル画面のオーバーレイ表示。
 * ユーザーをゲームの世界観に引き込み、ゲーム開始（ステージ選択）への動線を担当します。
 * 背景を透過させ、背後で動くタイトルデモを活かしつつ、インタラクティブな開始ボタンを提供します。
 */
export const TitleOverlay: React.FC<TitleOverlayProps> = ({ onStart }) => {
	return (
		<button
			type="button"
			onClick={onStart}
			onKeyDown={(e) => e.key === "Enter" && onStart()}
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				background: "rgba(255,255,255,0)",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				alignItems: "center",
				borderRadius: "12px",
				cursor: "pointer",
				padding: "40px 0",
				border: "none",
			}}
		>
			<div
				style={{
					background: "rgba(255,255,255,0.9)",
					padding: "20px 40px",
					borderRadius: "20px",
					boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
					border: "4px solid #2c3e50",
					marginTop: "20px",
				}}
			>
				<h2
					style={{
						fontSize: "50px",
						color: "#2c3e50",
						margin: 0,
						textShadow: "2px 2px 0 #fff, 4px 4px 0 #bdc3c7",
					}}
				>
					ねこねこ大戦争
				</h2>
			</div>
			<div
				style={{
					marginBottom: "60px",
					background: "linear-gradient(to bottom, #f1c40f, #f39c12)",
					padding: "5px 15px",
					borderRadius: "10px",
					boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
					border: "3px solid #fff",
					outline: "2px solid #2c3e50",
					animation: "blink 1.2s infinite",
				}}
			>
				<p
					style={{
						fontSize: "22px",
						color: "#fff",
						fontWeight: "900",
						margin: 0,
						letterSpacing: "2px",
						textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
					}}
				>
					CLICK TO START
				</p>
			</div>
			<style>{`@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }`}</style>
		</button>
	);
};
