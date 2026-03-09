import type React from "react";
import { STAGES } from "../../constants/stages";
import type { StageConfig } from "../../types/game";

interface StageSelectOverlayProps {
	onSelectStage: (stage: StageConfig) => void;
	onBackToTitle: () => void;
}

/**
 * 【責任】ステージ選択のユーザーインターフェース。
 * プレイヤーが挑戦するステージを決定する画面です。
 * ステージリストを表示し、選択されたステージをゲームコントローラーへ渡します。
 */
export const StageSelectOverlay: React.FC<StageSelectOverlayProps> = ({
	onSelectStage,
	onBackToTitle,
}) => {
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				background: "rgba(0,0,0,0.6)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				borderRadius: "12px",
			}}
		>
			<div
				style={{
					background: "rgba(255,255,255,0.95)",
					padding: "20px 30px",
					borderRadius: "20px",
					boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
					textAlign: "center",
					maxWidth: "500px",
					border: "3px solid #2ecc71",
				}}
			>
				<h2
					style={{
						fontSize: "24px",
						color: "#2c3e50",
						marginBottom: "15px",
						marginTop: 0,
					}}
				>
					ステージ選択
				</h2>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "10px",
					}}
				>
					{Object.values(STAGES).map((stage) => (
						<button
							type="button"
							key={stage.id}
							onClick={() => onSelectStage(stage)}
							style={{
								padding: "12px 15px",
								fontSize: "14px",
								cursor: "pointer",
								borderRadius: "10px",
								background: stage.id % 2 === 0 ? "#e67e22" : "#2ecc71",
								color: "#fff",
								border: "none",
								fontWeight: "bold",
								boxShadow: "0 3px rgba(0,0,0,0.2)",
							}}
						>
							第{stage.id}章<br />
							{stage.name}
						</button>
					))}
				</div>
				<button
					type="button"
					onClick={onBackToTitle}
					style={{
						marginTop: "15px",
						background: "none",
						border: "none",
						color: "#7f8c8d",
						fontSize: "13px",
						textDecoration: "underline",
						cursor: "pointer",
					}}
				>
					タイトルへ戻る
				</button>
			</div>
		</div>
	);
};
