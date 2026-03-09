import type React from "react";
import { UNIT_TYPES } from "../../constants/units";
import type { UIState } from "../../types/game";
import { GaugeButton } from "./GaugeButton";

interface ControlPanelProps {
	ui: UIState;
	onSpawn: (type: keyof typeof UNIT_TYPES) => void;
	onUpgrade: () => void;
	onCannon: () => void;
}

/**
 * 【責任】プレイ中の操作HUD（ヘッドアップディスプレイ）。
 * プレイヤーの主要なアクション（ユニット召喚、拠点強化、必殺技発動）を統合管理します。
 * UIステート（所持金、クールダウン、チャージ）を視覚的なボタンとゲージに変換し、リアルタイムな操作感を提供します。
 */
export const ControlPanel: React.FC<ControlPanelProps> = ({
	ui,
	onSpawn,
	onUpgrade,
	onCannon,
}) => {
	const unitTypes = [
		"BASIC",
		"TANK",
		"BATTLE",
		"LEGS",
		"COW",
		"BIRD",
		"FISH",
		"LIZARD",
	] as const;

	return (
		<div
			style={{
				maxWidth: "850px",
				margin: "0 auto",
				display: "flex",
				justifyContent: "center",
				gap: "20px",
				animation: "fadeIn 0.5s",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
				<GaugeButton
					label={
						<>
							にゃんこ砲
							<br />({ui.cannonCharge}%)
						</>
					}
					percent={ui.cannonCharge}
					onClick={onCannon}
					disabled={ui.cannonCharge < 100}
					readyColor="#e74c3c"
					gaugeColor="#f39c12"
					width="120px"
				/>
				<GaugeButton
					label={
						<>
							働きネコ Lv.{ui.walletLevel}
							<br />
							(${ui.walletLevel * 200})
						</>
					}
					percent={100}
					onClick={onUpgrade}
					disabled={ui.money < ui.walletLevel * 200 || ui.walletLevel >= 8}
					readyColor="#e67e22"
					gaugeColor="#e67e22"
					width="120px"
				/>
			</div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 120px)",
					gridTemplateRows: "repeat(2, auto)",
					gap: "10px",
				}}
			>
				{unitTypes.map((t) => {
					const percent = ui.cooldownPercents[t];
					const isReady = percent >= 100 && ui.money >= UNIT_TYPES[t].cost;
					return (
						<GaugeButton
							key={t}
							label={
								<>
									{UNIT_TYPES[t].name}
									<br />
									(${UNIT_TYPES[t].cost})
								</>
							}
							percent={percent}
							onClick={() => onSpawn(t)}
							disabled={!isReady}
							readyColor="#2ecc71"
							gaugeColor="#3498db"
							width="120px"
						/>
					);
				})}
			</div>
			<style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
		</div>
	);
};
