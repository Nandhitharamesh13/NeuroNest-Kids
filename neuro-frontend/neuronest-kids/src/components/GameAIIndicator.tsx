import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Zap, Clock, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BehaviorProfile {
  preferred_pace: string;
  attention_span_minutes: number;
  prefers_sounds: boolean;
  prefers_animations: boolean;
  average_accuracy: number;
  frustration_threshold: number;
  current_difficulty_level: number;
  strong_categories: string[];
  challenging_categories: string[];
}

interface AITraceEvent {
  ts: number;
  action: string;
  result: unknown;
  error?: string;
}

interface AIRecommendation {
  level: string;
  message: string;
}

interface GameAIIndicatorProps {
  behaviorProfile: BehaviorProfile | null;
  aiTrace?: AITraceEvent[];
  consecutiveWrong?: number;
  currentStreak?: number;
  currentDifficulty?: 'easy' | 'hard';
  aiRecommendation?: AIRecommendation;
  className?: string;
}

export function GameAIIndicator({ 
  behaviorProfile, 
  aiTrace = [],
  consecutiveWrong = 0,
  currentStreak = 0,
  currentDifficulty,
  aiRecommendation,
  className 
}: GameAIIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!behaviorProfile) return null;

  const difficultyLevel = behaviorProfile.current_difficulty_level || 1;
  const difficultyLabels = ['Very Easy', 'Easy', 'Normal', 'Hard', 'Expert'];
  const difficultyLabel = difficultyLabels[Math.min(difficultyLevel - 1, 4)];
  const difficultyColors = [
    'bg-duo-green',
    'bg-duo-teal', 
    'bg-duo-blue',
    'bg-duo-orange',
    'bg-duo-red'
  ];

  const getStatusIndicator = () => {
    if (consecutiveWrong >= 3) {
      return { color: 'text-duo-orange', icon: TrendingDown, label: 'Struggling' };
    }
    if (currentStreak >= 3) {
      return { color: 'text-duo-green', icon: TrendingUp, label: 'Excelling' };
    }
    return { color: 'text-duo-blue', icon: Target, label: 'Focused' };
  };

  const status = getStatusIndicator();

  return (
    <div className={cn("fixed bottom-4 right-4 z-40", className)}>
      {/* Collapsed button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "rounded-full shadow-lg border-2 gap-2 transition-all duration-300",
          "bg-card hover:bg-muted",
          isExpanded && "rounded-b-none"
        )}
      >
        <Brain className="w-4 h-4 text-duo-purple" />
        <span className="text-xs font-medium">AI</span>
        <div className={cn(
          "w-2 h-2 rounded-full",
          difficultyColors[Math.min(difficultyLevel - 1, 4)]
        )} />
        {isExpanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronUp className="w-3 h-3" />
        )}
      </Button>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="absolute bottom-10 right-0 w-72 bg-card border-2 border-border rounded-2xl rounded-br-none shadow-xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-duo-purple/20 to-duo-blue/20 p-3 border-b">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-duo-purple" />
                AI Understanding
              </span>
              <div className={cn("flex items-center gap-1 text-xs", status.color)}>
                <status.icon className="w-3 h-3" />
                {status.label}
              </div>
            </div>
          </div>

          {/* Difficulty meter */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Difficulty Level</span>
              <span className="text-xs font-medium">{difficultyLabel}</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(level => (
                <div
                  key={level}
                  className={cn(
                    "flex-1 h-2 rounded-full transition-all",
                    level <= difficultyLevel
                      ? difficultyColors[Math.min(difficultyLevel - 1, 4)]
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="p-3 grid grid-cols-2 gap-2 border-b">
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Zap className="w-3 h-3" />
                Streak
              </div>
              <div className={cn(
                "text-lg font-bold",
                currentStreak >= 3 ? "text-duo-green" : "text-foreground"
              )}>
                {currentStreak}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                Pace
              </div>
              <div className="text-sm font-medium capitalize">
                {behaviorProfile.preferred_pace || 'Normal'}
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          {aiRecommendation && (
            <div className="p-3 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  currentDifficulty === 'hard' ? 'bg-duo-purple' : 'bg-duo-green'
                )} />
                <span className="text-xs font-medium">
                  {currentDifficulty === 'hard' ? '🔥 Challenge Mode' : '📚 Practice Mode'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{aiRecommendation.message}</p>
            </div>
          )}

          {/* AI insights */}
          <div className="p-3">
            <div className="text-xs text-muted-foreground mb-2">AI Insights</div>
            <div className="space-y-1 text-xs">
              {behaviorProfile.strong_categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-duo-green" />
                  <span>Strong in: {behaviorProfile.strong_categories.slice(0, 2).join(', ')}</span>
                </div>
              )}
              {behaviorProfile.challenging_categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-duo-orange" />
                  <span>Practicing: {behaviorProfile.challenging_categories.slice(0, 2).join(', ')}</span>
                </div>
              )}
              {consecutiveWrong >= 2 && (
                <div className="flex items-center gap-2 text-duo-orange">
                  <Brain className="w-3 h-3" />
                  <span>AI detecting difficulty, may show hint</span>
                </div>
              )}
              {behaviorProfile.average_accuracy > 0 && (
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-duo-blue" />
                  <span>Avg accuracy: {Math.round(behaviorProfile.average_accuracy)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent AI actions (developer view) */}
          {aiTrace.length > 0 && (
            <div className="p-3 border-t bg-muted/30 max-h-32 overflow-y-auto">
              <div className="text-xs text-muted-foreground mb-2">Recent AI Actions</div>
              <div className="space-y-1">
                {aiTrace.slice(0, 5).map((event, i) => (
                  <div key={i} className="text-xs flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      event.error ? "bg-duo-red" : "bg-duo-green"
                    )} />
                    <span className="font-mono text-muted-foreground">
                      {event.action}
                    </span>
                    <span className="text-muted-foreground/60">
                      {new Date(event.ts).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
