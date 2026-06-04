import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

interface InteractiveMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  emotion?: 'neutral' | 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating' | 'sad';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  sm: 64,
  md: 96,
  lg: 128,
  xl: 192,
};

export function InteractiveMascot({ 
  size = 'md', 
  emotion = 'neutral',
  interactive = true,
  onClick,
  className 
}: InteractiveMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<SVGSVGElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const bodyRef = useRef<SVGGElement>(null);
  const leftEarRef = useRef<SVGEllipseElement>(null);
  const rightEarRef = useRef<SVGEllipseElement>(null);
  const leftPupilRef = useRef<SVGCircleElement>(null);
  const rightPupilRef = useRef<SVGCircleElement>(null);
  const leftArmRef = useRef<SVGPathElement>(null);
  const rightArmRef = useRef<SVGPathElement>(null);
  const starRef = useRef<SVGPolygonElement>(null);

  const pixelSize = sizeMap[size];

  // Idle breathing & floating animation
  useEffect(() => {
    if (!mascotRef.current) return;
    
    const ctx = gsap.context(() => {
      // Gentle floating
      gsap.to(mascotRef.current, {
        y: -6,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Ear wiggle
      gsap.to([leftEarRef.current, rightEarRef.current], {
        rotation: 8,
        transformOrigin: '50% 100%',
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.3,
      });

      // Subtle body squish (breathing)
      gsap.to(bodyRef.current, {
        scaleY: 1.025,
        scaleX: 0.975,
        transformOrigin: '50% 100%',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Star sparkle
      gsap.to(starRef.current, {
        scale: 1.15,
        transformOrigin: '50% 50%',
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });

      // Random blink
      const blink = () => {
        const eyes = mascotRef.current?.querySelectorAll('.mascot-eye');
        if (eyes) {
          gsap.to(eyes, {
            scaleY: 0.1,
            transformOrigin: '50% 50%',
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
            onComplete: () => {
              gsap.delayedCall(2 + Math.random() * 4, blink);
            },
          });
        }
      };
      gsap.delayedCall(1.5, blink);
    }, mascotRef);

    return () => ctx.revert();
  }, []);

  // Emotion-based animations
  useEffect(() => {
    if (!mascotRef.current) return;

    const ctx = gsap.context(() => {
      gsap.killTweensOf([leftArmRef.current, rightArmRef.current]);
      
      switch (emotion) {
        case 'happy':
        case 'celebrating':
        case 'excited':
          // Arms up celebration
          gsap.to(leftArmRef.current, {
            rotation: -35,
            transformOrigin: '100% 50%',
            duration: 0.4,
            ease: 'back.out(2)',
          });
          gsap.to(rightArmRef.current, {
            rotation: 35,
            transformOrigin: '0% 50%',
            duration: 0.4,
            ease: 'back.out(2)',
          });
          if (emotion === 'celebrating' || emotion === 'excited') {
            gsap.to([leftArmRef.current, rightArmRef.current], {
              rotation: '+=20',
              yoyo: true,
              repeat: -1,
              duration: 0.2,
              ease: 'sine.inOut',
            });
            // Body bounce
            gsap.to(bodyRef.current, {
              y: -5,
              duration: 0.2,
              repeat: -1,
              yoyo: true,
              ease: 'power2.out',
            });
          }
          break;
        case 'encouraging':
          gsap.to(rightArmRef.current, {
            rotation: -40,
            transformOrigin: '0% 50%',
            duration: 0.35,
            yoyo: true,
            repeat: -1,
            repeatDelay: 0.4,
            ease: 'power2.out',
          });
          break;
        case 'thinking':
          gsap.to(rightArmRef.current, {
            rotation: -15,
            y: -5,
            duration: 0.5,
            ease: 'power2.out',
          });
          break;
        case 'sad':
          gsap.to([leftArmRef.current, rightArmRef.current], {
            rotation: 5,
            y: 3,
            duration: 0.5,
          });
          break;
        default:
          gsap.to([leftArmRef.current, rightArmRef.current], {
            rotation: 0,
            y: 0,
            duration: 0.3,
          });
      }
    }, mascotRef);

    return () => ctx.revert();
  }, [emotion]);

  // Eye tracking mouse
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !interactive) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const maxOffset = 3;
    const deltaX = Math.max(-maxOffset, Math.min(maxOffset, (e.clientX - centerX) / 80));
    const deltaY = Math.max(-maxOffset, Math.min(maxOffset, (e.clientY - centerY) / 80));
    
    if (leftPupilRef.current && rightPupilRef.current) {
      gsap.to([leftPupilRef.current, rightPupilRef.current], {
        x: deltaX,
        y: deltaY,
        duration: 0.12,
        ease: 'power2.out',
      });
    }
  }, [interactive]);

  useEffect(() => {
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [handleMouseMove, interactive]);

  const handleMouseEnter = () => {
    if (!interactive) return;
    setIsHovered(true);
    gsap.to(mascotRef.current, {
      scale: 1.1,
      duration: 0.3,
      ease: 'back.out(2)',
    });
    // Happy ear wiggle
    gsap.to([leftEarRef.current, rightEarRef.current], {
      rotation: 15,
      duration: 0.15,
      yoyo: true,
      repeat: 3,
    });
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setIsHovered(false);
    gsap.to(mascotRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleClick = () => {
    if (!interactive) return;
    
    gsap.timeline()
      .to(mascotRef.current, { scale: 0.9, duration: 0.1, ease: 'power2.in' })
      .to(mascotRef.current, { scale: 1.15, duration: 0.25, ease: 'back.out(4)' })
      .to(mascotRef.current, { scale: 1, duration: 0.15, ease: 'power2.out' });
    
    // Star burst effect
    gsap.to(starRef.current, {
      scale: 1.5,
      opacity: 0.5,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
    });
    
    onClick?.();
  };

  const getSmilePath = () => {
    switch (emotion) {
      case 'happy':
      case 'celebrating':
      case 'excited':
        return "M 36 50 Q 50 68 64 50";
      case 'sad':
        return "M 38 58 Q 50 48 62 58";
      case 'thinking':
        return "M 44 54 Q 50 52 56 54";
      default:
        return "M 38 50 Q 50 62 62 50";
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn('relative inline-block', interactive && 'cursor-pointer select-none', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg 
        ref={mascotRef}
        viewBox="0 0 100 100" 
        className="w-full h-full"
        style={{ willChange: 'transform', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.18))' }}
      >
        <defs>
          {/* Gradient for body - soft green tones */}
          <linearGradient id="mascot-body-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7DD3A8" />
            <stop offset="50%" stopColor="#4FBF8A" />
            <stop offset="100%" stopColor="#3DA876" />
          </linearGradient>
          <linearGradient id="mascot-belly-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F0FDF4" />
            <stop offset="100%" stopColor="#D1FAE5" />
          </linearGradient>
          <radialGradient id="cheek-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB5B5" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FFB5B5" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="100%" stopColor="#FFD93D" />
          </linearGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Ground shadow */}
        <ellipse cx="50" cy="96" rx="24" ry="4" fill="rgba(0,0,0,0.08)" />

        <g ref={bodyRef}>
          {/* Ears - soft rounded */}
          <ellipse 
            ref={leftEarRef}
            cx="28" cy="18" rx="10" ry="15" 
            fill="url(#mascot-body-gradient)"
          />
          <ellipse cx="28" cy="18" rx="6" ry="10" fill="#A8E6C3" />
          
          <ellipse 
            ref={rightEarRef}
            cx="72" cy="18" rx="10" ry="15" 
            fill="url(#mascot-body-gradient)"
          />
          <ellipse cx="72" cy="18" rx="6" ry="10" fill="#A8E6C3" />
          
          {/* Main body - round and friendly */}
          <ellipse cx="50" cy="58" rx="32" ry="34" fill="url(#mascot-body-gradient)" />
          
          {/* Belly - cream/light green */}
          <ellipse cx="50" cy="62" rx="22" ry="24" fill="url(#mascot-belly-gradient)" />
          
          {/* Star badge - prominent and shiny */}
          <polygon 
            ref={starRef}
            points="50,48 53,55 60,55 55,60 57,68 50,63 43,68 45,60 40,55 47,55" 
            fill="url(#star-gradient)"
            filter="url(#glow)"
          />
          
          {/* Arms/Flippers */}
          <path 
            ref={leftArmRef}
            d="M 18 55 Q 6 55 6 66 Q 6 77 18 77 Q 22 66 18 55"
            fill="#3DA876"
            style={{ transformOrigin: '18px 66px' }}
          />
          <path 
            ref={rightArmRef}
            d="M 82 55 Q 94 55 94 66 Q 94 77 82 77 Q 78 66 82 55"
            fill="#3DA876"
            style={{ transformOrigin: '82px 66px' }}
          />
          
          {/* Feet */}
          <ellipse cx="38" cy="90" rx="11" ry="6" fill="#3DA876" />
          <ellipse cx="62" cy="90" rx="11" ry="6" fill="#3DA876" />
        </g>
        
        {/* Face */}
        <g>
          {/* Eye whites - large and expressive */}
          <ellipse className="mascot-eye" cx="38" cy="38" rx="12" ry="14" fill="white" />
          <ellipse className="mascot-eye" cx="62" cy="38" rx="12" ry="14" fill="white" />
          
          {/* Irises */}
          <circle cx="40" cy="40" r="8" fill="#2C3E50" />
          <circle cx="64" cy="40" r="8" fill="#2C3E50" />
          
          {/* Pupils - move with mouse */}
          <circle ref={leftPupilRef} cx="41" cy="41" r="4" fill="#1a1a2e" />
          <circle ref={rightPupilRef} cx="65" cy="41" r="4" fill="#1a1a2e" />
          
          {/* Eye sparkles - life and personality */}
          <circle cx="44" cy="36" r="3" fill="white" />
          <circle cx="68" cy="36" r="3" fill="white" />
          <circle cx="38" cy="43" r="1.5" fill="white" opacity="0.6" />
          <circle cx="62" cy="43" r="1.5" fill="white" opacity="0.6" />
          
          {/* Eyebrows - expressive */}
          <path 
            d={emotion === 'sad' ? "M 28 28 Q 36 24 46 28" : emotion === 'thinking' ? "M 28 24 Q 36 26 46 24" : "M 28 26 Q 36 22 46 26"} 
            fill="none" 
            stroke="#2D8B62" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          <path 
            d={emotion === 'sad' ? "M 54 28 Q 64 24 72 28" : emotion === 'thinking' ? "M 54 26 Q 64 22 72 24" : "M 54 26 Q 64 22 72 26"} 
            fill="none" 
            stroke="#2D8B62" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          
          {/* Cheek blush */}
          <ellipse cx="22" cy="48" rx="7" ry="5" fill="url(#cheek-glow)" />
          <ellipse cx="78" cy="48" rx="7" ry="5" fill="url(#cheek-glow)" />
          
          {/* Nose - cute orange oval */}
          <ellipse cx="50" cy="47" rx="4" ry="3" fill="#FFB347" />
          
          {/* Smile - changes with emotion */}
          <path 
            d={getSmilePath()}
            fill="none" 
            stroke="#2C3E50" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          
          {/* Tongue for happy emotions */}
          {(emotion === 'happy' || emotion === 'celebrating' || emotion === 'excited') && (
            <ellipse cx="50" cy="58" rx="5" ry="4" fill="#FF8B94" />
          )}
        </g>
        
        {/* Celebration sparkles */}
        {emotion === 'celebrating' && (
          <g>
            <circle cx="10" cy="18" r="4" fill="#FFD93D">
              <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
              <animate attributeName="r" values="4;5;4" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="90" cy="18" r="4" fill="#FF6B9C">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="6" cy="45" r="3" fill="#6BCBFF">
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="94" cy="45" r="3" fill="#A8E6C3">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="0.4s" repeatCount="indefinite" />
            </circle>
            <polygon points="15,35 16,38 19,38 17,40 18,43 15,41 12,43 13,40 11,38 14,38" fill="#FFE066">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="0.6s" repeatCount="indefinite" />
            </polygon>
            <polygon points="85,35 86,38 89,38 87,40 88,43 85,41 82,43 83,40 81,38 84,38" fill="#FFE066">
              <animate attributeName="opacity" values="1;0.5;1" dur="0.6s" repeatCount="indefinite" />
            </polygon>
          </g>
        )}
        
        {/* Thinking bubbles */}
        {emotion === 'thinking' && (
          <g>
            <circle cx="80" cy="16" r="4" fill="#E0E7FF" opacity="0.8">
              <animate attributeName="cy" values="16;12;16" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="88" cy="8" r="5" fill="#E0E7FF" opacity="0.6">
              <animate attributeName="cy" values="8;4;8" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="95" cy="2" r="6" fill="#E0E7FF" opacity="0.4">
              <animate attributeName="cy" values="2;-2;2" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
        
        {/* Encouraging hearts */}
        {emotion === 'encouraging' && (
          <g>
            <path d="M 88 25 C 88 22 92 20 94 23 C 96 20 100 22 100 25 C 100 29 94 32 94 32 C 94 32 88 29 88 25" fill="#FF8B94" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1s" repeatCount="indefinite" />
            </path>
          </g>
        )}
      </svg>
    </div>
  );
}
