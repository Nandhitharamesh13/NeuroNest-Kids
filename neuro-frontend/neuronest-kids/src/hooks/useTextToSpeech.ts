import { useCallback, useState, useEffect, useRef } from 'react';

interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const enabledRef = useRef(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback((text: string, options: TTSOptions = {}) => {
    if (!isSupported || !enabledRef.current) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure voice - prefer child-friendly voices
    const childVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Karen') ||
      v.name.includes('Moira') ||
      v.name.includes('Google UK English Female') ||
      v.lang.startsWith('en')
    ) || voices[0];

    if (childVoice) {
      utterance.voice = childVoice;
    }

    // Set speech parameters - slower for children
    utterance.rate = options.rate ?? 0.85; // Slower rate for children
    utterance.pitch = options.pitch ?? 1.1; // Slightly higher pitch
    utterance.volume = options.volume ?? 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, voices]);

  const speakInstruction = useCallback((text: string) => {
    speak(text, { rate: 0.8, pitch: 1.1 });
  }, [speak]);

  const speakCelebration = useCallback((text: string) => {
    speak(text, { rate: 0.9, pitch: 1.2 });
  }, [speak]);

  const speakEncouragement = useCallback((text: string) => {
    speak(text, { rate: 0.85, pitch: 1.1 });
  }, [speak]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    if (!enabled) {
      stop();
    }
  }, [stop]);

  return {
    speak,
    speakInstruction,
    speakCelebration,
    speakEncouragement,
    stop,
    isSpeaking,
    isSupported,
    setEnabled,
    voices,
  };
}
