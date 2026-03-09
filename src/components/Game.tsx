import type React from "react";
import { useEffect, useRef, useState } from "react";
import { STAGES } from "../constants/stages";
import { useGameAudio } from "../hooks/useGameAudio";
import { useGameController } from "../hooks/useGameController";
import { useGameLoop } from "../hooks/useGameLoop";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	type GameState,
	type StageConfig,
	type UIState,
} from "../types/game";
import { ControlPanel } from "./UI/ControlPanel";
import { PauseOverlay } from "./UI/PauseOverlay";
import { ResultOverlay } from "./UI/ResultOverlay";
import { StageSelectOverlay } from "./UI/StageSelectOverlay";
import { TitleOverlay } from "./UI/TitleOverlay";

/**
 * 【責任】ゲームのメインView（UI）。
 * JSXによるレイアウト配置と、useGameControllerへのユーザーアクションの委譲を担当。
 * 純粋な「見た目」の管理に集中します。
 */
const Game: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const audio = useGameAudio();

	const [currentStage, setCurrentStage] = useState<StageConfig>(STAGES[1]);
	const currentStageRef = useRef(STAGES[1]);

	const stateRef = useRef<GameState>({
		money: 0,
		walletLevel: 1,
		baseHp: 1000,
		enemyBaseHp: 1000,
		allies: [],
		enemies: [],
		cannonCharge: 0,
		isCannonCharging: false,
		isCannonFiring: false,
		enemySpawnTimer: 0,
		unitCounts: {
			BASIC: 0,
			TANK: 0,
			BATTLE: 0,
			LEGS: 0,
			COW: 0,
			BIRD: 0,
			FISH: 0,
			LIZARD: 0,
		},
		cooldowns: {
			BASIC: 0,
			TANK: 0,
			BATTLE: 0,
			LEGS: 0,
			COW: 0,
			BIRD: 0,
			FISH: 0,
			LIZARD: 0,
		},
		lastTime: 0,
		lastAttackSoundTime: 0,
		gameState: "title",
	});

	const [ui, setUi] = useState<UIState>({
		money: 0,
		walletLevel: 1,
		baseHp: 1000,
		enemyBaseHp: 1000,
		cannonCharge: 0,
		gameState: "title",
		cooldownPercents: {
			BASIC: 100,
			TANK: 100,
			BATTLE: 100,
			LEGS: 100,
			COW: 100,
			BIRD: 100,
			FISH: 100,
			LIZARD: 100,
		},
	});

	// コントローラーの初期化（ロジックの抽出先）
	const {
		togglePause,
		toStageSelect,
		backToTitle,
		startGame,
		backToMenu,
		handleSpawn,
		handleUpgrade,
		handleCannon,
	} = useGameController(
		stateRef,
		audio,
		setUi,
		currentStage,
		setCurrentStage,
		currentStageRef,
	);

	// キーボードショートカット
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === "KeyP") togglePause();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [togglePause]);

	// ゲームのメインループ（計算と描画の開始）
	useGameLoop(canvasRef, stateRef, { current: audio }, currentStageRef, setUi);

	return (
		<div
			style={{
				textAlign: "center",
				backgroundColor: "#ecf0f1",
				minHeight: "100vh",
				padding: "20px",
				fontFamily: "sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					gap: "20px",
					marginBottom: "10px",
				}}
			>
				<h1>ねこねこ大戦争</h1>
				<button
					type="button"
					onClick={() => audio.setIsAudioEnabled(!audio.isAudioEnabled)}
					style={{
						padding: "8px 15px",
						borderRadius: "20px",
						border: "none",
						background: audio.isAudioEnabled ? "#e74c3c" : "#2ecc71",
						color: "#fff",
						cursor: "pointer",
					}}
				>
					SOUND: {audio.isAudioEnabled ? "OFF" : "ON"}
				</button>
			</div>

			<div
				style={{
					position: "relative",
					display: "inline-block",
					marginBottom: "20px",
				}}
			>
				<canvas
					ref={canvasRef}
					width={CANVAS_WIDTH}
					height={CANVAS_HEIGHT}
					style={{
						border: "4px solid #34495e",
						borderRadius: "15px",
						backgroundColor: "#fff",
						boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
					}}
				/>

				{/* 各種オーバーレイ */}
				{ui.gameState === "title" && <TitleOverlay onStart={toStageSelect} />}

				{ui.gameState === "start" && (
					<StageSelectOverlay
						onSelectStage={startGame}
						onBackToTitle={backToTitle}
					/>
				)}

				{ui.gameState === "play" && (
					<div
						style={{
							position: "absolute",
							top: "10px",
							right: "10px",
							display: "flex",
							gap: "5px",
						}}
					>
						<button
							type="button"
							onClick={togglePause}
							style={{
								padding: "5px 15px",
								background: "rgba(0,0,0,0.5)",
								color: "#fff",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
								fontSize: "12px",
							}}
						>
							PAUSE (P)
						</button>
						<button
							type="button"
							onClick={backToMenu}
							style={{
								padding: "5px 15px",
								background: "rgba(0,0,0,0.5)",
								color: "#fff",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
								fontSize: "12px",
							}}
						>
							QUIT
						</button>
					</div>
				)}

				{ui.gameState === "pause" && (
					<PauseOverlay
						currentStage={currentStage}
						onResume={togglePause}
						onRestart={startGame}
						onQuit={backToMenu}
					/>
				)}

				{(ui.gameState === "win" || ui.gameState === "lose") && (
					<ResultOverlay gameState={ui.gameState} onBackToMenu={backToMenu} />
				)}
			</div>

			{/* 下部操作パネル */}
			{ui.gameState === "play" && (
				<ControlPanel
					ui={ui}
					onSpawn={handleSpawn}
					onUpgrade={handleUpgrade}
					onCannon={handleCannon}
				/>
			)}
		</div>
	);
};

export default Game;
