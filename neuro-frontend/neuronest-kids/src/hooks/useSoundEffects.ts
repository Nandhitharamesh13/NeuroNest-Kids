import { useCallback, useRef } from 'react';

// Create audio context lazily
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export function useSoundEffects() {
  const lastPlayTime = useRef<Record<string, number>>({});

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  const playCorrect = useCallback(() => {
    const now = Date.now();
    if (now - (lastPlayTime.current.correct || 0) < 200) return;
    lastPlayTime.current.correct = now;

    // Happy ascending arpeggio
    playTone(523.25, 0.15, 'sine', 0.4); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.4), 80); // E5
    setTimeout(() => playTone(783.99, 0.2, 'sine', 0.4), 160); // G5
    setTimeout(() => playTone(1046.5, 0.3, 'sine', 0.35), 240); // C6
  }, [playTone]);

  const playWrong = useCallback(() => {
    const now = Date.now();
    if (now - (lastPlayTime.current.wrong || 0) < 200) return;
    lastPlayTime.current.wrong = now;

    // Gentle descending tone
    playTone(330, 0.2, 'triangle', 0.25);
    setTimeout(() => playTone(262, 0.25, 'triangle', 0.2), 120);
  }, [playTone]);

  const playDrop = useCallback(() => {
    // Soft plop sound
    playTone(400, 0.08, 'sine', 0.3);
    setTimeout(() => playTone(300, 0.1, 'sine', 0.2), 40);
  }, [playTone]);

  const playPick = useCallback(() => {
    // Quick pick up sound
    playTone(600, 0.06, 'sine', 0.25);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    // Celebratory fanfare
    const notes = [523.25, 659.25, 783.99, 880, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.35), i * 100);
    });
  }, [playTone]);

  const playEncourage = useCallback(() => {
    // Gentle encouraging sound
    playTone(440, 0.15, 'sine', 0.2);
    setTimeout(() => playTone(554.37, 0.2, 'sine', 0.2), 100);
  }, [playTone]);

  const playComplete = useCallback(() => {
    // Completion fanfare
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, 'sine', 0.3), i * 120);
    });
  }, [playTone]);

  const playClick = useCallback(() => {
    // Quick click sound
    playTone(800, 0.05, 'sine', 0.2);
  }, [playTone]);

  return {
    playCorrect,
    playWrong,
    playDrop,
    playPick,
    playSuccess,
    playEncourage,
    playComplete,
    playClick,
  };
}
