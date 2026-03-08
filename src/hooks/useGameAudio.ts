import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import * as BattleSE from '../audio/se/battle';
import * as SystemSE from '../audio/se/system';
import * as BgmMusic from '../audio/music/bgm';
import * as Jingles from '../audio/music/jingles';

let globalAudioCtx: AudioContext | null = null;

export const useGameAudio = () => {
  const bgmTimerRef = useRef<number | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const isAudioEnabledRef = useRef(true);

  useEffect(() => { isAudioEnabledRef.current = isAudioEnabled; }, [isAudioEnabled]);

  const getCtx = useCallback(() => {
    if (!globalAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      globalAudioCtx = new AudioContextClass();
    }
    if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
    return globalAudioCtx;
  }, []);

  const stopBGM = useCallback(() => {
    if (bgmTimerRef.current !== null) {
      window.clearTimeout(bgmTimerRef.current);
      bgmTimerRef.current = null;
    }
  }, []);

  const startBGM = useCallback((stageId: number) => {
    stopBGM();
    const ctx = getCtx();
    let step = 0;
    const playNext = () => {
      if (isAudioEnabledRef.current && globalAudioCtx?.state === 'running') {
        BgmMusic.playBgmStep(globalAudioCtx, stageId, step++);
      }
      bgmTimerRef.current = window.setTimeout(playNext, 400);
    };
    playNext();
  }, [getCtx, stopBGM]);

  return useMemo(() => ({
    isAudioEnabled,
    setIsAudioEnabled,
    initAudio: getCtx,
    startBGM,
    stopBGM,
    playSystemSE: (f: number) => { if (isAudioEnabledRef.current) SystemSE.playSpawn(getCtx()); },
    playCharinSound: () => { if (isAudioEnabledRef.current) SystemSE.playCharin(getCtx()); },
    playUpgradeSound: () => { if (isAudioEnabledRef.current) SystemSE.playUpgrade(getCtx()); },
    playGashiSound: () => { if (isAudioEnabledRef.current) BattleSE.playGashi(getCtx()); },
    playCannonSound: () => { if (isAudioEnabledRef.current) BattleSE.playCannon(getCtx()); },
    playVictoryFanfare: () => { if (isAudioEnabledRef.current) Jingles.playVictory(getCtx()); },
    playDefeatJingle: () => { if (isAudioEnabledRef.current) Jingles.playDefeat(getCtx()); }
  }), [isAudioEnabled, getCtx, startBGM, stopBGM]);
};
