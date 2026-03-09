import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { playGashi, playCannonCharge, playCannonExplosion } from '../audio/se/battle';
import { playCharin, playUpgrade } from '../audio/se/system';
import { playBgmStep } from '../audio/music/bgm';
import { playVictory, playDefeat } from '../audio/music/jingles';

let globalAudioCtx: AudioContext | null = null;

export const useGameAudio = () => {
  const bgmTimeoutRef = useRef<number | null>(null);
  const [isAudioEnabled, _setIsAudioEnabled] = useState(true);
  const isAudioEnabledRef = useRef(true);
  const currentStageIdRef = useRef<number>(1);
  const bgmStepRef = useRef<number>(0); // BGMの再生ステップを保持

  const getCtx = useCallback(() => {
    if (!globalAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      globalAudioCtx = new AudioContextClass();
    }
    if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
    return globalAudioCtx;
  }, []);

  const stopBGM = useCallback(() => {
    if (bgmTimeoutRef.current !== null) {
      window.clearTimeout(bgmTimeoutRef.current);
      bgmTimeoutRef.current = null;
    }
  }, []);

  // BGMの再生ループ（内部用）
  const runBgmLoop = useCallback(() => {
    const playNextNote = () => {
      if (bgmTimeoutRef.current === null) return;
      if (isAudioEnabledRef.current && globalAudioCtx?.state === 'running') {
        playBgmStep(globalAudioCtx, currentStageIdRef.current, bgmStepRef.current++);
      }
      bgmTimeoutRef.current = window.setTimeout(playNextNote, 400);
    };
    bgmTimeoutRef.current = 0;
    playNextNote();
  }, []);

  const startBGM = useCallback((stageId: number) => {
    stopBGM(); 
    currentStageIdRef.current = stageId;
    bgmStepRef.current = 0; // 最初から再生
    getCtx();
    runBgmLoop();
  }, [getCtx, stopBGM, runBgmLoop]);

  const pauseBGM = useCallback(() => {
    stopBGM(); // タイマーを止めるだけで stepRef は保持される
  }, [stopBGM]);

  const resumeBGM = useCallback(() => {
    if (bgmTimeoutRef.current !== null) return; // 既に再生中なら何もしない
    getCtx();
    runBgmLoop(); // 現在の stepRef から再開
  }, [getCtx, runBgmLoop]);

  const setIsAudioEnabled = useCallback((enabled: boolean) => {
    _setIsAudioEnabled(enabled);
    isAudioEnabledRef.current = enabled;
  }, []);

  useEffect(() => {
    return () => stopBGM();
  }, [stopBGM]);

  return useMemo(() => ({
    isAudioEnabled,
    setIsAudioEnabled,
    initAudio: getCtx,
    startBGM,
    stopBGM,
    pauseBGM,
    resumeBGM,
    playSystemSE: (f: number) => {
      if (!isAudioEnabledRef.current) return;
      const ctx = getCtx();
      if (ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f, now); g.gain.setValueAtTime(0.05, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1); o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.1);
    },
    playCharinSound: () => { if (isAudioEnabledRef.current) playCharin(getCtx()); },
    playUpgradeSound: () => { if (isAudioEnabledRef.current) playUpgrade(getCtx()); },
    playGashiSound: () => { if (isAudioEnabledRef.current) playGashi(getCtx()); },
    playCannonChargeSound: () => { if (isAudioEnabledRef.current) playCannonCharge(getCtx()); },
    playCannonExplosionSound: () => { if (isAudioEnabledRef.current) playCannonExplosion(getCtx()); },
    playVictoryFanfare: () => { if (isAudioEnabledRef.current) playVictory(getCtx()); },
    playDefeatJingle: () => { if (isAudioEnabledRef.current) playDefeat(getCtx()); }
  }), [isAudioEnabled, getCtx, startBGM, stopBGM, pauseBGM, resumeBGM, setIsAudioEnabled]);
};

export type GameAudio = ReturnType<typeof useGameAudio>;
