import type React from "react";

interface ResultOverlayProps {
	gameState: "win" | "lose";
	onBackToMenu: () => void;
}

/**
 * 【責任】ゲーム終了時の結果（勝利/敗北）表示。
 * ステージクリアまたは失敗の判定結果を受け取り、プレイヤーに視覚的なフィードバックを提供します。
 * メニュー画面に戻るためのナビゲーションも担当します。
 */
export const ResultOverlay: React.FC<ResultOverlayProps> = ({
	gameState,
	onBackToMenu,
}) => {
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				background: "rgba(0,0,0,0.7)",
				color: "#fff",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				borderRadius: "12px",
			}}
		>
			<h2
				style={{
					fontSize: "60px",
					color: gameState === "win" ? "#f1c40f" : "#e74c3c",
				}}
			>
				{gameState === "win" ? "VICTORY" : "DEFEAT"}
			</h2>
			<button
				type="button"
				onClick={onBackToMenu}
				style={{
					padding: "15px 40px",
					fontSize: "24px",
					cursor: "pointer",
					borderRadius: "8px",
					background: "#3498db",
					color: "#fff",
					border: "none",
					fontWeight: "bold",
				}}
			>
				BACK TO MENU
			</button>
		</div>
	);
};
