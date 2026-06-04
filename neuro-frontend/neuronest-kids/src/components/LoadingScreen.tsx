import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onComplete, minDuration = 2000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'complete' | 'exit'>('loading');
  const startTimeRef = useRef(Date.now());
  const animationRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const rawProgress = Math.min(elapsed / minDuration, 1);
      // Smooth exponential easing
      const smoothProgress = 1 - Math.pow(1 - rawProgress, 3);
      
      setProgress(smoothProgress * 100);

      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setPhase('complete');
        setTimeout(() => {
          setPhase('exit');
          setTimeout(() => onComplete?.(), 500);
        }, 300);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [minDuration, onComplete]);

  return (
    <div 
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden gpu-accelerated',
        'transition-all duration-500 ease-out',
        phase === 'exit' && 'opacity-0 scale-105'
      )}
      style={{
        background: 'linear-gradient(160deg, hsl(220 45% 15%) 0%, hsl(260 40% 20%) 50%, hsl(200 45% 18%) 100%)'
      }}
    >
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(0 0% 100% / 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Gradient orbs - subtle and smooth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[500px] h-[500px] rounded-full gpu-accelerated"
          style={{
            background: 'radial-gradient(circle, hsl(145 60% 45% / 0.25) 0%, transparent 60%)',
            left: '-100px',
            top: '-100px',
            animation: 'orb-float 12s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full gpu-accelerated"
          style={{
            background: 'radial-gradient(circle, hsl(280 60% 50% / 0.2) 0%, transparent 60%)',
            right: '-80px',
            bottom: '-80px',
            animation: 'orb-float 15s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute w-[300px] h-[300px] rounded-full gpu-accelerated"
          style={{
            background: 'radial-gradient(circle, hsl(200 70% 50% / 0.15) 0%, transparent 60%)',
            right: '20%',
            top: '15%',
            animation: 'orb-float 10s ease-in-out infinite 2s'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        
        {/* Logo/Mascot - Clean and professional */}
        <div 
          className={cn(
            'relative gpu-accelerated',
            phase === 'complete' && 'scale-105'
          )}
          style={{
            animation: 'gentle-float 4s ease-in-out infinite',
            transition: 'transform 0.5s ease-out'
          }}
        >
          {/* Glow behind mascot */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl gpu-accelerated"
            style={{
              background: 'radial-gradient(circle, hsl(145 60% 50% / 0.4) 0%, transparent 70%)',
              transform: 'scale(1.5)',
              animation: 'glow-pulse 3s ease-in-out infinite'
            }}
          />
          
          {/* Clean mascot design */}
          <div className="relative w-28 h-28 md:w-36 md:h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
              <defs>
                <linearGradient id="mascotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(145, 60%, 50%)" />
                  <stop offset="100%" stopColor="hsl(160, 55%, 40%)" />
                </linearGradient>
                <linearGradient id="mascotAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(145, 60%, 60%)" />
                  <stop offset="100%" stopColor="hsl(145, 55%, 45%)" />
                </linearGradient>
              </defs>
              
              {/* Body */}
              <ellipse cx="50" cy="60" rx="32" ry="28" fill="url(#mascotGrad)" />
              
              {/* Head */}
              <circle cx="50" cy="35" r="26" fill="url(#mascotGrad)" />
              
              {/* Ears */}
              <ellipse cx="28" cy="18" rx="8" ry="14" fill="url(#mascotGrad)" />
              <ellipse cx="72" cy="18" rx="8" ry="14" fill="url(#mascotGrad)" />
              <ellipse cx="28" cy="18" rx="5" ry="9" fill="url(#mascotAccent)" />
              <ellipse cx="72" cy="18" rx="5" ry="9" fill="url(#mascotAccent)" />
              
              {/* Eyes */}
              <ellipse cx="38" cy="33" rx="9" ry="10" fill="white" />
              <ellipse cx="62" cy="33" rx="9" ry="10" fill="white" />
              
              {/* Pupils - with subtle animation */}
              <circle cx="40" cy="34" r="4.5" fill="hsl(220, 25%, 18%)">
                <animate attributeName="cx" values="40;41;40;39;40" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="64" cy="34" r="4.5" fill="hsl(220, 25%, 18%)">
                <animate attributeName="cx" values="64;65;64;63;64" dur="4s" repeatCount="indefinite" />
              </circle>
              
              {/* Eye highlights */}
              <circle cx="42" cy="31" r="2" fill="white" opacity="0.9" />
              <circle cx="66" cy="31" r="2" fill="white" opacity="0.9" />
              
              {/* Cheeks */}
              <ellipse cx="26" cy="42" rx="6" ry="4" fill="hsl(15, 80%, 70%)" opacity="0.5" />
              <ellipse cx="74" cy="42" rx="6" ry="4" fill="hsl(15, 80%, 70%)" opacity="0.5" />
              
              {/* Smile */}
              <path d="M 38 46 Q 50 56, 62 46" fill="none" stroke="hsl(220, 25%, 20%)" strokeWidth="3" strokeLinecap="round" />
              
              {/* Belly accent */}
              <ellipse cx="50" cy="62" rx="18" ry="14" fill="url(#mascotAccent)" opacity="0.4" />
              
              {/* Arms */}
              <ellipse cx="22" cy="55" rx="8" ry="14" fill="url(#mascotGrad)" />
              <ellipse cx="78" cy="55" rx="8" ry="14" fill="url(#mascotGrad)" />
              
              {/* Feet */}
              <ellipse cx="38" cy="84" rx="10" ry="6" fill="hsl(145, 50%, 35%)" />
              <ellipse cx="62" cy="84" rx="10" ry="6" fill="hsl(145, 50%, 35%)" />
            </svg>
          </div>
        </div>

        {/* Brand text */}
        <div className="text-center gpu-accelerated" style={{ animation: 'fade-up 0.8s ease-out 0.2s backwards' }}>
          <h1 
            className="font-display text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight"
            style={{
              textShadow: '0 2px 20px hsl(145 60% 40% / 0.3)'
            }}
          >
            NeuroNest
          </h1>
          <p className="text-base md:text-lg text-white/70 font-medium">
            Learning made fun
          </p>
        </div>

        {/* Progress bar - clean design */}
        <div 
          className="w-56 md:w-72 gpu-accelerated"
          style={{ animation: 'fade-up 0.8s ease-out 0.4s backwards' }}
        >
          <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full rounded-full transition-all duration-75 ease-out gpu-accelerated"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, hsl(145 60% 50%), hsl(180 60% 50%))',
              }}
            />
          </div>
          <p className="text-center text-sm text-white/50 mt-3 font-medium">
            {phase === 'complete' ? 'Ready!' : 'Loading...'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -15px) scale(1.05); }
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1.5); }
          50% { opacity: 0.8; transform: scale(1.6); }
        }
        
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
