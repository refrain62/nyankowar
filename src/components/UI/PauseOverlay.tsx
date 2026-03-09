import type React from "react";
import type { StageConfig } from "../../types/game";

interface PauseOverlayProps {
	currentStage: StageConfig;
	onResume: () => void;
	onRestart: (stage: StageConfig) => void;
	onQuit: () => void;
}

/**
 * 【責任】一時停止（ポーズ）メニュー。
 * ゲームプレイを一時中断し、プレイヤーに「続行」「再試行」「終了」の選択肢を提示します。
 * ゲーム状態を保持したまま、操作をブロッキングする役割を担います。
 */
export const PauseOverlay: React.FC<PauseOverlayProps> = ({
	currentStage,
	onResume,
	onRestart,
	onQuit,
}) => {
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				background: "rgba(0,0,0,0.5)",
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
					fontSize: "40px",
					marginBottom: "20px",
					textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
				}}
			>
				PAUSED
			</h2>
			<div style={{ display: "flex", gap: "15px" }}>
				<button
					type="button"
					onClick={onResume}
					style={{
						padding: "12px 25px",
						fontSize: "18px",
						cursor: "pointer",
						borderRadius: "10px",
						background: "#2ecc71",
						color: "#fff",
						border: "none",
						fontWeight: "bold",
						boxShadow: "0 4px #27ae60",
					}}
				>
					RESUME
				</button>
				<button
					type="button"
					onClick={() => onRestart(currentStage)}
					style={{
						padding: "12px 25px",
						fontSize: "18px",
						cursor: "pointer",
						borderRadius: "10px",
						background: "#f39c12",
						color: "#fff",
						border: "none",
						fontWeight: "bold",
						boxShadow: "0 4px #d35400",
					}}
				>
					RESTART
				</button>
				<button
					type="button"
					onClick={onQuit}
					style={{
						padding: "12px 25px",
						fontSize: "18px",
						cursor: "pointer",
						borderRadius: "10px",
						background: "#e74c3c",
						color: "#fff",
						border: "none",
						fontWeight: "bold",
						boxShadow: "0 4px #c0392b",
					}}
				>
					QUIT
				</button>
			</div>
		</div>
	);
};
