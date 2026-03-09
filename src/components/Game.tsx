import React, { useEffect, useRef, useState } from 'react';
import { type StageConfig, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types/game';
import { UNIT_TYPES } from '../constants/units';
import { STAGES } from '../constants/stages';
import { useGameAudio } from '../hooks/useGameAudio';
import { GaugeButton } from './UI/GaugeButton';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameController } from '../hooks/useGameController';

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

  const stateRef = useRef({
    money: 0, walletLevel: 1, baseHp: 1000, enemyBaseHp: 1000,
    units: [], cannonCharge: 0, 
    isCannonCharging: false, isCannonFiring: false,
    nextUnitId: 0, enemySpawnTimer: 0,
    cooldowns: { BASIC: 0, TANK: 0, BATTLE: 0, LEGS: 0, COW: 0, BIRD: 0, FISH: 0, LIZARD: 0 } as any,
    lastTime: 0, lastAttackSoundTime: 0,
    gameState: 'title' as any
  });

  const [ui, setUi] = useState({
    money: 0, walletLevel: 1, baseHp: 1000, enemyBaseHp: 1000,
    cannonCharge: 0, gameState: 'title' as any,
    cooldownPercents: { BASIC: 100, TANK: 100, BATTLE: 100, LEGS: 100, COW: 100, BIRD: 100, FISH: 100, LIZARD: 100 }
  });

  // コントローラーの初期化（ロジックの抽出先）
  const {
    togglePause, toStageSelect, backToTitle, startGame, backToMenu,
    handleSpawn, handleUpgrade, handleCannon
  } = useGameController(stateRef, audio, setUi, currentStage, setCurrentStage, currentStageRef);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP') togglePause();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  // ゲームのメインループ（計算と描画の開始）
  useGameLoop(canvasRef, stateRef, { current: audio }, currentStageRef, setUi);

  return (
    <div style={{ textAlign: 'center', backgroundColor: '#ecf0f1', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
        <h1>ねこねこ大戦争</h1>
        <button onClick={() => audio.setIsAudioEnabled(!audio.isAudioEnabled)} style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', background: audio.isAudioEnabled ? '#e74c3c' : '#2ecc71', color: '#fff', cursor: 'pointer' }}>SOUND: {audio.isAudioEnabled ? 'OFF' : 'ON'}</button>
      </div>
      
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ border: '4px solid #34495e', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} />
        
        {/* 1. タイトル画面 */}
        {ui.gameState === 'title' && (
          <div onClick={toStageSelect} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', cursor: 'pointer', padding: '40px 0' }}>
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '20px 40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', border: '4px solid #2c3e50', marginTop: '20px' }}><h2 style={{ fontSize: '50px', color: '#2c3e50', margin: 0, textShadow: '2px 2px 0 #fff, 4px 4px 0 #bdc3c7' }}>ねこねこ大戦争</h2></div>
            <div style={{ marginBottom: '60px', background: 'linear-gradient(to bottom, #f1c40f, #f39c12)', padding: '5px 15px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '3px solid #fff', outline: '2px solid #2c3e50', animation: 'blink 1.2s infinite' }}><p style={{ fontSize: '22px', color: '#fff', fontWeight: '900', margin: 0, letterSpacing: '2px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>CLICK TO START</p></div>
            <style>{`@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }`}</style>
          </div>
        )}

        {/* 2. ステージ選択画面 */}
        {ui.gameState === 'start' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.95)', padding: '20px 30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)', textAlign: 'center', maxWidth: '500px', border: '3px solid #2ecc71' }}>
              <h2 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '15px', marginTop: 0 }}>ステージ選択</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {Object.values(STAGES).map(stage => (
                  <button key={stage.id} onClick={() => startGame(stage)} style={{ padding: '12px 15px', fontSize: '14px', cursor: 'pointer', borderRadius: '10px', background: stage.id % 2 === 0 ? '#e67e22' : '#2ecc71', color: '#fff', border: 'none', fontWeight: 'bold', boxShadow: '0 3px rgba(0,0,0,0.2)' }}>第{stage.id}章<br/>{stage.name}</button>
                ))}
              </div>
              <button onClick={backToTitle} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#7f8c8d', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer' }}>タイトルへ戻る</button>
            </div>
          </div>
        )}

        {/* 3. プレイ中のオーバーレイ */}
        {ui.gameState === 'playing' && ( 
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
            <button onClick={togglePause} style={{ padding: '5px 15px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>PAUSE (P)</button>
            <button onClick={backToMenu} style={{ padding: '5px 15px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>QUIT</button> 
          </div>
        )}

        {/* 4. ポーズ画面 */}
        {ui.gameState === 'paused' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '40px', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>PAUSED</h2>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={togglePause} style={{ padding: '12px 25px', fontSize: '18px', cursor: 'pointer', borderRadius: '10px', background: '#2ecc71', color: '#fff', border: 'none', fontWeight: 'bold', boxShadow: '0 4px #27ae60' }}>RESUME</button>
              <button onClick={() => startGame(currentStage)} style={{ padding: '12px 25px', fontSize: '18px', cursor: 'pointer', borderRadius: '10px', background: '#f39c12', color: '#fff', border: 'none', fontWeight: 'bold', boxShadow: '0 4px #d35400' }}>RESTART</button>
              <button onClick={backToMenu} style={{ padding: '12px 25px', fontSize: '18px', cursor: 'pointer', borderRadius: '10px', background: '#e74c3c', color: '#fff', border: 'none', fontWeight: 'bold', boxShadow: '0 4px #c0392b' }}>QUIT</button>
            </div>
          </div>
        )}

        {/* 5. 勝敗画面 */}
        {(ui.gameState === 'victory' || ui.gameState === 'defeat') && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '60px', color: ui.gameState === 'victory' ? '#f1c40f' : '#e74c3c' }}>{ui.gameState.toUpperCase()}</h2>
            <button onClick={backToMenu} style={{ padding: '15px 40px', fontSize: '24px', cursor: 'pointer', borderRadius: '8px', background: '#3498db', color: '#fff', border: 'none', fontWeight: 'bold' }}>BACK TO MENU</button>
          </div>
        )}
      </div>

      {/* 6. 操作パネル */}
      {ui.gameState === 'playing' && (
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '20px', animation: 'fadeIn 0.5s' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <GaugeButton label={<>にゃんこ砲<br/>({ui.cannonCharge}%)</>} percent={ui.cannonCharge} onClick={handleCannon} disabled={ui.cannonCharge < 100} readyColor="#e74c3c" gaugeColor="#f39c12" width="120px" />
            <GaugeButton label={<>働きネコ Lv.{ui.walletLevel}<br/>(${ui.walletLevel * 200})</>} percent={100} onClick={handleUpgrade} disabled={ui.money < ui.walletLevel * 200 || ui.walletLevel >= 8} readyColor="#e67e22" gaugeColor="#e67e22" width="120px" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 120px)', gridTemplateRows: 'repeat(2, auto)', gap: '10px' }}>
            {(['BASIC', 'TANK', 'BATTLE', 'LEGS', 'COW', 'BIRD', 'FISH', 'LIZARD'] as const).map(t => {
              const percent = (ui.cooldownPercents as any)[t];
              const isReady = percent >= 100 && ui.money >= UNIT_TYPES[t].cost;
              return ( <GaugeButton key={t} label={<>{UNIT_TYPES[t].name}<br/>(${UNIT_TYPES[t].cost})</>} percent={percent} onClick={() => handleSpawn(t)} disabled={!isReady} readyColor="#2ecc71" gaugeColor="#3498db" width="120px" /> );
            })}
          </div>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      )}
    </div>
  );
};

export default Game;
