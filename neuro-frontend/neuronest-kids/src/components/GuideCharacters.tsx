import { cn } from '@/lib/utils';

// Different friendly characters for different pages
export type CharacterType = 'owl' | 'bunny' | 'bear' | 'fox' | 'cat';

interface CharacterProps {
  type: CharacterType;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  waving?: boolean;
  className?: string;
}

export function GuideCharacter({ type, size = 'md', animated = true, waving = false, className }: CharacterProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  const renderCharacter = () => {
    switch (type) {
      case 'owl':
        return <OwlCharacter waving={waving} />;
      case 'bunny':
        return <BunnyCharacter waving={waving} />;
      case 'bear':
        return <BearCharacter waving={waving} />;
      case 'fox':
        return <FoxCharacter waving={waving} />;
      case 'cat':
        return <CatCharacter waving={waving} />;
      default:
        return <OwlCharacter waving={waving} />;
    }
  };

  return (
    <div 
      className={cn(
        sizeClasses[size],
        animated && 'float-animation',
        className
      )}
    >
      {renderCharacter()}
    </div>
  );
}

// Owl - Main mascot (green)
function OwlCharacter({ waving }: { waving?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="owlBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(145, 65%, 52%)" />
          <stop offset="100%" stopColor="hsl(145, 65%, 38%)" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="62" rx="32" ry="28" fill="url(#owlBody)" />
      <circle cx="50" cy="35" r="26" fill="hsl(145, 65%, 48%)" />
      <ellipse cx="40" cy="32" rx="8" ry="9" fill="white" />
      <ellipse cx="60" cy="32" rx="8" ry="9" fill="white" />
      <circle cx="42" cy="33" r="4" fill="hsl(220, 25%, 18%)" />
      <circle cx="62" cy="33" r="4" fill="hsl(220, 25%, 18%)" />
      <circle cx="43" cy="31" r="1.5" fill="white" />
      <circle cx="63" cy="31" r="1.5" fill="white" />
      <ellipse cx="28" cy="40" rx="6" ry="4" fill="hsl(28, 95%, 70%)" opacity="0.6" />
      <ellipse cx="72" cy="40" rx="6" ry="4" fill="hsl(28, 95%, 70%)" opacity="0.6" />
      <path d="M 40 45 Q 50 54, 60 45" fill="none" stroke="hsl(220, 25%, 18%)" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="26" cy="16" rx="9" ry="14" fill="hsl(145, 65%, 45%)" />
      <ellipse cx="74" cy="16" rx="9" ry="14" fill="hsl(145, 65%, 45%)" />
      <ellipse 
        cx="22" cy="58" rx="9" ry="16" fill="hsl(145, 65%, 42%)"
        className={waving ? 'wave-animation' : ''}
        style={{ transformOrigin: '22px 70px' }}
      />
      <ellipse cx="78" cy="58" rx="9" ry="16" fill="hsl(145, 65%, 42%)" />
      <ellipse cx="38" cy="86" rx="11" ry="7" fill="hsl(145, 65%, 38%)" />
      <ellipse cx="62" cy="86" rx="11" ry="7" fill="hsl(145, 65%, 38%)" />
      <polygon points="50,56 52,62 58,62 54,66 56,72 50,68 44,72 46,66 42,62 48,62" fill="hsl(45, 95%, 55%)" />
    </svg>
  );
}

// Bunny - Friendly purple bunny for games
function BunnyCharacter({ waving }: { waving?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="bunnyBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(270, 75%, 70%)" />
          <stop offset="100%" stopColor="hsl(270, 75%, 55%)" />
        </linearGradient>
      </defs>
      {/* Ears */}
      <ellipse cx="35" cy="15" rx="8" ry="22" fill="hsl(270, 75%, 65%)" />
      <ellipse cx="65" cy="15" rx="8" ry="22" fill="hsl(270, 75%, 65%)" />
      <ellipse cx="35" cy="15" rx="4" ry="16" fill="hsl(330, 80%, 80%)" />
      <ellipse cx="65" cy="15" rx="4" ry="16" fill="hsl(330, 80%, 80%)" />
      {/* Body */}
      <ellipse cx="50" cy="65" rx="28" ry="25" fill="url(#bunnyBody)" />
      {/* Head */}
      <circle cx="50" cy="42" r="24" fill="hsl(270, 75%, 65%)" />
      {/* Eyes */}
      <ellipse cx="40" cy="40" rx="7" ry="8" fill="white" />
      <ellipse cx="60" cy="40" rx="7" ry="8" fill="white" />
      <circle cx="42" cy="41" r="4" fill="hsl(220, 25%, 18%)" />
      <circle cx="62" cy="41" r="4" fill="hsl(220, 25%, 18%)" />
      <circle cx="43" cy="39" r="1.5" fill="white" />
      <circle cx="63" cy="39" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="50" rx="4" ry="3" fill="hsl(330, 80%, 70%)" />
      {/* Cheeks */}
      <ellipse cx="30" cy="48" rx="5" ry="4" fill="hsl(330, 80%, 80%)" opacity="0.6" />
      <ellipse cx="70" cy="48" rx="5" ry="4" fill="hsl(330, 80%, 80%)" opacity="0.6" />
      {/* Smile */}
      <path d="M 44 54 Q 50 60, 56 54" fill="none" stroke="hsl(220, 25%, 18%)" strokeWidth="2" strokeLinecap="round" />
      {/* Arms */}
      <ellipse 
        cx="24" cy="60" rx="8" ry="14" fill="hsl(270, 75%, 60%)"
        className={waving ? 'wave-animation' : ''}
        style={{ transformOrigin: '24px 72px' }}
      />
      <ellipse cx="76" cy="60" rx="8" ry="14" fill="hsl(270, 75%, 60%)" />
      {/* Feet */}
      <ellipse cx="38" cy="88" rx="10" ry="6" fill="hsl(270, 75%, 55%)" />
      <ellipse cx="62" cy="88" rx="10" ry="6" fill="hsl(270, 75%, 55%)" />
    </svg>
  );
}

// Bear - Warm orange bear for encouragement
function BearCharacter({ waving }: { waving?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="bearBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(28, 85%, 60%)" />
          <stop offset="100%" stopColor="hsl(28, 85%, 45%)" />
        </linearGradient>
      </defs>
      {/* Ears */}
      <circle cx="25" cy="22" r="12" fill="hsl(28, 85%, 55%)" />
      <circle cx="75" cy="22" r="12" fill="hsl(28, 85%, 55%)" />
      <circle cx="25" cy="22" r="7" fill="hsl(28, 85%, 70%)" />
      <circle cx="75" cy="22" r="7" fill="hsl(28, 85%, 70%)" />
      {/* Body */}
      <ellipse cx="50" cy="65" rx="30" ry="26" fill="url(#bearBody)" />
      {/* Head */}
      <circle cx="50" cy="40" r="26" fill="hsl(28, 85%, 55%)" />
      {/* Snout */}
      <ellipse cx="50" cy="50" rx="12" ry="10" fill="hsl(28, 85%, 75%)" />
      {/* Eyes */}
      <ellipse cx="38" cy="38" rx="6" ry="7" fill="white" />
      <ellipse cx="62" cy="38" rx="6" ry="7" fill="white" />
      <circle cx="40" cy="39" r="3.5" fill="hsl(220, 25%, 18%)" />
      <circle cx="64" cy="39" r="3.5" fill="hsl(220, 25%, 18%)" />
      <circle cx="41" cy="37" r="1.5" fill="white" />
      <circle cx="65" cy="37" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="48" rx="5" ry="4" fill="hsl(220, 25%, 25%)" />
      {/* Smile */}
      <path d="M 44 54 Q 50 60, 56 54" fill="none" stroke="hsl(220, 25%, 18%)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Arms */}
      <ellipse 
        cx="22" cy="60" rx="10" ry="16" fill="hsl(28, 85%, 50%)"
        className={waving ? 'wave-animation' : ''}
        style={{ transformOrigin: '22px 74px' }}
      />
      <ellipse cx="78" cy="60" rx="10" ry="16" fill="hsl(28, 85%, 50%)" />
      {/* Belly */}
      <ellipse cx="50" cy="68" rx="16" ry="14" fill="hsl(28, 85%, 72%)" opacity="0.6" />
      {/* Feet */}
      <ellipse cx="36" cy="88" rx="11" ry="7" fill="hsl(28, 85%, 45%)" />
      <ellipse cx="64" cy="88" rx="11" ry="7" fill="hsl(28, 85%, 45%)" />
    </svg>
  );
}

// Fox - Clever blue fox for learning
function FoxCharacter({ waving }: { waving?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="foxBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(200, 85%, 55%)" />
          <stop offset="100%" stopColor="hsl(200, 85%, 40%)" />
        </linearGradient>
      </defs>
      {/* Ears */}
      <polygon points="30,5 20,30 40,30" fill="hsl(200, 85%, 50%)" />
      <polygon points="70,5 60,30 80,30" fill="hsl(200, 85%, 50%)" />
      <polygon points="30,10 24,26 36,26" fill="hsl(200, 85%, 70%)" />
      <polygon points="70,10 64,26 76,26" fill="hsl(200, 85%, 70%)" />
      {/* Body */}
      <ellipse cx="50" cy="65" rx="28" ry="25" fill="url(#foxBody)" />
      {/* Head */}
      <circle cx="50" cy="42" r="24" fill="hsl(200, 85%, 50%)" />
      {/* Face patch */}
      <ellipse cx="50" cy="50" rx="14" ry="12" fill="white" />
      {/* Eyes */}
      <ellipse cx="40" cy="40" rx="6" ry="7" fill="white" />
      <ellipse cx="60" cy="40" rx="6" ry="7" fill="white" />
      <circle cx="42" cy="41" r="3.5" fill="hsl(220, 25%, 18%)" />
      <circle cx="62" cy="41" r="3.5" fill="hsl(220, 25%, 18%)" />
      <circle cx="43" cy="39" r="1.5" fill="white" />
      <circle cx="63" cy="39" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="50" rx="4" ry="3" fill="hsl(220, 25%, 25%)" />
      {/* Smile */}
      <path d="M 44 54 Q 50 59, 56 54" fill="none" stroke="hsl(220, 25%, 18%)" strokeWidth="2" strokeLinecap="round" />
      {/* Arms */}
      <ellipse 
        cx="24" cy="60" rx="8" ry="14" fill="hsl(200, 85%, 45%)"
        className={waving ? 'wave-animation' : ''}
        style={{ transformOrigin: '24px 72px' }}
      />
      <ellipse cx="76" cy="60" rx="8" ry="14" fill="hsl(200, 85%, 45%)" />
      {/* Belly */}
      <ellipse cx="50" cy="68" rx="14" ry="12" fill="hsl(200, 85%, 75%)" opacity="0.5" />
      {/* Feet */}
      <ellipse cx="38" cy="88" rx="10" ry="6" fill="hsl(200, 85%, 40%)" />
      <ellipse cx="62" cy="88" rx="10" ry="6" fill="hsl(200, 85%, 40%)" />
      {/* Tail */}
      <ellipse cx="82" cy="75" rx="14" ry="8" fill="hsl(200, 85%, 50%)" transform="rotate(-30 82 75)" />
      <ellipse cx="90" cy="72" rx="6" ry="5" fill="white" transform="rotate(-30 90 72)" />
    </svg>
  );
}

// Cat - Playful pink cat 
function CatCharacter({ waving }: { waving?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="catBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(330, 80%, 70%)" />
          <stop offset="100%" stopColor="hsl(330, 80%, 55%)" />
        </linearGradient>
      </defs>
      {/* Ears */}
      <polygon points="28,8 18,32 38,28" fill="hsl(330, 80%, 65%)" />
      <polygon points="72,8 62,28 82,32" fill="hsl(330, 80%, 65%)" />
      <polygon points="28,14 22,28 34,26" fill="hsl(330, 80%, 80%)" />
      <polygon points="72,14 66,26 78,28" fill="hsl(330, 80%, 80%)" />
      {/* Body */}
      <ellipse cx="50" cy="65" rx="28" ry="25" fill="url(#catBody)" />
      {/* Head */}
      <circle cx="50" cy="42" r="24" fill="hsl(330, 80%, 65%)" />
      {/* Eyes */}
      <ellipse cx="40" cy="40" rx="7" ry="8" fill="white" />
      <ellipse cx="60" cy="40" rx="7" ry="8" fill="white" />
      <ellipse cx="42" cy="41" rx="4" ry="5" fill="hsl(145, 65%, 45%)" />
      <ellipse cx="62" cy="41" rx="4" ry="5" fill="hsl(145, 65%, 45%)" />
      <circle cx="42" cy="41" r="2" fill="hsl(220, 25%, 18%)" />
      <circle cx="62" cy="41" r="2" fill="hsl(220, 25%, 18%)" />
      <circle cx="43" cy="39" r="1" fill="white" />
      <circle cx="63" cy="39" r="1" fill="white" />
      {/* Nose */}
      <polygon points="50,48 47,52 53,52" fill="hsl(330, 80%, 50%)" />
      {/* Whiskers */}
      <line x1="30" y1="50" x2="18" y2="48" stroke="hsl(330, 80%, 40%)" strokeWidth="1.5" />
      <line x1="30" y1="54" x2="18" y2="56" stroke="hsl(330, 80%, 40%)" strokeWidth="1.5" />
      <line x1="70" y1="50" x2="82" y2="48" stroke="hsl(330, 80%, 40%)" strokeWidth="1.5" />
      <line x1="70" y1="54" x2="82" y2="56" stroke="hsl(330, 80%, 40%)" strokeWidth="1.5" />
      {/* Mouth */}
      <path d="M 47 54 L 50 58 L 53 54" fill="none" stroke="hsl(220, 25%, 18%)" strokeWidth="2" strokeLinecap="round" />
      {/* Arms */}
      <ellipse 
        cx="24" cy="60" rx="8" ry="14" fill="hsl(330, 80%, 60%)"
        className={waving ? 'wave-animation' : ''}
        style={{ transformOrigin: '24px 72px' }}
      />
      <ellipse cx="76" cy="60" rx="8" ry="14" fill="hsl(330, 80%, 60%)" />
      {/* Belly */}
      <ellipse cx="50" cy="68" rx="14" ry="12" fill="hsl(330, 80%, 85%)" opacity="0.6" />
      {/* Feet */}
      <ellipse cx="38" cy="88" rx="10" ry="6" fill="hsl(330, 80%, 55%)" />
      <ellipse cx="62" cy="88" rx="10" ry="6" fill="hsl(330, 80%, 55%)" />
      {/* Tail */}
      <path d="M 78 70 Q 95 60 92 45" fill="none" stroke="hsl(330, 80%, 60%)" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

// Character info for pages
export const PAGE_CHARACTERS: Record<string, { type: CharacterType; name: string; color: string }> = {
  '/': { type: 'owl', name: 'Ollie', color: 'hsl(145, 65%, 45%)' },
  '/auth': { type: 'bear', name: 'Bruno', color: 'hsl(28, 85%, 55%)' },
  '/parent-dashboard': { type: 'fox', name: 'Felix', color: 'hsl(200, 85%, 50%)' },
  '/child-dashboard': { type: 'bunny', name: 'Bella', color: 'hsl(270, 75%, 60%)' },
  '/games/shapes': { type: 'cat', name: 'Cleo', color: 'hsl(330, 80%, 65%)' },
  '/games/colors': { type: 'bunny', name: 'Bella', color: 'hsl(270, 75%, 60%)' },
  '/games/fruits': { type: 'bear', name: 'Bruno', color: 'hsl(28, 85%, 55%)' },
  '/games/sorting': { type: 'fox', name: 'Felix', color: 'hsl(200, 85%, 50%)' },
};
