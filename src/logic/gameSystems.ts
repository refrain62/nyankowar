import { UNIT_TYPES } from "../constants/units";
import type { GameAudio } from "../hooks/useGameAudio";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	type GameState,
	type StageConfig,
} from "../types/game";

/**
 * 【責任】ゲームのコア・シミュレーションロジック。
 * ReactのレンダリングサイクルやCanvasの描画命令から完全に独立し、
 * 純粋な「数値計算」と「状態更新」のみを担当します。
 * これにより、ゲームバランスの調整やロジックのテストが容易になります。
 */

/**
 * 経済システム: 所持金とキャノンチャージの更新。
 * 働きネコのレベル（walletLevel）に応じて毎秒の収入が増加します。
 */
export const updateEconomy = (s: GameState, dt: number) => {
	s.money += (30 + s.walletLevel * 20) * dt;
	if (s.cannonCharge < 100 && !s.isCannonCharging) {
		// 約30秒でフルチャージされる計算
		s.cannonCharge = Math.min(100, s.cannonCharge + dt * 3.3);
	}
};

/**
 * クールダウンシステム: ユニット再生産までの残り時間を減算。
 * クールダウンが完了（準備OK）した瞬間にシステムSEを再生します。
 */
export const updateCooldowns = (s: GameState, dt: number, a: GameAudio) => {
	for (const k of Object.keys(s.cooldowns)) {
		const wasReady = s.cooldowns[k] <= 0;
		s.cooldowns[k] = Math.max(0, s.cooldowns[k] - dt * 1000);
		if (!wasReady && s.cooldowns[k] <= 0) {
			a.playCharinSound(); // ユーザーへの聴覚的フィードバック
		}
	}
};

/**
 * スポーンシステム: 敵ユニットの自動生成。
 * ステージ難易度（enemyHpMultiplier）と出現頻度（enemySpawnRate）に基づき、
 * ランダムに敵キャラクターを選択して戦場に投入します。
 */
export const spawnEnemies = (s: GameState, dt: number, stage: StageConfig) => {
	s.enemySpawnTimer += dt * 1000;
	if (s.enemySpawnTimer > stage.enemySpawnRate) {
		const rand = Math.random();
		let enemyType: string;
		// 出現確率の定義: BEAR(5%), HIPPO(15%), SNAKE(30%), DOG(50%)
		if (rand < 0.05) enemyType = "BEAR";
		else if (rand < 0.2) enemyType = "HIPPO";
		else if (rand < 0.5) enemyType = "SNAKE";
		else enemyType = "ENEMY";

		const stats = { ...UNIT_TYPES[enemyType] };
		stats.hp *= stage.enemyHpMultiplier; // ステージによる難易度補正

		// IDの生成（簡易版）
		const nextId = s.allies.length + s.enemies.length + 1;

		s.enemies.push({
			id: nextId,
			x: CANVAS_WIDTH - 110,
			y: CANVAS_HEIGHT - 70,
			type: "enemy",
			unitType: enemyType,
			stats,
			currentHp: stats.hp,
		});
		s.enemySpawnTimer = 0;
	}
};

/**
 * 戦闘・物理システム: ユニットの移動、射程判定、ダメージ計算、および拠点（城）の攻防。
 * この関数が1フレーム内での全ユニットの相互作用を決定します。
 */
export const processUnitsAndCombat = (
	s: GameState,
	dt: number,
	a: GameAudio,
	_stage: StageConfig,
	timestamp: number,
) => {
	let someoneIsAttacking = false;

	// 味方の更新
	s.allies = s.allies
		.map((u) => {
			let dmgTaken = 0;
			let isAtk = false;

			// 衝突判定: 敵ユニットが射程内にいるか
			for (const enemy of s.enemies) {
				if (Math.abs(enemy.x - u.x) < u.stats.range) {
					isAtk = true;
					break;
				}
			}

			// 敵からの被ダメージ
			for (const enemy of s.enemies) {
				if (Math.abs(u.x - enemy.x) < enemy.stats.range) {
					dmgTaken += enemy.stats.damage * dt;
				}
			}

			// 敵拠点への攻撃
			if (u.x > CANVAS_WIDTH - 150) {
				s.enemyBaseHp = Math.max(0, s.enemyBaseHp - u.stats.damage * dt);
				if (s.enemyBaseHp <= 0 && s.gameState === "play") {
					s.gameState = "win";
					a.stopBGM();
					a.playVictoryFanfare();
				}
				isAtk = true;
			}

			if (isAtk) someoneIsAttacking = true;
			let nx = u.x;
			if (!isAtk) nx += u.stats.speed * (dt * 60);

			return { ...u, x: nx, currentHp: u.currentHp - dmgTaken };
		})
		.filter((u) => u.currentHp > 0);

	// 敵の更新
	s.enemies = s.enemies
		.map((u) => {
			let dmgTaken = 0;
			let isAtk = false;

			// 衝突判定: 味方ユニットが射程内にいるか
			for (const ally of s.allies) {
				if (Math.abs(ally.x - u.x) < u.stats.range) {
					isAtk = true;
					break;
				}
			}

			// 味方からの被ダメージ
			for (const ally of s.allies) {
				if (Math.abs(u.x - ally.x) < ally.stats.range) {
					dmgTaken += ally.stats.damage * dt;
				}
			}

			// 味方拠点への攻撃
			if (u.x < 150) {
				s.baseHp = Math.max(0, s.baseHp - u.stats.damage * dt);
				if (s.baseHp <= 0 && s.gameState === "play") {
					s.gameState = "lose";
					a.stopBGM();
					a.playDefeatJingle();
				}
				isAtk = true;
			}

			if (isAtk) someoneIsAttacking = true;
			let nx = u.x;
			if (!isAtk) nx -= u.stats.speed * (dt * 60);

			return { ...u, x: nx, currentHp: u.currentHp - dmgTaken };
		})
		.filter((u) => u.currentHp > 0);

	// 戦闘音の再生タイミング制御
	if (someoneIsAttacking && timestamp - s.lastAttackSoundTime > 300) {
		a.playGashiSound();
		s.lastAttackSoundTime = timestamp;
	}
};
