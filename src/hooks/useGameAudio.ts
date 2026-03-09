import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { playGashi, playCannonCharge, playCannonExplosion } from '../audio/se/battle';
import { playCharin, playUpgrade } from '../audio/se/system';
import { playBgmStep } from '../audio/music/bgm';
import { playVictory, playDefeat } from '../audio/music/jingles';

// ブラウザ全体で共有するシングルトンAudioContext
let globalAudioCtx: AudioContext | null = null;

/**
 * ゲームのオーディオを管理するカスタムフック。
 * 状態の同期に useEffect を使わず、全てのメソッドを Stable (再生成されない) に保ちます。
 */
export const useGameAudio = () => {
  const bgmTimeoutRef = useRef<number | null>(null);
  const [isAudioEnabled, _setIsAudioEnabled] = useState(true);
  const isAudioEnabledRef = useRef(true);
  const currentStageIdRef = useRef<number>(1);

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

  const startBGM = useCallback((stageId: number) => {
    stopBGM(); 
    currentStageIdRef.current = stageId;
    getCtx();
    let step = 0;
    
    // BGMの再生ループ (setTimeoutを使用)
    const playNextNote = () => {
      // bgmTimeoutRef.current が null の場合は停止中とみなす
      if (bgmTimeoutRef.current === null) return;
      
      if (isAudioEnabledRef.current && globalAudioCtx?.state === 'running') {
        playBgmStep(globalAudioCtx, currentStageIdRef.current, step++);
      }
      bgmTimeoutRef.current = window.setTimeout(playNextNote, 400);
    };

    // ループ開始フラグとして適当な値をセット
    bgmTimeoutRef.current = 0;
    playNextNote();
  }, [getCtx, stopBGM]);

  const setIsAudioEnabled = useCallback((enabled: boolean) => {
    _setIsAudioEnabled(enabled);
    isAudioEnabledRef.current = enabled;
  }, []);

  /**
   * 【設計意図】アンマウント時にBGMを確実に停止するためのクリーンアップ。
   * Reactの外部リソース（Web Audio API）を管理する際の、唯一の「正しいuseEffect」の使い道です。
   */
  useEffect(() => {
    return () => stopBGM();
  }, [stopBGM]);

  /**
   * 【設計意図】返却されるオブジェクトの参照を完全に固定。
   * これにより、利用側の useEffect(..., [audio]) や audioRef による同期が不要になります。
   * ゲームループのような高頻度で更新されるロジックに渡すのに最適化されています。
   */
  return useMemo(() => ({
    isAudioEnabled,
    setIsAudioEnabled,
    initAudio: getCtx,
    startBGM,
    stopBGM,
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
  }), [isAudioEnabled, getCtx, startBGM, stopBGM, setIsAudioEnabled]);
};

export type GameAudio = ReturnType<typeof useGameAudio>;
