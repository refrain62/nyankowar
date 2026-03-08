import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { playGashi, playCannon } from '../audio/se/battle';
import { playSpawn, playCharin, playUpgrade } from '../audio/se/system';
import { playBgmStep } from '../audio/music/bgm';
import { playVictory, playDefeat } from '../audio/music/jingles';

// ブラウザ全体で共有するシングルトンAudioContext
let globalAudioCtx: AudioContext | null = null;

/**
 * ゲームのサウンドシステムを一括管理するフック
 */
export const useGameAudio = () => {
  const bgmTimeoutRef = useRef<number | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const isAudioEnabledRef = useRef(true);
  const currentStageIdRef = useRef<number>(1);

  // 設定をRefに同期
  useEffect(() => { isAudioEnabledRef.current = isAudioEnabled; }, [isAudioEnabled]);

  const getCtx = useCallback(() => {
    if (!globalAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      globalAudioCtx = new AudioContextClass();
    }
    if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
    return globalAudioCtx;
  }, []);

  // BGMを完全に停止
  const stopBGM = useCallback(() => {
    if (bgmTimeoutRef.current !== null) {
      window.clearTimeout(bgmTimeoutRef.current);
      bgmTimeoutRef.current = null;
    }
  }, []);

  // BGM開始
  const startBGM = useCallback((stageId: number) => {
    stopBGM(); 
    currentStageIdRef.current = stageId;
    const ctx = getCtx();
    let step = 0;

    const playNextNote = () => {
      if (bgmTimeoutRef.current === null) return;

      if (isAudioEnabledRef.current && globalAudioCtx?.state === 'running') {
        // インポートした関数を直接呼び出す
        playBgmStep(globalAudioCtx, currentStageIdRef.current, step++);
      }
      
      bgmTimeoutRef.current = window.setTimeout(playNextNote, 400);
    };

    bgmTimeoutRef.current = window.setTimeout(playNextNote, 0);
  }, [getCtx, stopBGM]);

  // 効果音再生用の汎用関数
  const playOscDirect = useCallback((f: number, type: OscillatorType, dur: number, vol: number) => {
    if (!isAudioEnabledRef.current) return;
    const ctx = getCtx();
    if (ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, now); g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur); o.connect(g); g.connect(ctx.destination);
    o.start(now); o.stop(now + dur);
  }, [getCtx]);

  // 外部へ提供するAPI
  return useMemo(() => ({
    isAudioEnabled,
    setIsAudioEnabled,
    initAudio: getCtx,
    startBGM,
    stopBGM,
    playSystemSE: (f: number) => playOscDirect(f, 'sine', 0.1, 0.05),
    playCharinSound: () => { if (isAudioEnabledRef.current) playCharin(getCtx()); },
    playUpgradeSound: () => { if (isAudioEnabledRef.current) playUpgrade(getCtx()); },
    playGashiSound: () => { if (isAudioEnabledRef.current) playGashi(getCtx()); },
    playCannonSound: () => { if (isAudioEnabledRef.current) playCannon(getCtx()); },
    playVictoryFanfare: () => { if (isAudioEnabledRef.current) playVictory(getCtx()); },
    playDefeatJingle: () => { if (isAudioEnabledRef.current) playDefeat(getCtx()); }
  }), [isAudioEnabled, getCtx, startBGM, stopBGM, playOscDirect]);
};
