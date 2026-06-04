import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface MascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  waving?: boolean;
  happy?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
};

export function Mascot({ size = 'md', animated = true, waving = false, happy = false, className }: MascotProps) {
  const mascotRef = useRef<HTMLDivElement>(null);
  const leftArmRef = useRef<SVGPathElement>(null);
  const rightArmRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!animated || !mascotRef.current) return;

    const ctx = gsap.context(() => {
      // Gentle float
      gsap.to(mascotRef.current, {
        y: -3,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Wave animation
      if (waving && rightArmRef.current) {
        gsap.to(rightArmRef.current, {
          rotation: -30,
          transformOrigin: '0% 50%',
          duration: 0.3,
          yoyo: true,
          repeat: -1,
          repeatDelay: 0.3,
          ease: 'power2.inOut',
        });
      }
    }, mascotRef);

    return () => ctx.revert();
  }, [animated, waving]);

  return (
    <div 
      ref={mascotRef}
      className={cn(sizeClasses[size], className)}
      style={{ willChange: 'transform' }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}>
        <defs>
          <linearGradient id="mascot-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7DD3A8" />
            <stop offset="50%" stopColor="#4FBF8A" />
            <stop offset="100%" stopColor="#3DA876" />
          </linearGradient>
          <linearGradient id="mascot-belly-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8F5EE" />
            <stop offset="100%" stopColor="#C5E8D8" />
          </linearGradient>
          <radialGradient id="mascot-cheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB5B5" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFB5B5" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Shadow */}
        <ellipse cx="50" cy="95" rx="20" ry="4" fill="rgba(0,0,0,0.08)" />

        {/* Ears */}
        <ellipse cx="28" cy="18" rx="9" ry="14" fill="url(#mascot-body-grad)" />
        <ellipse cx="28" cy="18" rx="5" ry="9" fill="#A8E6C3" />
        <ellipse cx="72" cy="18" rx="9" ry="14" fill="url(#mascot-body-grad)" />
        <ellipse cx="72" cy="18" rx="5" ry="9" fill="#A8E6C3" />
        
        {/* Body */}
        <ellipse cx="50" cy="58" rx="30" ry="32" fill="url(#mascot-body-grad)" />
        
        {/* Belly */}
        <ellipse cx="50" cy="62" rx="20" ry="22" fill="url(#mascot-belly-grad)" />
        
        {/* Star badge */}
        <polygon 
          points="50,52 52,57 58,57 53.5,60.5 55.5,66 50,62.5 44.5,66 46.5,60.5 42,57 48,57" 
          fill="#FFD93D"
        />
        
        {/* Arms */}
        <path 
          ref={leftArmRef}
          d="M 20 55 Q 10 55 10 65 Q 10 74 20 74 Q 24 65 20 55"
          fill="#3DA876"
        />
        <path 
          ref={rightArmRef}
          d="M 80 55 Q 90 55 90 65 Q 90 74 80 74 Q 76 65 80 55"
          fill="#3DA876"
          style={{ transformOrigin: '80px 65px' }}
        />
        
        {/* Feet */}
        <ellipse cx="38" cy="88" rx="9" ry="5" fill="#3DA876" />
        <ellipse cx="62" cy="88" rx="9" ry="5" fill="#3DA876" />
        
        {/* Eyes */}
        <ellipse cx="38" cy="38" rx="11" ry="13" fill="white" />
        <ellipse cx="62" cy="38" rx="11" ry="13" fill="white" />
        <circle cx="40" cy="40" r="7" fill="#2C3E50" />
        <circle cx="64" cy="40" r="7" fill="#2C3E50" />
        <circle cx="42" cy="38" r="2.5" fill="white" />
        <circle cx="66" cy="38" r="2.5" fill="white" />
        
        {/* Eyebrows */}
        <path d="M 28 26 Q 36 22 46 26" fill="none" stroke="#2D8B62" strokeWidth="2" strokeLinecap="round" />
        <path d="M 54 26 Q 64 22 72 26" fill="none" stroke="#2D8B62" strokeWidth="2" strokeLinecap="round" />
        
        {/* Cheeks */}
        <ellipse cx="24" cy="47" rx="6" ry="4" fill="url(#mascot-cheek)" />
        <ellipse cx="76" cy="47" rx="6" ry="4" fill="url(#mascot-cheek)" />
        
        {/* Nose */}
        <ellipse cx="50" cy="46" rx="3.5" ry="2.5" fill="#FFB347" />
        
        {/* Smile */}
        <path 
          d={happy ? "M 36 50 Q 50 65 64 50" : "M 38 50 Q 50 60 62 50"}
          fill="none" 
          stroke="#2C3E50" 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />
        
        {/* Tongue if happy */}
        {happy && (
          <ellipse cx="50" cy="57" rx="4" ry="3" fill="#FF8B94" />
        )}
      </svg>
    </div>
  );
}
