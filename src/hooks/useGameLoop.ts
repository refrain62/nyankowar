import { useEffect, RefObject } from 'react';
import { type Unit, type StageConfig, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types/game';
import { UNIT_TYPES } from '../constants/units';
import { drawGame } from '../components/Canvas/renderer';
import { GameAudio } from './useGameAudio';

// GameコンポーネントのstateRefの型定義
interface GameStateRef {
  current: {
    money: number; walletLevel: number; baseHp: number; enemyBaseHp: number;
    units: Unit[]; cannonCharge: number;
    isCannonCharging: boolean; isCannonFiring: boolean;
    nextUnitId: number; enemySpawnTimer: number;
    cooldowns: Record<string, number>;
    lastTime: number; lastAttackSoundTime: number;
    gameState: 'title' | 'start' | 'playing' | 'victory' | 'defeat';
  };
}

// useGameAudioフックから返されるオーディオオブジェクトのRefの型定義
interface AudioRef {
  current: GameAudio;
}

// 現在のステージ設定のRefの型定義
interface CurrentStageRef {
  current: StageConfig;
}

// UIに表示するstateの型定義
interface UiState {
  money: number; walletLevel: number; baseHp: number; enemyBaseHp: number;
  cannonCharge: number; gameState: 'title' | 'start' | 'playing' | 'victory' | 'defeat';
  cooldownPercents: Record<string, number>;
}

// setUi関数の型定義
type SetUi = React.Dispatch<React.SetStateAction<UiState>>;

/**
 * ゲームのメインループを管理するカスタムフック。
 * requestAnimationFrameを使用してゲームの状態更新と描画を継続的に行います。
 *
 * @param canvasRef Canvas要素への参照
 * @param stateRef ゲームの内部状態への参照
 * @param audioRef オーディオオブジェクトへの参照
 * @param currentStageRef 現在のステージ設定への参照
 * @param setUi UIの状態を更新する関数
 */
export const useGameLoop = (
  canvasRef: RefObject<HTMLCanvasElement>,
  stateRef: GameStateRef,
  audioRef: AudioRef,
  currentStageRef: CurrentStageRef,
  setUi: SetUi
) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let requestID: number; // requestAnimationFrameのID

    /**
     * 経済（お金、にゃんこ砲チャージ）の状態を更新するヘルパー関数。
     * @param s ゲームの内部状態
     * @param dt 前回の更新からの経過時間（秒）
     */
    const updateEconomy = (s: GameStateRef['current'], dt: number) => {
      s.money += (30 + s.walletLevel * 20) * dt; // お金の増加
      if (s.cannonCharge < 100 && !s.isCannonCharging) {
        s.cannonCharge = Math.min(100, s.cannonCharge + dt * 3.3); // にゃんこ砲のチャージ
      }
    };

    /**
     * ユニットのクールダウン状態を更新するヘルパー関数。
     * クールダウンが完了したユニットがあればチャリン音を再生します。
     * @param s ゲームの内部状態
     * @param dt 前回の更新からの経過時間（秒）
     * @param a オーディオオブジェクト
     */
    const updateCooldowns = (s: GameStateRef['current'], dt: number, a: GameAudio) => {
      Object.keys(s.cooldowns).forEach(k => {
        const wasReady = s.cooldowns[k] <= 0;
        s.cooldowns[k] = Math.max(0, s.cooldowns[k] - dt * 1000);
        if (!wasReady && s.cooldowns[k] <= 0) {
          a.playCharinSound(); // クールダウン完了音
        }
      });
    };

    /**
     * 敵ユニットのスポーンロジックを処理するヘルパー関数。
     * @param s ゲームの内部状態
     * @param dt 前回の更新からの経過時間（秒）
     * @param stage 現在のステージ設定
     */
    const spawnEnemies = (s: GameStateRef['current'], dt: number, stage: StageConfig) => {
      s.enemySpawnTimer += dt * 1000;
      if (s.enemySpawnTimer > stage.enemySpawnRate) {
        const rand = Math.random();
        let enemyType: string;
        // ランダムで敵の種類を決定
        if (rand < 0.05) enemyType = 'BEAR';
        else if (rand < 0.20) enemyType = 'HIPPO';
        else if (rand < 0.50) enemyType = 'SNAKE';
        else enemyType = 'ENEMY';

        const stats = { ...UNIT_TYPES[enemyType] };
        stats.hp *= stage.enemyHpMultiplier; // ステージに応じたHP倍率を適用
        // 敵ユニットを生成し、ユニットリストに追加
        s.units.push({ id: s.nextUnitId++, x: CANVAS_WIDTH - 110, y: CANVAS_HEIGHT - 70, type: 'enemy', unitType: enemyType, stats, currentHp: stats.hp });
        s.enemySpawnTimer = 0;
      }
    };

    /**
     * ユニットの移動、戦闘、ダメージ計算、ゲーム終了条件のチェックを行うヘルパー関数。
     * @param s ゲームの内部状態
     * @param dt 前回の更新からの経過時間（秒）
     * @param a オーディオオブジェクト
     * @param stage 現在のステージ設定
     * @param timestamp 現在のタイムスタンプ
     */
    const processUnitsAndCombat = (s: GameStateRef['current'], dt: number, a: GameAudio, stage: StageConfig, timestamp: number) => {
      let someoneIsAttacking = false;
      const curUnits = [...s.units];

      // 各ユニットの状態を更新
      s.units = curUnits.map(u => {
        let dmgTaken = 0;
        let isAtk = false;

        // 敵味方間の攻撃判定とダメージ計算
        curUnits.forEach(other => {
          if (other.type !== u.type && Math.abs(other.x - u.x) < other.stats.range) {
            dmgTaken += other.stats.damage * dt;
            isAtk = true;
          }
        });

        // 味方ユニットが敵城に到達した場合の処理
        if (u.type === 'ally' && u.x > CANVAS_WIDTH - 150) {
          s.enemyBaseHp = Math.max(0, s.enemyBaseHp - u.stats.damage * dt);
          if (s.enemyBaseHp <= 0 && s.gameState === 'playing') { s.gameState = 'victory'; a.playVictoryFanfare(); }
          isAtk = true;
        }
        // 敵ユニットが自城に到達した場合の処理
        else if (u.type === 'enemy' && u.x < 150) {
          s.baseHp = Math.max(0, s.baseHp - u.stats.damage * dt);
          if (s.baseHp <= 0 && s.gameState === 'playing') { s.gameState = 'defeat'; a.playDefeatJingle(); }
          isAtk = true;
        }

        if (isAtk) someoneIsAttacking = true;
        let nx = u.x;
        // 攻撃中でなければ移動
        if (!isAtk) nx += u.stats.speed * (dt * 60) * (u.type === 'ally' ? 1 : -1);
        return { ...u, x: nx, currentHp: u.currentHp - dmgTaken };
      }).filter(u => u.currentHp > 0); // HPが0以下のユニットを削除

      // 攻撃音の再生
      if (someoneIsAttacking && timestamp - s.lastAttackSoundTime > 300) {
        a.playGashiSound();
        s.lastAttackSoundTime = timestamp;
      }
    };

    /**
     * ゲームの状態を更新する関数。
     * @param dt 前回の更新からの経過時間（秒）
     * @param timestamp 現在のタイムスタンプ
     */
    const update = (dt: number, timestamp: number) => {
      const s = stateRef.current; // ゲームの内部状態
      const a = audioRef.current; // オーディオオブジェクト
      const stage = currentStageRef.current; // 現在のステージ設定

      updateEconomy(s, dt); // 経済の更新
      updateCooldowns(s, dt, a); // クールダウンの更新
      spawnEnemies(s, dt, stage); // 敵のスポーン
      processUnitsAndCombat(s, dt, a, stage, timestamp); // ユニットと戦闘の処理
    };

    /**
     * requestAnimationFrameによって呼び出されるメインループ関数。
     * @param timestamp 現在のタイムスタンプ
     */
    const loop = (timestamp: number) => {
      const s = stateRef.current;
      if (!s.lastTime) s.lastTime = timestamp;
      let dt = (timestamp - s.lastTime);
      if (dt > 100) dt = 100; // デルタタイムの上限を設定し、物理演算の不具合を防ぐ
      s.lastTime = timestamp;

      // ゲームがプレイ中の場合のみ状態を更新
      if (s.gameState === 'playing') update(dt / 1000, timestamp);

      // ゲームの描画
      drawGame(ctx, s, currentStageRef.current, timestamp);

      // UIの状態を更新
      setUi({
        money: Math.floor(s.money), walletLevel: s.walletLevel,
        baseHp: s.baseHp, enemyBaseHp: s.enemyBaseHp, cannonCharge: Math.floor(s.cannonCharge),
        gameState: s.gameState,
        cooldownPercents: {
          BASIC: 100 - (s.cooldowns.BASIC / UNIT_TYPES.BASIC.cooldown * 100),
          TANK: 100 - (s.cooldowns.TANK / UNIT_TYPES.TANK.cooldown * 100),
          BATTLE: 100 - (s.cooldowns.BATTLE / UNIT_TYPES.BATTLE.cooldown * 100),
          LEGS: 100 - (s.cooldowns.LEGS / UNIT_TYPES.LEGS.cooldown * 100),
          COW: 100 - (s.cooldowns.COW / UNIT_TYPES.COW.cooldown * 100),
          BIRD: 100 - (s.cooldowns.BIRD / UNIT_TYPES.BIRD.cooldown * 100),
          FISH: 100 - (s.cooldowns.FISH / UNIT_TYPES.FISH.cooldown * 100),
          LIZARD: 100 - (s.cooldowns.LIZARD / UNIT_TYPES.LIZARD.cooldown * 100)
        }
      });

      requestID = requestAnimationFrame(loop);
    };

    // ゲームループを開始
    requestID = requestAnimationFrame(loop);

    // クリーンアップ関数: コンポーネントのアンマウント時にループを停止
    return () => {
      cancelAnimationFrame(requestID);
    };
  }, [setUi]);
};
