import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge, useRewardSystem } from '@/hooks/useRewardSystem';
import { Star, Trophy, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RewardDisplayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childId: string;
  childName: string;
}

export function RewardDisplay({ open, onOpenChange, childId, childName }: RewardDisplayProps) {
  const { badges, totalStars, updateProgress, getBadgesByCategory, getUnlockedBadgeCount } = useRewardSystem(childId);

  useEffect(() => {
    if (open && childId) {
      updateProgress(childId);
    }
  }, [open, childId, updateProgress]);

  const categories = [
    { key: 'xp', label: 'XP', icon: '⭐' },
    { key: 'streak', label: 'Streaks', icon: '🔥' },
    { key: 'accuracy', label: 'Accuracy', icon: '🎯' },
    { key: 'games', label: 'Games', icon: '🎮' },
    { key: 'time', label: 'Time', icon: '⏰' },
    { key: 'special', label: 'Special', icon: '🏆' },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-duo-yellow" />
            {childName}'s Achievements
          </DialogTitle>
          <DialogDescription>
            Collect badges by playing games and improving skills!
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 my-4">
          <div className="bg-gradient-to-br from-duo-yellow/20 to-duo-orange/20 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-duo-yellow">{getUnlockedBadgeCount()}</div>
            <div className="text-sm text-muted-foreground">Badges Earned</div>
          </div>
          <div className="bg-gradient-to-br from-duo-purple/20 to-duo-pink/20 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-duo-purple">{badges.length}</div>
            <div className="text-sm text-muted-foreground">Total Badges</div>
          </div>
          <div className="bg-gradient-to-br from-duo-green/20 to-duo-teal/20 rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-duo-green">
              {Math.round((getUnlockedBadgeCount() / badges.length) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Completion</div>
          </div>
        </div>

        <Tabs defaultValue="xp" className="w-full">
          <TabsList className="grid grid-cols-6 mb-4">
            {categories.map((cat) => (
              <TabsTrigger key={cat.key} value={cat.key} className="text-xs px-2">
                <span className="mr-1">{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.key} value={cat.key} className="space-y-3">
              {getBadgesByCategory(cat.key).map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border p-4 transition-all duration-300',
        badge.unlocked
          ? 'bg-gradient-to-r from-duo-yellow/10 to-duo-orange/10 border-duo-yellow/30'
          : 'bg-muted/30 border-border opacity-70'
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl',
            badge.unlocked
              ? 'bg-gradient-to-br from-duo-yellow to-duo-orange shadow-lg'
              : 'bg-muted'
          )}
        >
          {badge.unlocked ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={cn(
              'font-semibold',
              badge.unlocked ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {badge.name}
            </h4>
            {badge.unlocked && (
              <Sparkles className="w-4 h-4 text-duo-yellow" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{badge.description}</p>
          
          {!badge.unlocked && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(badge.progress)}%</span>
              </div>
              <Progress value={badge.progress} className="h-2" />
            </div>
          )}
          
          {badge.unlocked && badge.unlockedAt && (
            <p className="text-xs text-duo-green mt-1">
              ✓ Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Badge unlock celebration overlay
export function BadgeUnlockCelebration({ 
  badge, 
  onClose 
}: { 
  badge: Badge; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl animate-scale-in">
        <div className="relative">
          {/* Celebration particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-ping"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${10 + Math.random() * 30}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s',
                }}
              >
                {['⭐', '✨', '🎉', '💫'][i % 4]}
              </div>
            ))}
          </div>

          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-duo-yellow to-duo-orange flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl animate-bounce">
            {badge.icon}
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Badge Unlocked!
        </h2>
        <h3 className="font-semibold text-duo-purple text-xl mb-2">
          {badge.name}
        </h3>
        <p className="text-muted-foreground mb-6">
          {badge.description}
        </p>

        <Button
          onClick={onClose}
          className="w-full h-12 text-lg rounded-2xl bg-gradient-to-r from-duo-green to-duo-teal"
        >
          Awesome! 🎉
        </Button>
      </div>
    </div>
  );
}
