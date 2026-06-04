import { cn } from '@/lib/utils';

interface ChildAvatarProps {
  avatar: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const avatarColors: Record<string, { bg: string; accent: string }> = {
  default: { bg: 'hsl(262, 60%, 82%)', accent: 'hsl(262, 60%, 70%)' },
  bunny: { bg: 'hsl(340, 60%, 85%)', accent: 'hsl(340, 60%, 75%)' },
  bear: { bg: 'hsl(25, 80%, 85%)', accent: 'hsl(25, 80%, 70%)' },
  cat: { bg: 'hsl(50, 80%, 85%)', accent: 'hsl(50, 80%, 70%)' },
  dog: { bg: 'hsl(200, 70%, 85%)', accent: 'hsl(200, 70%, 70%)' },
  owl: { bg: 'hsl(150, 50%, 82%)', accent: 'hsl(150, 50%, 65%)' },
};

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

export function ChildAvatar({ avatar, size = 'md', selected, onClick, className }: ChildAvatarProps) {
  const colors = avatarColors[avatar] || avatarColors.default;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        'rounded-full flex items-center justify-center transition-all duration-200',
        'border-4',
        selected ? 'border-primary scale-110 shadow-glow' : 'border-transparent hover:scale-105',
        onClick && 'cursor-pointer',
        className
      )}
      style={{ backgroundColor: colors.bg }}
      type="button"
    >
      <AvatarIcon avatar={avatar} colors={colors} />
    </button>
  );
}

function AvatarIcon({ avatar, colors }: { avatar: string; colors: { bg: string; accent: string } }) {
  switch (avatar) {
    case 'bunny':
      return (
        <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
          <ellipse cx="14" cy="8" rx="4" ry="10" fill={colors.accent} />
          <ellipse cx="26" cy="8" rx="4" ry="10" fill={colors.accent} />
          <circle cx="20" cy="24" r="12" fill={colors.accent} />
          <circle cx="15" cy="22" r="2" fill="hsl(240, 20%, 25%)" />
          <circle cx="25" cy="22" r="2" fill="hsl(240, 20%, 25%)" />
          <ellipse cx="20" cy="27" rx="2" ry="1.5" fill="hsl(340, 60%, 75%)" />
        </svg>
      );
    case 'bear':
      return (
        <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
          <circle cx="10" cy="10" r="6" fill={colors.accent} />
          <circle cx="30" cy="10" r="6" fill={colors.accent} />
          <circle cx="20" cy="22" r="14" fill={colors.accent} />
          <circle cx="14" cy="20" r="2" fill="hsl(240, 20%, 25%)" />
          <circle cx="26" cy="20" r="2" fill="hsl(240, 20%, 25%)" />
          <ellipse cx="20" cy="26" rx="3" ry="2" fill="hsl(25, 50%, 50%)" />
        </svg>
      );
    case 'cat':
      return (
        <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
          <polygon points="8,8 14,22 2,22" fill={colors.accent} />
          <polygon points="32,8 38,22 26,22" fill={colors.accent} />
          <circle cx="20" cy="24" r="12" fill={colors.accent} />
          <ellipse cx="14" cy="22" rx="2" ry="2.5" fill="hsl(240, 20%, 25%)" />
          <ellipse cx="26" cy="22" rx="2" ry="2.5" fill="hsl(240, 20%, 25%)" />
          <ellipse cx="20" cy="27" rx="1.5" ry="1" fill="hsl(340, 60%, 75%)" />
        </svg>
      );
    case 'dog':
      return (
        <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
          <ellipse cx="8" cy="16" rx="6" ry="8" fill={colors.accent} />
          <ellipse cx="32" cy="16" rx="6" ry="8" fill={colors.accent} />
          <circle cx="20" cy="22" r="12" fill={colors.accent} />
          <circle cx="14" cy="20" r="2" fill="hsl(240, 20%, 25%)" />
          <circle cx="26" cy="20" r="2" fill="hsl(240, 20%, 25%)" />
          <ellipse cx="20" cy="26" rx="4" ry="2.5" fill="hsl(25, 40%, 35%)" />
        </svg>
      );
    case 'owl':
      return (
        <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
          <circle cx="20" cy="22" r="14" fill={colors.accent} />
          <circle cx="13" cy="20" r="5" fill="white" />
          <circle cx="27" cy="20" r="5" fill="white" />
          <circle cx="13" cy="20" r="2.5" fill="hsl(240, 20%, 25%)" />
          <circle cx="27" cy="20" r="2.5" fill="hsl(240, 20%, 25%)" />
          <polygon points="20,24 18,28 22,28" fill="hsl(30, 70%, 50%)" />
          <polygon points="10,8 20,16 8,16" fill={colors.accent} />
          <polygon points="30,8 32,16 20,16" fill={colors.accent} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 40" className="w-3/4 h-3/4">
          <circle cx="20" cy="20" r="14" fill={colors.accent} />
          <circle cx="14" cy="18" r="2" fill="hsl(240, 20%, 25%)" />
          <circle cx="26" cy="18" r="2" fill="hsl(240, 20%, 25%)" />
          <path d="M 14 26 Q 20 30, 26 26" fill="none" stroke="hsl(240, 20%, 25%)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export const AVATAR_OPTIONS = ['default', 'bunny', 'bear', 'cat', 'dog', 'owl'];
