import { useCallback, type RefObject, type SetStateAction, type Dispatch } from 'react';
import { type GameAudio } from './useGameAudio';
import { type StageConfig, type Unit, CANVAS_HEIGHT } from '../types/game';
import { UNIT_TYPES } from '../constants/units';

interface GameState {
  money: number; walletLevel: number; baseHp: number; enemyBaseHp: number;
  units: Unit[]; cannonCharge: number;
  isCannonCharging: boolean; isCannonFiring: boolean;
  nextUnitId: number; enemySpawnTimer: number;
  cooldowns: Record<string, number>;
  lastTime: number; lastAttackSoundTime: number;
  gameState: 'title' | 'start' | 'playing' | 'victory' | 'defeat' | 'paused';
}

/**
 * 【責任】ゲームのコントローラー（操作・統制レイヤー）。
 * ユーザーの意思（クリック、キー入力）をゲームの状態遷移や具体的なアクションに変換します。
 * 描画（View）や物理演算（System）を知る必要はなく、それらに「命令を下す」ことに特化します。
 */
export const useGameController = (
  stateRef: RefObject<GameState>,
  audio: GameAudio,
  setUi: Dispatch<SetStateAction<any>>,
  currentStage: StageConfig,
  setCurrentStage: Dispatch<SetStateAction<StageConfig>>,
  currentStageRef: RefObject<StageConfig>
) => {

  /**
   * 状態遷移 (Transition): 
   * ゲームの状態を変更し、それに付随するBGMの停止・再開などの副作用を一元管理します。
   */
  const transitionTo = useCallback((nextState: GameState['gameState']) => {
    const s = stateRef.current;
    if (!s) return;
    const prevState = s.gameState;
    s.gameState = nextState;
    setUi((prev: any) => ({ ...prev, gameState: nextState }));
    
    if (nextState === 'start' || nextState === 'title') {
      audio.stopBGM();
    } else if (nextState === 'paused') {
      audio.pauseBGM();
    } else if (nextState === 'playing' && prevState === 'paused') {
      audio.resumeBGM();
    }
  }, [audio, stateRef, setUi]);

  /**
   * ポーズのトグル: プレイ中とポーズ中を相互に行き来します。
   */
  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    if (s.gameState === 'playing') transitionTo('paused');
    else if (s.gameState === 'paused') transitionTo('playing');
  }, [transitionTo, stateRef]);

  /**
   * ステージ選択画面への移動。
   */
  const toStageSelect = useCallback(() => { 
    audio.initAudio(); 
    audio.playSystemSE(660); 
    transitionTo('start');
  }, [audio, transitionTo]);

  /**
   * タイトル画面への帰還。
   */
  const backToTitle = useCallback(() => transitionTo('title'), [transitionTo]);
  
  /**
   * ゲームの開始（初期化）:
   * 指定されたステージのパラメータで戦場をリセットし、BGMを開始します。
   */
  const startGame = useCallback((stage: StageConfig) => {
    setCurrentStage(stage);
    if (currentStageRef.current) (currentStageRef as any).current = stage;
    audio.initAudio();
    const s = stateRef.current;
    if (!s) return;

    // パラメータのリセット
    s.baseHp = stage.baseHp; s.enemyBaseHp = stage.enemyBaseHp;
    s.money = 0; s.walletLevel = 1; s.units = []; s.cannonCharge = 0;
    s.lastTime = 0;
    s.cooldowns = { BASIC: 0, TANK: 0, BATTLE: 0, LEGS: 0, COW: 0, BIRD: 0, FISH: 0, LIZARD: 0 };
    
    audio.playSystemSE(440);
    audio.startBGM(stage.id);
    transitionTo('playing');
  }, [audio, transitionTo, setCurrentStage, currentStageRef, stateRef]);

  /**
   * ステージ中断（メニューへ戻る）。
   */
  const backToMenu = useCallback(() => transitionTo('start'), [transitionTo]);

  /**
   * ユニット召喚アクション: 
   * 所持金とクールダウンをチェックし、問題なければユニットを生成します。
   */
  const handleSpawn = useCallback((type: keyof typeof UNIT_TYPES) => {
    const s = stateRef.current;
    if (!s) return;
    if (s.money >= UNIT_TYPES[type].cost && s.cooldowns[type] <= 0) {
      s.money -= UNIT_TYPES[type].cost; s.cooldowns[type] = UNIT_TYPES[type].cooldown;
      s.units.push({ 
        id: s.nextUnitId++, 
        x: 110, 
        y: CANVAS_HEIGHT - 70, 
        type: 'ally', 
        unitType: type as string, 
        stats: UNIT_TYPES[type], 
        currentHp: UNIT_TYPES[type].hp 
      });
      audio.playSystemSE(660);
    }
  }, [audio, stateRef]);

  /**
   * 働きネコのレベルアップアクション。
   */
  const handleUpgrade = useCallback(() => { 
    const s = stateRef.current; 
    if (!s) return;
    const cost = s.walletLevel * 200; 
    if (s.money >= cost && s.walletLevel < 8) { 
      s.money -= cost; s.walletLevel++; audio.playUpgradeSound(); 
    } 
  }, [audio, stateRef]);

  /**
   * にゃんこ砲発射アクション: 
   * チャージが100%であれば、充填シークエンスを経て強力な範囲攻撃を実行します。
   */
  const handleCannon = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.cannonCharge < 100 || s.isCannonCharging || s.isCannonFiring) return;
    
    s.isCannonCharging = true; s.cannonCharge = 0; 
    audio.playCannonChargeSound();

    setTimeout(() => {
      s.isCannonCharging = false; s.isCannonFiring = true; 
      audio.playCannonExplosionSound();
      
      // 画面上の全敵ユニットに大ダメージとノックバック
      s.units = s.units.map(u => 
        u.type === 'enemy' ? { ...u, currentHp: u.currentHp - 150, x: u.x + 120 } : u
      ).filter(u => u.currentHp > 0);

      setTimeout(() => { s.isCannonFiring = false; }, 600);
    }, 500);
  }, [audio, stateRef]);

  return {
    transitionTo, togglePause, toStageSelect, backToTitle, startGame, backToMenu,
    handleSpawn, handleUpgrade, handleCannon
  };
};
