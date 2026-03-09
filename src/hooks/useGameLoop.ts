import { type RefObject, useEffect } from "react";
import { drawGame } from "../components/Canvas/renderer";
import { UNIT_TYPES } from "../constants/units";
import {
	processUnitsAndCombat,
	spawnEnemies,
	updateCooldowns,
	updateEconomy,
} from "../logic/gameSystems";
import type { GameState, StageConfig, UIState } from "../types/game";
import type { GameAudio } from "./useGameAudio";

interface GameStateRef {
	current: GameState;
}

interface AudioRef {
	current: GameAudio;
}

interface CurrentStageRef {
	current: StageConfig;
}

type SetUi = React.Dispatch<React.SetStateAction<UIState>>;

/**
 * ゲームのメインループを管理するカスタムフック。
 * 計算ロジックは src/logic/gameSystems.ts に委譲されています。
 */
export const useGameLoop = (
	canvasRef: RefObject<HTMLCanvasElement | null>,
	stateRef: GameStateRef,
	audioRef: AudioRef,
	currentStageRef: CurrentStageRef,
	setUi: SetUi,
) => {
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let requestID: number;

		const loop = (timestamp: number) => {
			const s = stateRef.current;
			if (!s.lastTime) s.lastTime = timestamp;
			let dt = timestamp - s.lastTime;
			if (dt > 100) dt = 100;
			s.lastTime = timestamp;

			// ゲームシステム（物理演算・経済等）の更新
			if (s.gameState === "play") {
				const dtSec = dt / 1000;
				const a = audioRef.current;
				const stage = currentStageRef.current;

				updateEconomy(s, dtSec);
				updateCooldowns(s, dtSec, a);
				spawnEnemies(s, dtSec, stage);
				processUnitsAndCombat(s, dtSec, a, stage, timestamp);
			}

			// 描画
			drawGame(ctx, s, currentStageRef.current, timestamp);

			// UI同期
			setUi({
				money: Math.floor(s.money),
				walletLevel: s.walletLevel,
				baseHp: s.baseHp,
				enemyBaseHp: s.enemyBaseHp,
				cannonCharge: Math.floor(s.cannonCharge),
				gameState: s.gameState,
				cooldownPercents: {
					BASIC: 100 - (s.cooldowns.BASIC / UNIT_TYPES.BASIC.cooldown) * 100,
					TANK: 100 - (s.cooldowns.TANK / UNIT_TYPES.TANK.cooldown) * 100,
					BATTLE: 100 - (s.cooldowns.BATTLE / UNIT_TYPES.BATTLE.cooldown) * 100,
					LEGS: 100 - (s.cooldowns.LEGS / UNIT_TYPES.LEGS.cooldown) * 100,
					COW: 100 - (s.cooldowns.COW / UNIT_TYPES.COW.cooldown) * 100,
					BIRD: 100 - (s.cooldowns.BIRD / UNIT_TYPES.BIRD.cooldown) * 100,
					FISH: 100 - (s.cooldowns.FISH / UNIT_TYPES.FISH.cooldown) * 100,
					LIZARD: 100 - (s.cooldowns.LIZARD / UNIT_TYPES.LIZARD.cooldown) * 100,
				},
			});

			requestID = requestAnimationFrame(loop);
		};

		requestID = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(requestID);
	}, [canvasRef, stateRef, audioRef, currentStageRef, setUi]);
};
