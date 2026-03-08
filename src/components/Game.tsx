import React, { useEffect, useRef, useState } from 'react';
import { type Unit, type UnitStats, type StageConfig, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types/game';
import { UNIT_TYPES } from '../constants/units';
import { STAGES } from '../constants/stages';
import { useGameAudio } from '../hooks/useGameAudio';
import { drawGame } from './Canvas/renderer';
import { GaugeButton } from './UI/GaugeButton';

/**
 * ゲームのメインコンポーネント
 */
const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audio = useGameAudio();
  const audioRef = useRef(audio);

  // audio関数の実体を常に最新に保つ
  useEffect(() => { audioRef.current = audio; }, [audio]);
  
  const [currentStage, setCurrentStage] = useState<StageConfig>(STAGES[1]);
  const currentStageRef = useRef(STAGES[1]);

  const stateRef = useRef({
    money: 0, walletLevel: 1, baseHp: 1000, enemyBaseHp: 1000,
    units: [] as Unit[], cannonCharge: 0, isCannonFiring: false,
    nextUnitId: 0, enemySpawnTimer: 0,
    cooldowns: { BASIC: 0, TANK: 0, BATTLE: 0 } as Record<string, number>,
    lastTime: 0, lastAttackSoundTime: 0,
    gameState: 'start' as 'start' | 'playing' | 'victory' | 'defeat'
  });

  const [ui, setUi] = useState({
    money: 0, walletLevel: 1, baseHp: 1000, enemyBaseHp: 1000,
    cannonCharge: 0, gameState: 'start' as any,
    cooldownPercents: { BASIC: 100, TANK: 100, BATTLE: 100 }
  });

  const startGame = (stage: StageConfig) => {
    setCurrentStage(stage);
    currentStageRef.current = stage;
    audio.initAudio();
    audio.startBGM(stage.id);
    const s = stateRef.current;
    s.baseHp = stage.baseHp; s.enemyBaseHp = stage.enemyBaseHp;
    s.money = 0; s.walletLevel = 1; s.units = []; s.cannonCharge = 0;
    s.gameState = 'playing'; s.lastTime = 0;
    audio.playSystemSE(440);
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let requestID: number;

    const loop = (timestamp: number) => {
      const s = stateRef.current;
      if (!s.lastTime) s.lastTime = timestamp;
      let dt = (timestamp - s.lastTime); if (dt > 100) dt = 100;
      s.lastTime = timestamp;
      if (s.gameState === 'playing') update(dt / 1000, timestamp);
      drawGame(ctx, s, currentStageRef.current, timestamp);
      setUi({
        money: Math.floor(s.money), walletLevel: s.walletLevel,
        baseHp: s.baseHp, enemyBaseHp: s.enemyBaseHp, cannonCharge: Math.floor(s.cannonCharge),
        gameState: s.gameState,
        cooldownPercents: {
          BASIC: 100 - (s.cooldowns.BASIC / UNIT_TYPES.BASIC.cooldown * 100),
          TANK: 100 - (s.cooldowns.TANK / UNIT_TYPES.TANK.cooldown * 100),
          BATTLE: 100 - (s.cooldowns.BATTLE / UNIT_TYPES.BATTLE.cooldown * 100)
        }
      });
      requestID = requestAnimationFrame(loop);
    };

    const update = (dt: number, timestamp: number) => {
      const s = stateRef.current;
      const a = audioRef.current;
      const stage = currentStageRef.current;
      s.money += (30 + s.walletLevel * 20) * dt;
      if (s.cannonCharge < 100) s.cannonCharge = Math.min(100, s.cannonCharge + dt * 3.3);
      Object.keys(s.cooldowns).forEach(k => {
        const wasReady = s.cooldowns[k] <= 0;
        s.cooldowns[k] = Math.max(0, s.cooldowns[k] - dt * 1000);
        if (!wasReady && s.cooldowns[k] <= 0) a.playCharinSound();
      });
      s.enemySpawnTimer += dt * 1000;
      if (s.enemySpawnTimer > stage.enemySpawnRate) { 
        const stats = { ...UNIT_TYPES['ENEMY'] };
        stats.hp *= stage.enemyHpMultiplier;
        s.units.push({
          id: s.nextUnitId++, x: CANVAS_WIDTH - 110, y: CANVAS_HEIGHT - 70, 
          type: 'enemy', unitType: 'ENEMY', stats, currentHp: stats.hp
        });
        s.enemySpawnTimer = 0; 
      }
      let someoneIsAttacking = false;
      const curUnits = [...s.units];
      s.units = curUnits.map(u => {
        let dmgTaken = 0; let isAtk = false;
        curUnits.forEach(other => {
          if (other.type !== u.type && Math.abs(other.x - u.x) < other.stats.range) {
            dmgTaken += other.stats.damage * dt; isAtk = true;
          }
        });
        if (u.type === 'ally' && u.x > CANVAS_WIDTH - 150) {
          s.enemyBaseHp = Math.max(0, s.enemyBaseHp - u.stats.damage * dt);
          if (s.enemyBaseHp <= 0 && s.gameState === 'playing') { s.gameState = 'victory'; a.stopBGM(); a.playVictoryFanfare(); }
          isAtk = true;
        } else if (u.type === 'enemy' && u.x < 150) {
          s.baseHp = Math.max(0, s.baseHp - u.stats.damage * dt);
          if (s.baseHp <= 0 && s.gameState === 'playing') { s.gameState = 'defeat'; a.stopBGM(); a.playDefeatJingle(); }
          isAtk = true;
        }
        if (isAtk) someoneIsAttacking = true;
        let nx = u.x; if (!isAtk) nx += u.stats.speed * (dt * 60) * (u.type === 'ally' ? 1 : -1);
        return { ...u, x: nx, currentHp: u.currentHp - dmgTaken };
      }).filter(u => u.currentHp > 0);
      if (someoneIsAttacking && timestamp - s.lastAttackSoundTime > 300) {
        a.playGashiSound(); s.lastAttackSoundTime = timestamp;
      }
    };

    requestID = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(requestID); };
  }, []);

  // --- 操作パネル用関数 ---

  const handleSpawn = (type: keyof typeof UNIT_TYPES) => {
    const s = stateRef.current;
    if (s.money >= UNIT_TYPES[type].cost && s.cooldowns[type] <= 0) {
      s.money -= UNIT_TYPES[type].cost;
      s.cooldowns[type] = UNIT_TYPES[type].cooldown;
      s.units.push({
        id: s.nextUnitId++, x: 110, y: CANVAS_HEIGHT - 70, 
        type: 'ally', unitType: type as string, stats: UNIT_TYPES[type], currentHp: UNIT_TYPES[type].hp
      });
      audio.playSystemSE(660);
    }
  };

  const handleUpgrade = () => {
    const s = stateRef.current;
    const cost = s.walletLevel * 200;
    if (s.money >= cost && s.walletLevel < 8) {
      s.money -= cost; s.walletLevel++; audio.playSystemSE(330);
    }
  };

  const handleCannon = () => {
    const s = stateRef.current;
    if (s.cannonCharge < 100 || s.isCannonFiring) return;
    s.isCannonFiring = true; s.cannonCharge = 0;
    audio.playCannonSound();
    setTimeout(() => {
      s.units = s.units.map(u => u.type === 'enemy' ? { ...u, currentHp: u.currentHp - 100, x: u.x + 100 } : u).filter(u => u.currentHp > 0);
      setTimeout(() => s.isCannonFiring = false, 500);
    }, 500);
  };

  return (
    <div style={{ textAlign: 'center', backgroundColor: '#ecf0f1', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
        <h1>にゃんこ大戦争プロトタイプ</h1>
        <button onClick={() => audio.setIsAudioEnabled(!audio.isAudioEnabled)} style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', background: audio.isAudioEnabled ? '#e74c3c' : '#2ecc71', color: '#fff', cursor: 'pointer' }}>
          SOUND: {audio.isAudioEnabled ? 'OFF' : 'ON'}
        </button>
      </div>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ border: '4px solid #34495e', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} />
        {ui.gameState === 'start' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>ステージ選択</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '20px' }}>
              {Object.values(STAGES).map(stage => (
                <button key={stage.id} onClick={() => startGame(stage)} style={{ padding: '15px 25px', fontSize: '16px', cursor: 'pointer', borderRadius: '10px', background: stage.id % 2 === 0 ? '#e67e22' : '#2ecc71', color: '#fff', border: 'none', fontWeight: 'bold', boxShadow: '0 4px rgba(0,0,0,0.3)' }}>
                  第{stage.id}章<br/>{stage.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {(ui.gameState === 'victory' || ui.gameState === 'defeat') && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '60px', color: ui.gameState === 'victory' ? '#f1c40f' : '#e74c3c' }}>{ui.gameState.toUpperCase()}</h2>
            <button onClick={() => window.location.reload()} style={{ padding: '15px 40px', fontSize: '24px', cursor: 'pointer', borderRadius: '8px', background: '#3498db', color: '#fff', border: 'none', fontWeight: 'bold' }}>BACK TO MENU</button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <GaugeButton label={<>にゃんこ砲<br/>({ui.cannonCharge}%)</>} percent={ui.cannonCharge} onClick={handleCannon} disabled={ui.cannonCharge < 100 || ui.gameState !== 'playing'} readyColor="#e74c3c" gaugeColor="#f39c12" />
        <GaugeButton label={<>働きネコ Lv.{ui.walletLevel}<br/>(${ui.walletLevel * 200})</>} percent={100} onClick={handleUpgrade} disabled={ui.money < ui.walletLevel * 200 || ui.walletLevel >= 8 || ui.gameState !== 'playing'} readyColor="#e67e22" gaugeColor="#e67e22" width="150px" />
        {(['BASIC', 'TANK', 'BATTLE'] as const).map(t => {
          const percent = ui.cooldownPercents[t];
          const isReady = percent >= 100 && ui.money >= UNIT_TYPES[t].cost;
          return (
            <GaugeButton key={t} label={<>{UNIT_TYPES[t].name}<br/>(${UNIT_TYPES[t].cost})</>} percent={percent} onClick={() => handleSpawn(t)} disabled={!isReady || ui.gameState !== 'playing'} readyColor="#2ecc71" gaugeColor="#3498db" />
          );
        })}
      </div>
    </div>
  );
};

export default Game;
