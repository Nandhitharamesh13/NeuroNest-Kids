import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { GuideCharacter, PAGE_CHARACTERS, CharacterType } from './GuideCharacters';
import { useGuideSounds } from '@/hooks/useGuideSounds';
import { X, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

interface GuideMessage {
  text: string;
  emotion: 'neutral' | 'happy' | 'thinking' | 'encouraging' | 'waving';
  persist?: boolean;
}

interface FloatingGuideContextType {
  showGuide: (message: string, emotion?: GuideMessage['emotion'], persist?: boolean) => void;
  hideGuide: () => void;
  setGuideEnabled: (enabled: boolean) => void;
}

const FloatingGuideContext = createContext<FloatingGuideContextType | undefined>(undefined);

export function useFloatingGuide() {
  const context = useContext(FloatingGuideContext);
  if (!context) {
    throw new Error('useFloatingGuide must be used within FloatingGuideProvider');
  }
  return context;
}

// Professional, kid-friendly messages
const routeMessages: Record<string, GuideMessage> = {
  '/': {
    text: "Welcome! Tap the button below to start your learning adventure.",
    emotion: 'waving',
  },
  '/auth': {
    text: "Please ask a parent to help you create an account or sign in.",
    emotion: 'encouraging',
  },
  '/parent-dashboard': {
    text: "Welcome to your dashboard. Here you can manage profiles and view learning progress.",
    emotion: 'happy',
  },
  '/child-dashboard': {
    text: "Choose a game to play! Each one helps you learn something new.",
    emotion: 'encouraging',
  },
  '/games/shapes': {
    text: "Match the shapes! Look carefully and find the right one.",
    emotion: 'encouraging',
  },
  '/games/colors': {
    text: "Find the matching color! Read the name and tap the correct one.",
    emotion: 'happy',
  },
  '/games/fruits': {
    text: "Learn about healthy foods! Discover fruits and vegetables.",
    emotion: 'happy',
  },
  '/games/sorting': {
    text: "Drag each item to the correct category. Take your time!",
    emotion: 'thinking',
  },
};

const STORAGE_KEY = 'neuronest-guide-dismissed';
const SOUND_KEY = 'neuronest-guide-sound';

export function FloatingGuideProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const sounds = useGuideSounds();
  const [message, setMessage] = useState<GuideMessage | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [isEnabled, setIsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(SOUND_KEY);
    return saved !== 'false';
  });
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<{ type: CharacterType; name: string; color: string }>(
    PAGE_CHARACTERS['/']
  );
  const [isVisible, setIsVisible] = useState(false);

  // Save sound preference
  useEffect(() => {
    localStorage.setItem(SOUND_KEY, soundEnabled.toString());
    sounds.setSoundsEnabled(soundEnabled);
  }, [soundEnabled, sounds]);

  // Get character and message based on route
  useEffect(() => {
    if (!isEnabled || isDismissed) return;
    
    const path = location.pathname;
    
    // Find matching character
    let charInfo = PAGE_CHARACTERS['/'];
    let routeMessage: GuideMessage | undefined;

    // Match exact routes first
    if (PAGE_CHARACTERS[path]) {
      charInfo = PAGE_CHARACTERS[path];
    } else {
      // Match partial routes
      Object.keys(PAGE_CHARACTERS).forEach(route => {
        if (path.startsWith(route) && route !== '/') {
          charInfo = PAGE_CHARACTERS[route];
        }
      });
    }

    // Match message
    if (routeMessages[path]) {
      routeMessage = routeMessages[path];
    } else {
      Object.keys(routeMessages).forEach(route => {
        if (path.startsWith(route) && route !== '/') {
          routeMessage = routeMessages[route];
        }
      });
    }

    setCurrentCharacter(charInfo);
    
    if (routeMessage) {
      setMessage(routeMessage);
      setIsMinimized(false);
      // Animate in
      setTimeout(() => setIsVisible(true), 100);
      if (soundEnabled) {
        sounds.playPopIn();
      }
    }
  }, [location.pathname, isEnabled, isDismissed, soundEnabled, sounds]);

  // Typewriter effect
  useEffect(() => {
    if (!message?.text || isDismissed) return;
    
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < message.text.length) {
        setDisplayedText(message.text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [message?.text, isDismissed]);

  const showGuide = useCallback((text: string, emotion: GuideMessage['emotion'] = 'neutral', persist = false) => {
    if (isDismissed) return;
    setMessage({ text, emotion, persist });
    setIsMinimized(false);
    setIsVisible(true);
    if (soundEnabled) {
      sounds.playMessage();
    }
  }, [isDismissed, soundEnabled, sounds]);

  const hideGuide = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setTimeout(() => {
      setMessage(null);
    }, 300);
  }, []);

  const setGuideEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      setMessage(null);
      setIsDismissed(true);
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
    if (!soundEnabled) {
      sounds.playTap();
    }
  }, [soundEnabled, sounds]);

  const reopenGuide = useCallback(() => {
    setIsDismissed(false);
    sessionStorage.removeItem(STORAGE_KEY);
    // Trigger route message again
    const path = location.pathname;
    let routeMessage: GuideMessage | undefined;
    if (routeMessages[path]) {
      routeMessage = routeMessages[path];
    } else {
      Object.keys(routeMessages).forEach(route => {
        if (path.startsWith(route) && route !== '/') {
          routeMessage = routeMessages[route];
        }
      });
    }
    if (routeMessage) {
      setMessage(routeMessage);
      setIsMinimized(false);
      setTimeout(() => setIsVisible(true), 100);
      if (soundEnabled) sounds.playPopIn();
    }
  }, [location.pathname, soundEnabled, sounds]);

  // If dismissed, show a small button to reopen
  if (isDismissed) {
    return (
      <FloatingGuideContext.Provider value={{ showGuide, hideGuide, setGuideEnabled }}>
        {children}
        {isEnabled && (
          <Button
            onClick={reopenGuide}
            className="fixed bottom-4 left-4 z-50 rounded-full w-12 h-12 shadow-lg gpu-accelerated"
            style={{ 
              background: currentCharacter.color,
            }}
            size="icon"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </Button>
        )}
      </FloatingGuideContext.Provider>
    );
  }

  if (!message || !isEnabled) {
    return (
      <FloatingGuideContext.Provider value={{ showGuide, hideGuide, setGuideEnabled }}>
        {children}
      </FloatingGuideContext.Provider>
    );
  }

  return (
    <FloatingGuideContext.Provider value={{ showGuide, hideGuide, setGuideEnabled }}>
      {children}
      
      {/* Floating Guide Character */}
      <div
        className={cn(
          'fixed bottom-4 left-4 z-50 flex items-end gap-3 gpu-accelerated',
          'transition-all duration-300 ease-out',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        )}
      >
        {/* Character */}
        <div className="relative">
          {/* Subtle glow */}
          <div 
            className="absolute inset-0 rounded-full blur-xl opacity-30 gpu-accelerated"
            style={{ background: currentCharacter.color, transform: 'scale(1.3)' }}
          />
          
          <GuideCharacter 
            type={currentCharacter.type}
            size="md" 
            animated
            waving={message.emotion === 'waving' || message.emotion === 'encouraging'}
          />
        </div>

        {/* Speech bubble */}
        {!isMinimized && (
          <div 
            className="relative gpu-accelerated"
            style={{ animation: 'bubble-in 0.25s ease-out' }}
          >
            {/* Bubble */}
            <div 
              className="bg-card rounded-2xl px-4 py-3 shadow-lg border-2 max-w-[260px] md:max-w-xs"
              style={{ borderColor: `${currentCharacter.color}30` }}
            >
              {/* Bubble tail */}
              <div 
                className="absolute left-[-8px] bottom-4 w-4 h-4 bg-card rotate-45 border-l-2 border-b-2"
                style={{ borderColor: `${currentCharacter.color}30` }}
              />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span 
                  className="font-semibold text-xs"
                  style={{ color: currentCharacter.color }}
                >
                  {currentCharacter.name}
                </span>
                <div className="flex gap-1">
                  {/* Sound toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-muted"
                    onClick={toggleSound}
                    title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-3 w-3" />
                    ) : (
                      <VolumeX className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                  {/* Close */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-destructive/10"
                    onClick={hideGuide}
                    title="Close guide"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Message */}
              <p className="text-foreground font-medium text-sm leading-relaxed">
                {displayedText}
                {isTyping && <span className="animate-pulse ml-0.5 text-primary">|</span>}
              </p>
              
              {/* Sound settings hint */}
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                {soundEnabled ? <Volume2 className="w-2.5 h-2.5" /> : <VolumeX className="w-2.5 h-2.5" />}
                Sound {soundEnabled ? 'on' : 'off'} - tap icon to change
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bubble-in {
          0% { opacity: 0; transform: scale(0.9) translateX(-8px); }
          100% { opacity: 1; transform: scale(1) translateX(0); }
        }
      `}</style>
    </FloatingGuideContext.Provider>
  );
}
