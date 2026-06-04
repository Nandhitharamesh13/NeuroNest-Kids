import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChildAvatar } from './ChildAvatar';
import { cn } from '@/lib/utils';
import { Play, Edit2, Trash2, Sparkles, Trophy, Clock, Star, TrendingUp } from 'lucide-react';
import gsap from 'gsap';

interface EnhancedChildCardProps {
  child: {
    id: string;
    name: string;
    age: number;
    avatar: string;
  };
  stats?: {
    totalGames: number;
    totalXP: number;
    lastPlayed?: string;
  };
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EnhancedChildCard({ 
  child, 
  stats, 
  onPlay, 
  onEdit, 
  onDelete 
}: EnhancedChildCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    const ctx = gsap.context(() => {
      // Initial animation
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
      );
    }, cardRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (avatarRef.current) {
      gsap.to(avatarRef.current, {
        scale: 1.1,
        rotation: 5,
        duration: 0.3,
        ease: 'back.out(2)',
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (avatarRef.current) {
      gsap.to(avatarRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 transition-all duration-300",
        isHovered && "shadow-2xl scale-[1.02] border-duo-green/30"
      )}
    >
      {/* Decorative gradient header */}
      <div className="relative h-24 bg-gradient-to-br from-duo-green/20 via-duo-teal/10 to-duo-blue/20">
        {/* Decorative particles */}
        <div className="absolute top-2 left-4 text-lg opacity-20">⭐</div>
        <div className="absolute top-4 right-6 text-lg opacity-20">✨</div>
        <div className="absolute bottom-2 left-8 text-sm opacity-20">🎮</div>
        
        {/* Level badge */}
        {stats && stats.totalGames > 0 && (
          <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-duo-yellow" />
            <span className="text-xs font-bold text-slate-700">{stats.totalXP} XP</span>
          </div>
        )}
      </div>

      {/* Avatar - positioned to overlap header */}
      <div 
        ref={avatarRef}
        className="absolute left-1/2 transform -translate-x-1/2 top-10 z-10"
      >
        <div className="relative">
          <ChildAvatar avatar={child.avatar} size="lg" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-duo-green rounded-full flex items-center justify-center border-2 border-white shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-14 pb-6 px-6">
        <h3 className="font-display text-2xl font-bold text-slate-800 text-center mb-0.5">
          {child.name}
        </h3>
        <p className="text-slate-400 text-center text-sm mb-4">
          {child.age} years old
        </p>

        {/* Quick stats row */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="text-center py-2 bg-gradient-to-br from-duo-yellow/10 to-duo-orange/5 rounded-xl">
              <Star className="w-4 h-4 text-duo-yellow mx-auto mb-1" />
              <div className="text-xs font-bold text-slate-700">{stats.totalXP}</div>
              <div className="text-[10px] text-slate-400">XP</div>
            </div>
            <div className="text-center py-2 bg-gradient-to-br from-duo-green/10 to-duo-teal/5 rounded-xl">
              <TrendingUp className="w-4 h-4 text-duo-green mx-auto mb-1" />
              <div className="text-xs font-bold text-slate-700">{stats.totalGames}</div>
              <div className="text-[10px] text-slate-400">Games</div>
            </div>
            <div className="text-center py-2 bg-gradient-to-br from-duo-blue/10 to-duo-purple/5 rounded-xl">
              <Clock className="w-4 h-4 text-duo-blue mx-auto mb-1" />
              <div className="text-xs font-bold text-slate-700 truncate">{stats.lastPlayed || '-'}</div>
              <div className="text-[10px] text-slate-400">Last</div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={onPlay}
            className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-duo-green to-duo-teal hover:opacity-90 shadow-lg shadow-duo-green/25 h-12 font-semibold"
          >
            <Play className="w-5 h-5" />
            Play Now
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onEdit}
            className="rounded-xl h-12 w-12 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          >
            <Edit2 className="w-4 h-4 text-slate-500" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onDelete}
            className="rounded-xl h-12 w-12 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}
