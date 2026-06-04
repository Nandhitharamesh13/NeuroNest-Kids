import { useCallback, useRef, useEffect } from 'react';

// Audio context for guide sounds
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (needed for autoplay policies)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

export function useGuideSounds() {
  const isEnabledRef = useRef(true);
  const lastPlayTimeRef = useRef<Record<string, number>>({});

  const playNote = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.2, delay = 0) => {
    if (!isEnabledRef.current) return;

    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      const startTime = ctx.currentTime + delay;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  // Friendly "pop" sound when guide appears
  const playPopIn = useCallback(() => {
    const now = Date.now();
    if (now - (lastPlayTimeRef.current.pop || 0) < 300) return;
    lastPlayTimeRef.current.pop = now;

    // Cheerful ascending pop
    playNote(600, 0.08, 'sine', 0.15);
    playNote(800, 0.1, 'sine', 0.12, 0.05);
    playNote(1000, 0.12, 'sine', 0.1, 0.1);
  }, [playNote]);

  // Gentle notification sound for new message
  const playMessage = useCallback(() => {
    const now = Date.now();
    if (now - (lastPlayTimeRef.current.message || 0) < 300) return;
    lastPlayTimeRef.current.message = now;

    // Soft chime
    playNote(523, 0.15, 'sine', 0.12);
    playNote(659, 0.2, 'sine', 0.1, 0.1);
  }, [playNote]);

  // Happy celebration sound
  const playSuccess = useCallback(() => {
    const now = Date.now();
    if (now - (lastPlayTimeRef.current.success || 0) < 500) return;
    lastPlayTimeRef.current.success = now;

    // Triumphant fanfare
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      playNote(freq, 0.2, 'sine', 0.15, i * 0.1);
    });
  }, [playNote]);

  // Encouraging sound
  const playEncourage = useCallback(() => {
    const now = Date.now();
    if (now - (lastPlayTimeRef.current.encourage || 0) < 300) return;
    lastPlayTimeRef.current.encourage = now;

    // Warm encouraging tone
    playNote(440, 0.15, 'triangle', 0.12);
    playNote(554, 0.2, 'triangle', 0.1, 0.08);
    playNote(659, 0.25, 'triangle', 0.08, 0.15);
  }, [playNote]);

  // Error/wrong sound (gentle, not scary)
  const playOops = useCallback(() => {
    const now = Date.now();
    if (now - (lastPlayTimeRef.current.oops || 0) < 300) return;
    lastPlayTimeRef.current.oops = now;

    // Soft descending tone
    playNote(350, 0.15, 'triangle', 0.1);
    playNote(280, 0.2, 'triangle', 0.08, 0.1);
  }, [playNote]);

  // Click/tap feedback
  const playTap = useCallback(() => {
    playNote(700, 0.04, 'sine', 0.08);
  }, [playNote]);

  // Toggle sounds on/off
  const setSoundsEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  return {
    playPopIn,
    playMessage,
    playSuccess,
    playEncourage,
    playOops,
    playTap,
    setSoundsEnabled,
  };
}
