import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Lock, Sparkles, Trophy, TrendingUp } from 'lucide-react';
import gsap from 'gsap';

interface EnhancedMiniGameCardProps {
  title: string;
  emoji: string;
  color: string;
  description?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  onClick?: () => void;
  disabled?: boolean;
  progress?: number;
  gamesPlayed?: number;
  bestScore?: number;
}

const colorClasses: Record<string, { bg: string; shadow: string; glow: string; accent: string }> = {
  green: { 
    bg: 'bg-gradient-to-br from-duo-green via-emerald-500 to-duo-teal', 
    shadow: 'shadow-[0_6px_0_hsl(145,65%,30%)]',
    glow: 'hover:shadow-[0_0_30px_rgba(76,175,80,0.5)]',
    accent: 'text-emerald-100'
  },
  blue: { 
    bg: 'bg-gradient-to-br from-duo-blue via-cyan-500 to-blue-600', 
    shadow: 'shadow-[0_6px_0_hsl(200,85%,35%)]',
    glow: 'hover:shadow-[0_0_30px_rgba(33,150,243,0.5)]',
    accent: 'text-cyan-100'
  },
  orange: { 
    bg: 'bg-gradient-to-br from-duo-orange via-amber-500 to-orange-600', 
    shadow: 'shadow-[0_6px_0_hsl(28,95%,40%)]',
    glow: 'hover:shadow-[0_0_30px_rgba(255,152,0,0.5)]',
    accent: 'text-amber-100'
  },
  purple: { 
    bg: 'bg-gradient-to-br from-duo-purple via-violet-500 to-purple-700', 
    shadow: 'shadow-[0_6px_0_hsl(270,75%,45%)]',
    glow: 'hover:shadow-[0_0_30px_rgba(156,39,176,0.5)]',
    accent: 'text-violet-100'
  },
  pink: { 
    bg: 'bg-gradient-to-br from-duo-pink via-rose-400 to-pink-600', 
    shadow: 'shadow-[0_6px_0_hsl(330,80%,45%)]',
    glow: 'hover:shadow-[0_0_30px_rgba(233,30,99,0.5)]',
    accent: 'text-rose-100'
  },
  teal: { 
    bg: 'bg-gradient-to-br from-duo-teal via-cyan-600 to-teal-700', 
    shadow: 'shadow-[0_6px_0_hsl(175,70%,32%)]',
    glow: 'hover:shadow-[0_0_30px_rgba(0,150,136,0.5)]',
    accent: 'text-teal-100'
  },
  yellow: { 
    bg: 'bg-gradient-to-br from-duo-yellow via-amber-400 to-yellow-500', 
    shadow: 'shadow-[0_6px_0_hsl(45,95%,40%)]',
    glow: 'hover:shadow-[0_0_30px_rgba(255,193,7,0.5)]',
    accent: 'text-amber-100'
  },
  red: { 
    bg: 'bg-gradient-to-br from-duo-red via-rose-500 to-red-600', 
    shadow: 'shadow-[0_6px_0_hsl(0,75%,40%)]',
    glow: 'hover:shadow-[0_0_30px_rgba(244,67,54,0.5)]',
    accent: 'text-rose-100'
  },
};

export function EnhancedMiniGameCard({ 
  title, 
  emoji, 
  color, 
  description,
  difficulty,
  onClick, 
  disabled = false,
  progress = 0,
  gamesPlayed = 0,
  bestScore = 0,
}: EnhancedMiniGameCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const colorStyle = colorClasses[color] || colorClasses.green;

  useEffect(() => {
    if (!emojiRef.current) return;
    
    // Gentle floating animation for emoji
    gsap.to(emojiRef.current, {
      y: -4,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;
    gsap.to(cardRef.current, {
      y: -8,
      scale: 1.03,
      duration: 0.3,
      ease: 'power2.out',
    });
    gsap.to(emojiRef.current, {
      scale: 1.2,
      rotation: 8,
      duration: 0.3,
      ease: 'back.out(2)',
    });
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
    gsap.to(emojiRef.current, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseDown = () => {
    if (disabled) return;
    gsap.to(cardRef.current, {
      y: 3,
      scale: 0.97,
      duration: 0.1,
      ease: 'power2.in',
    });
  };

  const handleMouseUp = () => {
    if (disabled) return;
    gsap.to(cardRef.current, {
      y: -8,
      scale: 1.03,
      duration: 0.2,
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
        'relative w-full text-left rounded-2xl p-5 md:p-6 transition-colors cursor-pointer overflow-hidden min-h-[160px]',
        colorStyle.bg,
        colorStyle.shadow,
        colorStyle.glow,
        'transform-gpu will-change-transform',
        disabled && 'opacity-60 cursor-not-allowed grayscale'
      )}
      style={{ willChange: 'transform' }}
    >
      {/* Decorative shine */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/30 to-transparent transform rotate-12" />
      </div>

      {disabled && (
        <div className="absolute top-2 right-2 bg-white/30 rounded-full p-1.5 backdrop-blur-sm">
          <Lock className="w-4 h-4 text-white" />
        </div>
      )}

      {/* High progress indicator */}
      {!disabled && progress >= 80 && (
        <div className="absolute top-2 right-2 bg-white/25 rounded-full p-1.5 backdrop-blur-sm animate-pulse">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className="relative z-10">
        <div 
          ref={emojiRef}
          className="text-5xl md:text-6xl mb-3 drop-shadow-lg"
          style={{ willChange: 'transform' }}
        >
          {emoji}
        </div>
        
        <h3 className="font-display text-base md:text-lg font-bold text-white leading-tight drop-shadow-md mb-1">
          {title}
        </h3>
        
        {description && (
          <p className="text-xs text-white/80 leading-tight mb-2">{description}</p>
        )}
        
        {difficulty && (
          <span className={cn(
            "inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1",
            difficulty === 'Easy' && "bg-duo-green/30 text-green-100",
            difficulty === 'Medium' && "bg-duo-orange/30 text-orange-100",
            difficulty === 'Hard' && "bg-duo-red/30 text-red-100"
          )}>
            {difficulty}
          </span>
        )}

        {/* Game stats mini badges */}
        {!disabled && (gamesPlayed > 0 || bestScore > 0) && (
          <div className="flex gap-2 mt-2">
            {gamesPlayed > 0 && (
              <div className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20", colorStyle.accent)}>
                <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
                {gamesPlayed}
              </div>
            )}
            {bestScore > 0 && (
              <div className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20", colorStyle.accent)}>
                <Trophy className="w-2.5 h-2.5 inline mr-0.5" />
                {bestScore}
              </div>
            )}
          </div>
        )}
        
        {/* Progress bar */}
        {!disabled && progress > 0 && (
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                progress >= 80 ? "bg-gradient-to-r from-white to-duo-yellow" : "bg-white"
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </button>
  );
}
