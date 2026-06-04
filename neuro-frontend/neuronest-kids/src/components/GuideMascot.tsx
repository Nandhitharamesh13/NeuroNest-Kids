import { cn } from '@/lib/utils';
import { Mascot } from './Mascot';
import { useEffect, useState } from 'react';

interface GuideMascotProps {
  message: string;
  emotion?: 'neutral' | 'happy' | 'thinking' | 'encouraging' | 'celebrating';
  position?: 'left' | 'right' | 'center';
  animated?: boolean;
  className?: string;
}

export function GuideMascot({ 
  message, 
  emotion = 'neutral', 
  position = 'left',
  animated = true,
  className 
}: GuideMascotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Typewriter effect
    if (message) {
      setIsTyping(true);
      setDisplayedMessage('');
      let index = 0;
      const timer = setInterval(() => {
        if (index < message.length) {
          setDisplayedMessage(message.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [message]);

  const positionClasses = {
    left: 'flex-row',
    right: 'flex-row-reverse',
    center: 'flex-col items-center',
  };

  const bubblePositionClasses = {
    left: 'ml-2',
    right: 'mr-2',
    center: 'mt-2',
  };

  return (
    <div 
      className={cn(
        'flex items-end gap-2 transition-all duration-500 gpu-accelerated',
        positionClasses[position],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      <div className="relative flex-shrink-0">
        <Mascot 
          size="md" 
          animated={animated} 
          happy={emotion === 'happy' || emotion === 'celebrating'} 
          waving={emotion === 'encouraging' || emotion === 'celebrating'}
        />
        {/* Emotion indicators */}
        {emotion === 'thinking' && (
          <div className="absolute -top-2 -right-1 text-xl animate-bounce">🤔</div>
        )}
        {emotion === 'happy' && (
          <div className="absolute -top-2 -right-1 text-xl animate-bounce">✨</div>
        )}
        {emotion === 'encouraging' && (
          <div className="absolute -top-2 -right-1 text-xl animate-bounce">💪</div>
        )}
        {emotion === 'celebrating' && (
          <div className="absolute -top-2 -right-1 text-xl animate-bounce">🎉</div>
        )}
      </div>

      {/* Speech bubble */}
      <div 
        className={cn(
          'relative bg-card rounded-2xl px-4 py-3 shadow-card max-w-xs',
          'border-2 border-primary/20',
          bubblePositionClasses[position],
          'animate-scale-in'
        )}
      >
        {/* Bubble tail */}
        <div 
          className={cn(
            'absolute w-4 h-4 bg-card border-l-2 border-b-2 border-primary/20 rotate-45',
            position === 'left' && 'left-[-9px] bottom-4',
            position === 'right' && 'right-[-9px] bottom-4',
            position === 'center' && 'top-[-9px] left-1/2 -translate-x-1/2 rotate-[135deg]'
          )}
        />
        <p className="text-foreground font-medium text-sm md:text-base relative z-10">
          {displayedMessage}
          {isTyping && <span className="animate-pulse ml-1">|</span>}
        </p>
      </div>
    </div>
  );
}
