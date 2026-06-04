import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface GameCategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'shape' | 'color' | 'fruits' | 'sorting';
  onClick?: () => void;
  disabled?: boolean;
  progress?: number;
}

const colorClasses = {
  shape: 'bg-duo-purple hover:bg-duo-purple/90',
  color: 'bg-duo-orange hover:bg-duo-orange/90',
  fruits: 'bg-duo-green hover:bg-duo-green/90',
  sorting: 'bg-duo-blue hover:bg-duo-blue/90',
};

const iconBgClasses = {
  shape: 'bg-white/20',
  color: 'bg-white/20',
  fruits: 'bg-white/20',
  sorting: 'bg-white/20',
};

const shadowColors = {
  shape: 'shadow-[0_6px_0_hsl(270,75%,45%)]',
  color: 'shadow-[0_6px_0_hsl(28,95%,40%)]',
  fruits: 'shadow-[0_6px_0_hsl(145,65%,30%)]',
  sorting: 'shadow-[0_6px_0_hsl(200,85%,40%)]',
};

export function GameCategoryCard({ 
  title, 
  description, 
  icon, 
  color, 
  onClick,
  disabled = false,
  progress = 0
}: GameCategoryCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left rounded-3xl p-6 transition-all duration-200 cursor-pointer',
        colorClasses[color],
        shadowColors[color],
        'hover:translate-y-[-4px] hover:shadow-[0_10px_0_hsl(var(--foreground)/0.15)]',
        'active:translate-y-[2px] active:shadow-[0_2px_0_hsl(var(--foreground)/0.15)]',
        disabled && 'opacity-70 cursor-not-allowed hover:translate-y-0'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0',
          iconBgClasses[color]
        )}>
          <div className="text-white float-animation">
            {icon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-bold text-white mb-1">
            {title}
          </h3>
          
          <p className="text-white/80 text-sm mb-3">
            {description}
          </p>
          
          {/* Progress bar */}
          {!disabled && (
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          {disabled && (
            <span className="inline-block text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </button>
  );
}