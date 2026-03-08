import React, { useEffect, useRef, useState } from 'react';
import { type Unit, type StageConfig, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types/game';
import { UNIT_TYPES } from '../constants/units';
import { STAGES } from '../constants/stages';
import { useGameAudio } from '../hooks/useGameAudio';
import { drawGame } from './Canvas/renderer';
import { GaugeButton } from './UI/GaugeButton';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audio = useGameAudio();
  const audioRef = useRef(audio);
  useEffect(() => { audioRef.current = audio; }, [audio]);
  
  const [currentStage, setCurrentStage] = useState<StageConfig>(STAGES[1]);
  const currentStageRef = useRef(STAGES[1]);

  const stateRef = useRef({
    money: 0, walletLevel: 1, baseHp: 1000, enemyBaseHp: 1000,
    units: [] as Unit[], cannonCharge: 0, 
    isCannonCharging: false, isCannonFiring: false, // チャージ状態を追加
    nextUnitId: 0, enemySpawnTimer: 0,
    cooldowns: { BASIC: 0, TANK: 0, BATTLE: 0, LEGS: 0, COW: 0, BIRD: 0, FISH: 0, LIZARD: 0 } as Record<string, number>,
    lastTime: 0, lastAttackSoundTime: 0,
    gameState: 'title' as 'title' | 'start' | 'playing' | 'victory' | 'defeat'
  });

  const [ui, setUi] = useState({
    money: 0, walletLevel: 1, baseHp: 1000, enemyBaseHp: 1000,
    cannonCharge: 0, gameState: 'title' as any,
    cooldownPercents: { BASIC: 100, TANK: 100, BATTLE: 100, LEGS: 100, COW: 100, BIRD: 100, FISH: 100, LIZARD: 100 }
  });

  useEffect(() => {
    if (ui.gameState === 'playing') { audio.startBGM(currentStage.id); } 
    else { audio.stopBGM(); }
  }, [ui.gameState, currentStage.id]);

  const toStageSelect = () => { audio.initAudio(); stateRef.current.gameState = 'start'; setUi(prev => ({ ...prev, gameState: 'start' })); audio.playSystemSE(660); };
  const backToTitle = () => { stateRef.current.gameState = 'title'; setUi(prev => ({ ...prev, gameState: 'title' })); };
  const startGame = (stage: StageConfig) => {
    setCurrentStage(stage); currentStageRef.current = stage; audio.initAudio();
    const s = stateRef.current;
    s.baseHp = stage.baseHp; s.enemyBaseHp = stage.enemyBaseHp;
    s.money = 0; s.walletLevel = 1; s.units = []; s.cannonCharge = 0;
    s.gameState = 'playing'; s.lastTime = 0;
    s.cooldowns = { BASIC: 0, TANK: 0, BATTLE: 0, LEGS: 0, COW: 0, BIRD: 0, FISH: 0, LIZARD: 0 };
    audio.playSystemSE(440);
  };
  const backToMenu = () => { stateRef.current.gameState = 'start'; setUi(prev => ({ ...prev, gameState: 'start' })); audio.stopBGM(); };

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

    const update = (dt: number, timestamp: number) => {
      const s = stateRef.current; const a = audioRef.current; const stage = currentStageRef.current;
      s.money += (30 + s.walletLevel * 20) * dt;
      if (s.cannonCharge < 100 && !s.isCannonCharging) s.cannonCharge = Math.min(100, s.cannonCharge + dt * 3.3);
      Object.keys(s.cooldowns).forEach(k => {
        const wasReady = s.cooldowns[k] <= 0;
        s.cooldowns[k] = Math.max(0, s.cooldowns[k] - dt * 1000);
        if (!wasReady && s.cooldowns[k] <= 0) a.playCharinSound();
      });
      s.enemySpawnTimer += dt * 1000;
      if (s.enemySpawnTimer > stage.enemySpawnRate) { 
        const rand = Math.random(); let enemyType: string;
        if (rand < 0.05) enemyType = 'BEAR'; else if (rand < 0.20) enemyType = 'HIPPO'; else if (rand < 0.50) enemyType = 'SNAKE'; else enemyType = 'ENEMY';
        const stats = { ...UNIT_TYPES[enemyType] }; stats.hp *= stage.enemyHpMultiplier;
        s.units.push({ id: s.nextUnitId++, x: CANVAS_WIDTH - 110, y: CANVAS_HEIGHT - 70, type: 'enemy', unitType: enemyType, stats, currentHp: stats.hp });
        s.enemySpawnTimer = 0; 
      }
      let someoneIsAttacking = false;
      const curUnits = [...s.units];
      s.units = curUnits.map(u => {
        let dmgTaken = 0; let isAtk = false;
        curUnits.forEach(other => { if (other.type !== u.type && Math.abs(other.x - u.x) < other.stats.range) { dmgTaken += other.stats.damage * dt; isAtk = true; } });
        if (u.type === 'ally' && u.x > CANVAS_WIDTH - 150) {
          s.enemyBaseHp = Math.max(0, s.enemyBaseHp - u.stats.damage * dt);
          if (s.enemyBaseHp <= 0 && s.gameState === 'playing') { s.gameState = 'victory'; a.playVictoryFanfare(); }
          isAtk = true;
        } else if (u.type === 'enemy' && u.x < 150) {
          s.baseHp = Math.max(0, s.baseHp - u.stats.damage * dt);
          if (s.baseHp <= 0 && s.gameState === 'playing') { s.gameState = 'defeat'; a.playDefeatJingle(); }
          isAtk = true;
        }
        if (isAtk) someoneIsAttacking = true;
        let nx = u.x; if (!isAtk) nx += u.stats.speed * (dt * 60) * (u.type === 'ally' ? 1 : -1);
        return { ...u, x: nx, currentHp: u.currentHp - dmgTaken };
      }).filter(u => u.currentHp > 0);
      if (someoneIsAttacking && timestamp - s.lastAttackSoundTime > 300) { a.playGashiSound(); s.lastAttackSoundTime = timestamp; }
    };
    requestID = requestAnimationFrame(loop); return () => { cancelAnimationFrame(requestID); };
  }, [currentStage]);

  const handleSpawn = (type: keyof typeof UNIT_TYPES) => {
    const s = stateRef.current;
    if (s.money >= UNIT_TYPES[type].cost && s.cooldowns[type] <= 0) {
      s.money -= UNIT_TYPES[type].cost; s.cooldowns[type] = UNIT_TYPES[type].cooldown;
      s.units.push({ id: s.nextUnitId++, x: 110, y: CANVAS_HEIGHT - 70, type: 'ally', unitType: type as string, stats: UNIT_TYPES[type], currentHp: UNIT_TYPES[type].hp });
      audio.playSystemSE(660);
    }
  };

  const handleUpgrade = () => { const s = stateRef.current; const cost = ui.walletLevel * 200; if (s.money >= cost && s.walletLevel < 8) { s.money -= cost; s.walletLevel++; audio.playUpgradeSound(); } };

  // にゃんこ砲発射シーケンス (チャージ ➔ 爆発)
  const handleCannon = () => {
    const s = stateRef.current;
    if (s.cannonCharge < 100 || s.isCannonCharging || s.isCannonFiring) return;
    
    s.isCannonCharging = true;
    s.cannonCharge = 0;
    audio.playCannonChargeSound(); // チャージ音

    setTimeout(() => {
      s.isCannonCharging = false;
      s.isCannonFiring = true;
      audio.playCannonExplosionSound(); // 爆発音
      
      // ダメージとノックバック
      s.units = s.units.map(u => u.type === 'enemy' ? { ...u, currentHp: u.currentHp - 150, x: u.x + 120 } : u).filter(u => u.currentHp > 0);
      
      setTimeout(() => { s.isCannonFiring = false; }, 600);
    }, 500); // 0.5秒チャージ
  };

  return (
    <div style={{ textAlign: 'center', backgroundColor: '#ecf0f1', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
        <h1>ねこねこ大戦争プロトタイプ</h1>
        <button onClick={() => audio.setIsAudioEnabled(!audio.isAudioEnabled)} style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', background: audio.isAudioEnabled ? '#e74c3c' : '#2ecc71', color: '#fff', cursor: 'pointer' }}>SOUND: {audio.isAudioEnabled ? 'OFF' : 'ON'}</button>
      </div>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ border: '4px solid #34495e', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} />
        {ui.gameState === 'title' && (
          <div onClick={toStageSelect} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', cursor: 'pointer', padding: '40px 0' }}>
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '20px 40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', border: '4px solid #2c3e50', marginTop: '20px' }}><h2 style={{ fontSize: '50px', color: '#2c3e50', margin: 0, textShadow: '2px 2px 0 #fff, 4px 4px 0 #bdc3c7' }}>ねこねこ大戦争</h2></div>
            <div style={{ marginBottom: '60px', background: 'linear-gradient(to bottom, #f1c40f, #f39c12)', padding: '5px 15px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '3px solid #fff', outline: '2px solid #2c3e50', animation: 'blink 1.2s infinite' }}><p style={{ fontSize: '22px', color: '#fff', fontWeight: '900', margin: 0, letterSpacing: '2px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>CLICK TO START</p></div>
            <style>{`@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }`}</style>
          </div>
        )}
        {ui.gameState === 'start' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>ステージ選択</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '20px' }}>{Object.values(STAGES).map(stage => (<button key={stage.id} onClick={() => startGame(stage)} style={{ padding: '15px 25px', fontSize: '16px', cursor: 'pointer', borderRadius: '10px', background: stage.id % 2 === 0 ? '#e67e22' : '#2ecc71', color: '#fff', border: 'none', fontWeight: 'bold', boxShadow: '0 4px rgba(0,0,0,0.3)' }}>第{stage.id}章<br/>{stage.name}</button>))}</div>
            <button onClick={backToTitle} style={{ marginTop: '20px', background: 'none', border: '1px solid #fff', color: '#fff', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>タイトルへ戻る</button>
          </div>
        )}
        {ui.gameState === 'playing' && ( <button onClick={backToMenu} style={{ position: 'absolute', top: '10px', right: '10px', padding: '5px 15px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>メニューへ戻る</button> )}
        {(ui.gameState === 'victory' || ui.gameState === 'defeat') && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '60px', color: ui.gameState === 'victory' ? '#f1c40f' : '#e74c3c' }}>{ui.gameState.toUpperCase()}</h2>
            <button onClick={backToMenu} style={{ padding: '15px 40px', fontSize: '24px', cursor: 'pointer', borderRadius: '8px', background: '#3498db', color: '#fff', border: 'none', fontWeight: 'bold' }}>BACK TO MENU</button>
          </div>
        )}
      </div>
      {ui.gameState === 'playing' && (
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '20px', animation: 'fadeIn 0.5s' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <GaugeButton label={<>にゃんこ砲<br/>({ui.cannonCharge}%)</>} percent={ui.cannonCharge} onClick={handleCannon} disabled={ui.cannonCharge < 100 || ui.gameState !== 'playing'} readyColor="#e74c3c" gaugeColor="#f39c12" width="120px" />
            <GaugeButton label={<>働きネコ Lv.{ui.walletLevel}<br/>(${ui.walletLevel * 200})</>} percent={100} onClick={handleUpgrade} disabled={ui.money < ui.walletLevel * 200 || ui.walletLevel >= 8 || ui.gameState !== 'playing'} readyColor="#e67e22" gaugeColor="#e67e22" width="120px" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 120px)', gridTemplateRows: 'repeat(2, auto)', gap: '10px' }}>
            {(['BASIC', 'TANK', 'BATTLE', 'LEGS', 'COW', 'BIRD', 'FISH', 'LIZARD'] as const).map(t => {
              const percent = (ui.cooldownPercents as any)[t];
              const isReady = percent >= 100 && ui.money >= UNIT_TYPES[t].cost;
              return ( <GaugeButton key={t} label={<>{UNIT_TYPES[t].name}<br/>(${UNIT_TYPES[t].cost})</>} percent={percent} onClick={() => handleSpawn(t)} disabled={!isReady || ui.gameState !== 'playing'} readyColor="#2ecc71" gaugeColor="#3498db" width="120px" /> );
            })}
          </div>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      )}
    </div>
  );
};

export default Game;
