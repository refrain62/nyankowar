import {
	type Dispatch,
	type RefObject,
	type SetStateAction,
	useCallback,
} from "react";
import { UNIT_TYPES } from "../constants/units";
import {
	CANVAS_HEIGHT,
	type GameState,
	type StageConfig,
	type UIState,
} from "../types/game";
import type { GameAudio } from "./useGameAudio";

/**
 * 【責任】ゲームのコントローラー（操作・統制レイヤー）。
 * ユーザーの意思（クリック、キー入力）をゲームの状態遷移や具体的なアクションに変換します。
 * 描画（View）や物理演算（System）を知る必要はなく、それらに「命令を下す」ことに特化します。
 */
export const useGameController = (
	stateRef: RefObject<GameState>,
	audio: GameAudio,
	setUi: Dispatch<SetStateAction<UIState>>,
	_currentStage: StageConfig,
	setCurrentStage: Dispatch<SetStateAction<StageConfig>>,
	currentStageRef: RefObject<StageConfig>,
) => {
	/**
	 * 状態遷移 (Transition):
	 * ゲームの状態を変更し、それに付随するBGMの停止・再開などの副作用を一元管理します。
	 */
	const transitionTo = useCallback(
		(nextState: GameState["gameState"]) => {
			const s = stateRef.current;
			if (!s) return;
			const prevState = s.gameState;
			s.gameState = nextState;
			setUi((prev) => ({ ...prev, gameState: nextState }));

			if (nextState === "start" || nextState === "title") {
				audio.stopBGM();
			} else if (nextState === "pause") {
				audio.pauseBGM();
			} else if (nextState === "play" && prevState === "pause") {
				audio.resumeBGM();
			}
		},
		[audio, stateRef, setUi],
	);

	/**
	 * ポーズのトグル: プレイ中とポーズ中を相互に行き来します。
	 */
	const togglePause = useCallback(() => {
		const s = stateRef.current;
		if (!s) return;
		if (s.gameState === "play") transitionTo("pause");
		else if (s.gameState === "pause") transitionTo("play");
	}, [transitionTo, stateRef]);

	/**
	 * ステージ選択画面への移動。
	 */
	const toStageSelect = useCallback(() => {
		audio.initAudio();
		audio.playSystemSE(660);
		transitionTo("start");
	}, [audio, transitionTo]);

	/**
	 * タイトル画面への帰還。
	 */
	const backToTitle = useCallback(() => transitionTo("title"), [transitionTo]);

	/**
	 * ゲームの開始（初期化）:
	 * 指定されたステージのパラメータで戦場をリセットし、BGMを開始します。
	 */
	const startGame = useCallback(
		(stage: StageConfig) => {
			setCurrentStage(stage);
			if (currentStageRef.current) {
				const mutRef = currentStageRef as { current: StageConfig };
				mutRef.current = stage;
			}
			audio.initAudio();
			const s = stateRef.current;
			if (!s) return;

			// パラメータのリセット
			s.baseHp = stage.baseHp;
			s.enemyBaseHp = stage.enemyBaseHp;
			s.money = 0;
			s.walletLevel = 1;
			s.allies = [];
			s.enemies = [];
			s.cannonCharge = 0;
			s.lastTime = 0;
			s.cooldowns = {
				BASIC: 0,
				TANK: 0,
				BATTLE: 0,
				LEGS: 0,
				COW: 0,
				BIRD: 0,
				FISH: 0,
				LIZARD: 0,
			};

			audio.playSystemSE(440);
			audio.startBGM(stage.id);
			transitionTo("play");
		},
		[audio, transitionTo, setCurrentStage, currentStageRef, stateRef],
	);

	/**
	 * ステージ中断（メニューへ戻る）。
	 */
	const backToMenu = useCallback(() => transitionTo("start"), [transitionTo]);

	/**
	 * ユニット召喚アクション:
	 * 所持金とクールダウンをチェックし、問題なければユニットを生成します。
	 */
	const handleSpawn = useCallback(
		(type: keyof typeof UNIT_TYPES) => {
			const s = stateRef.current;
			if (!s) return;
			if (s.money >= UNIT_TYPES[type].cost && s.cooldowns[type] <= 0) {
				s.money -= UNIT_TYPES[type].cost;
				s.cooldowns[type] = UNIT_TYPES[type].cooldown;

				// IDの生成（簡易版）
				const nextId = s.allies.length + s.enemies.length + 1;

				s.allies.push({
					id: nextId,
					x: 110,
					y: CANVAS_HEIGHT - 70,
					type: "ally",
					unitType: type as string,
					stats: UNIT_TYPES[type],
					currentHp: UNIT_TYPES[type].hp,
				});
				audio.playSystemSE(660);
			}
		},
		[audio, stateRef],
	);

	/**
	 * 働きネコのレベルアップアクション。
	 */
	const handleUpgrade = useCallback(() => {
		const s = stateRef.current;
		if (!s) return;
		const cost = s.walletLevel * 200;
		if (s.money >= cost && s.walletLevel < 8) {
			s.money -= cost;
			s.walletLevel++;
			audio.playUpgradeSound();
		}
	}, [audio, stateRef]);

	/**
	 * にゃんこ砲発射アクション:
	 * チャージが100%であれば、充填シークエンスを経て強力な範囲攻撃を実行します。
	 */
	const handleCannon = useCallback(() => {
		const s = stateRef.current;
		if (!s || s.cannonCharge < 100 || s.isCannonCharging) return;

		s.isCannonCharging = true;
		s.cannonCharge = 0;
		audio.playCannonChargeSound();

		setTimeout(() => {
			s.isCannonCharging = false;
			audio.playCannonExplosionSound();

			// 画面上の全敵ユニットに大ダメージとノックバック
			s.enemies = s.enemies
				.map((u) => ({ ...u, currentHp: u.currentHp - 150, x: u.x + 120 }))
				.filter((u) => u.currentHp > 0);
		}, 500);
	}, [audio, stateRef]);

	return {
		transitionTo,
		togglePause,
		toStageSelect,
		backToTitle,
		startGame,
		backToMenu,
		handleSpawn,
		handleUpgrade,
		handleCannon,
	};
};
