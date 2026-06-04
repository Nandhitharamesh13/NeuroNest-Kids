import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { InteractiveMascot } from './InteractiveMascot';
import { Lightbulb, Heart, Sparkles } from 'lucide-react';
import gsap from 'gsap';

interface AdaptiveAIFeedbackProps {
  encouragement?: string | null;
  hint?: string | null;
  isLoading?: boolean;
  emotion?: 'happy' | 'encouraging' | 'thinking' | 'celebrating';
  onDismiss?: () => void;
  className?: string;
}

export function AdaptiveAIFeedback({
  encouragement,
  hint,
  isLoading,
  emotion = 'encouraging',
  onDismiss,
  className,
}: AdaptiveAIFeedbackProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (encouragement || hint || isLoading) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' }
      );
    }
  }, [encouragement, hint, isLoading]);

  if (!encouragement && !hint && !isLoading) return null;

  const message = encouragement || hint;
  const isHint = !!hint;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50",
        className
      )}
    >
      <div
        className={cn(
          "bg-card rounded-3xl p-4 shadow-xl border-2 flex items-start gap-3",
          isHint ? "border-duo-yellow/50 bg-gradient-to-br from-card to-duo-yellow/5" : 
                   "border-primary/30 bg-gradient-to-br from-card to-primary/5"
        )}
      >
        <div className="flex-shrink-0">
          <InteractiveMascot 
            size="sm" 
            emotion={isLoading ? 'thinking' : emotion}
            interactive={false}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isHint ? (
              <>
                <Lightbulb className="w-4 h-4 text-duo-yellow" />
                <span className="text-xs font-semibold text-duo-yellow">Helpful Hint</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 text-duo-pink" />
                <span className="text-xs font-semibold text-duo-pink">Encouragement</span>
              </>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          ) : (
            <p className="text-foreground font-medium text-sm leading-relaxed">
              {message}
            </p>
          )}
        </div>
        
        {!isLoading && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <span className="text-muted-foreground text-xs">✕</span>
          </button>
        )}
        
        {!isLoading && (
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-duo-yellow animate-pulse" />
        )}
      </div>
    </div>
  );
}
