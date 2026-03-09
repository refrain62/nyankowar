import { useEffect, RefObject } from 'react';
import { type Unit, type StageConfig, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types/game';
import { UNIT_TYPES } from '../constants/units';
import { drawGame } from '../components/Canvas/renderer';
import { type GameAudio } from './useGameAudio';

/**
 * 【設計意図】Gameコンポーネントの内部状態（stateRef）の型定義。
 * ReactのStateではなくRefで管理することで、毎フレームの更新による
 * 不要な再レンダリングを回避し、60FPSの安定した動作を実現します。
 */
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

interface AudioRef {
  current: GameAudio;
}

interface CurrentStageRef {
  current: StageConfig;
}

/**
 * UI表示用のスナップショット型。
 * ゲームループの最後に一度だけStateを更新し、ReactのUIと同期させます。
 */
interface UiState {
  money: number; walletLevel: number; baseHp: number; enemyBaseHp: number;
  cannonCharge: number; gameState: 'title' | 'start' | 'playing' | 'victory' | 'defeat';
  cooldownPercents: Record<string, number>;
}

type SetUi = React.Dispatch<React.SetStateAction<UiState>>;

/**
 * ゲームのメインループを管理するカスタムフック。
 * 物理演算（移動・衝突判定）、経済システム、描画のトリガーを一括で制御します。
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

    let requestID: number;

    /**
     * 経済システムの更新（働きネコによる所持金増幅、にゃんこ砲チャージ）。
     */
    const updateEconomy = (s: GameStateRef['current'], dt: number) => {
      s.money += (30 + s.walletLevel * 20) * dt; 
      if (s.cannonCharge < 100 && !s.isCannonCharging) {
        s.cannonCharge = Math.min(100, s.cannonCharge + dt * 3.3); 
      }
    };

    /**
     * ユニット生産のクールダウン更新。
     */
    const updateCooldowns = (s: GameStateRef['current'], dt: number, a: GameAudio) => {
      Object.keys(s.cooldowns).forEach(k => {
        const wasReady = s.cooldowns[k] <= 0;
        s.cooldowns[k] = Math.max(0, s.cooldowns[k] - dt * 1000);
        if (!wasReady && s.cooldowns[k] <= 0) {
          a.playCharinSound(); // 生産可能になった瞬間のフィードバック
        }
      });
    };

    /**
     * 敵ユニットの自動生成ロジック。
     * ステージ難易度（倍率）に応じたパラメータ補正を行います。
     */
    const spawnEnemies = (s: GameStateRef['current'], dt: number, stage: StageConfig) => {
      s.enemySpawnTimer += dt * 1000;
      if (s.enemySpawnTimer > stage.enemySpawnRate) {
        const rand = Math.random();
        let enemyType: string;
        if (rand < 0.05) enemyType = 'BEAR';
        else if (rand < 0.20) enemyType = 'HIPPO';
        else if (rand < 0.50) enemyType = 'SNAKE';
        else enemyType = 'ENEMY';

        const stats = { ...UNIT_TYPES[enemyType] };
        stats.hp *= stage.enemyHpMultiplier;
        s.units.push({ id: s.nextUnitId++, x: CANVAS_WIDTH - 110, y: CANVAS_HEIGHT - 70, type: 'enemy', unitType: enemyType, stats, currentHp: stats.hp });
        s.enemySpawnTimer = 0;
      }
    };

    /**
     * 【重要】ユニットの移動と戦闘判定。
     * 1. 射程範囲内に敵がいれば停止して攻撃（ダメージ計算）。
     * 2. 範囲内に敵がいなければ移動速度に従って前進。
     * 3. 城への攻撃判定と勝敗決着。
     */
    const processUnitsAndCombat = (s: GameStateRef['current'], dt: number, a: GameAudio, stage: StageConfig, timestamp: number) => {
      let someoneIsAttacking = false;
      const curUnits = [...s.units];

      s.units = curUnits.map(u => {
        let dmgTaken = 0;
        let isAtk = false;

        // 敵対ユニットとの距離チェック
        curUnits.forEach(other => {
          if (other.type !== u.type && Math.abs(other.x - u.x) < other.stats.range) {
            dmgTaken += other.stats.damage * dt;
            isAtk = true;
          }
        });

        // 拠点（城）への攻撃
        if (u.type === 'ally' && u.x > CANVAS_WIDTH - 150) {
          s.enemyBaseHp = Math.max(0, s.enemyBaseHp - u.stats.damage * dt);
          if (s.enemyBaseHp <= 0 && s.gameState === 'playing') { 
            s.gameState = 'victory'; 
            a.stopBGM();
            a.playVictoryFanfare(); 
          }
          isAtk = true;
        }
        else if (u.type === 'enemy' && u.x < 150) {
          s.baseHp = Math.max(0, s.baseHp - u.stats.damage * dt);
          if (s.baseHp <= 0 && s.gameState === 'playing') { 
            s.gameState = 'defeat'; 
            a.stopBGM();
            a.playDefeatJingle(); 
          }
          isAtk = true;
        }

        if (isAtk) someoneIsAttacking = true;
        let nx = u.x;
        // 攻撃中でなければ前進（味方は右、敵は左へ）
        if (!isAtk) nx += u.stats.speed * (dt * 60) * (u.type === 'ally' ? 1 : -1);
        return { ...u, x: nx, currentHp: u.currentHp - dmgTaken };
      }).filter(u => u.currentHp > 0); // 生存ユニットのみをフィルタリング

      // 戦闘音の制御（頻度を制限してノイズ化を防ぐ）
      if (someoneIsAttacking && timestamp - s.lastAttackSoundTime > 300) {
        a.playGashiSound();
        s.lastAttackSoundTime = timestamp;
      }
    };

    /**
     * 1フレームの更新処理。
     */
    const update = (dt: number, timestamp: number) => {
      const s = stateRef.current;
      const a = audioRef.current;
      const stage = currentStageRef.current;

      updateEconomy(s, dt);
      updateCooldowns(s, dt, a);
      spawnEnemies(s, dt, stage);
      processUnitsAndCombat(s, dt, a, stage, timestamp);
    };

    /**
     * requestAnimationFrameによる無限ループ。
     */
    const loop = (timestamp: number) => {
      const s = stateRef.current;
      if (!s.lastTime) s.lastTime = timestamp;
      let dt = (timestamp - s.lastTime);
      if (dt > 100) dt = 100; // 長時間のバックグラウンド放置後の急加速を防止
      s.lastTime = timestamp;

      if (s.gameState === 'playing') update(dt / 1000, timestamp);

      // 描画処理（副作用のない純粋なCanvas命令）
      drawGame(ctx, s, currentStageRef.current, timestamp);

      // ReactのUI状態を同期（1フレームに1回のみ実行）
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

    requestID = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestID);
  }, [canvasRef, stateRef, audioRef, currentStageRef, setUi]);
};
