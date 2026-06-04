import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import gsap from 'gsap';

interface MiniGameCardProps {
  title: string;
  emoji: string;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
  progress?: number;
}

const colorClasses: Record<string, { bg: string; shadow: string; glow: string }> = {
  green: { 
    bg: 'bg-gradient-to-br from-duo-green to-emerald-500', 
    shadow: 'shadow-[0_6px_0_hsl(145,65%,30%)]',
    glow: 'hover:shadow-[0_0_20px_rgba(76,175,80,0.4)]'
  },
  blue: { 
    bg: 'bg-gradient-to-br from-duo-blue to-cyan-500', 
    shadow: 'shadow-[0_6px_0_hsl(200,85%,35%)]',
    glow: 'hover:shadow-[0_0_20px_rgba(33,150,243,0.4)]'
  },
  orange: { 
    bg: 'bg-gradient-to-br from-duo-orange to-amber-500', 
    shadow: 'shadow-[0_6px_0_hsl(28,95%,40%)]',
    glow: 'hover:shadow-[0_0_20px_rgba(255,152,0,0.4)]'
  },
  purple: { 
    bg: 'bg-gradient-to-br from-duo-purple to-violet-500', 
    shadow: 'shadow-[0_6px_0_hsl(270,75%,45%)]',
    glow: 'hover:shadow-[0_0_20px_rgba(156,39,176,0.4)]'
  },
  pink: { 
    bg: 'bg-gradient-to-br from-duo-pink to-rose-400', 
    shadow: 'shadow-[0_6px_0_hsl(330,80%,45%)]',
    glow: 'hover:shadow-[0_0_20px_rgba(233,30,99,0.4)]'
  },
  teal: { 
    bg: 'bg-gradient-to-br from-duo-teal to-cyan-600', 
    shadow: 'shadow-[0_6px_0_hsl(175,70%,32%)]',
    glow: 'hover:shadow-[0_0_20px_rgba(0,150,136,0.4)]'
  },
  yellow: { 
    bg: 'bg-gradient-to-br from-duo-yellow to-amber-400', 
    shadow: 'shadow-[0_6px_0_hsl(45,95%,40%)]',
    glow: 'hover:shadow-[0_0_20px_rgba(255,193,7,0.4)]'
  },
  red: { 
    bg: 'bg-gradient-to-br from-duo-red to-rose-500', 
    shadow: 'shadow-[0_6px_0_hsl(0,75%,40%)]',
    glow: 'hover:shadow-[0_0_20px_rgba(244,67,54,0.4)]'
  },
};

export function MiniGameCard({ 
  title, 
  emoji, 
  color, 
  onClick, 
  disabled = false,
  progress = 0 
}: MiniGameCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const colorStyle = colorClasses[color] || colorClasses.green;

  useEffect(() => {
    if (!emojiRef.current) return;
    
    // Gentle floating animation for emoji
    gsap.to(emojiRef.current, {
      y: -3,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;
    gsap.to(cardRef.current, {
      y: -6,
      scale: 1.02,
      duration: 0.25,
      ease: 'power2.out',
    });
    gsap.to(emojiRef.current, {
      scale: 1.15,
      rotation: 5,
      duration: 0.25,
      ease: 'back.out(2)',
    });
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
    });
    gsap.to(emojiRef.current, {
      scale: 1,
      rotation: 0,
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  const handleMouseDown = () => {
    if (disabled) return;
    gsap.to(cardRef.current, {
      y: 2,
      scale: 0.98,
      duration: 0.1,
      ease: 'power2.in',
    });
  };

  const handleMouseUp = () => {
    if (disabled) return;
    gsap.to(cardRef.current, {
      y: -6,
      scale: 1.02,
      duration: 0.15,
      ease: 'power2.out',
    });
  };

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={cn(
        'relative w-full text-center rounded-2xl p-4 md:p-5 transition-colors cursor-pointer',
        colorStyle.bg,
        colorStyle.shadow,
        colorStyle.glow,
        'transform-gpu will-change-transform',
        disabled && 'opacity-60 cursor-not-allowed grayscale'
      )}
      style={{ willChange: 'transform' }}
    >
      {disabled && (
        <div className="absolute top-2 right-2 bg-white/20 rounded-full p-1">
          <Lock className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div 
        ref={emojiRef}
        className="text-3xl md:text-4xl mb-2"
        style={{ willChange: 'transform' }}
      >
        {emoji}
      </div>
      
      <h3 className="font-display text-sm md:text-base font-bold text-white leading-tight drop-shadow-sm">
        {title}
      </h3>
      
      {!disabled && progress > 0 && (
        <div className="mt-3 h-2 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-white rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/20 to-transparent transform rotate-12" />
      </div>
    </button>
  );
}
