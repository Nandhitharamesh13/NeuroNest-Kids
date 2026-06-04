import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameStats } from '@/hooks/useGameStats';
import { 
  Trophy, Target, Flame, AlertCircle, TrendingUp, Gamepad2, 
  Clock, Timer, Brain, Shapes, Palette, Apple, GripVertical,
  Cloud, Hash, Type, Smile, Grid3X3, Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childId: string;
  childName: string;
}

interface Stats {
  totalGames: number;
  totalScore: number;
  averageAccuracy: number;
  totalMistakes: number;
  bestStreak: number;
  totalPlayTime: number;
  averageResponseTime: number;
  gameBreakdown: Record<string, { 
    games: number; 
    accuracy: number; 
    totalScore: number;
    totalTime: number;
    avgTime: number;
    wrongAnswers: number;
  }>;
  recentMistakes: Array<{ 
    question: string; 
    correctAnswer: string; 
    userAnswer: string; 
    gameType?: string;
    responseTimeMs?: number;
    timestamp?: number;
  }>;
  areasToImprove: Array<{ area: string; count: number }>;
  mistakeDetails: Array<any>;
  performanceOverTime: Array<{
    date: string;
    gameType: string;
    accuracy: number;
    score: number;
    duration: number;
  }>;
}

const gameIcons: Record<string, React.ReactNode> = {
  shapes: <Shapes className="w-5 h-5" />,
  colors: <Palette className="w-5 h-5" />,
  fruits: <Apple className="w-5 h-5" />,
  sorting: <GripVertical className="w-5 h-5" />,
  clock: <Clock className="w-5 h-5" />,
  weather: <Cloud className="w-5 h-5" />,
  numbers: <Hash className="w-5 h-5" />,
  letters: <Type className="w-5 h-5" />,
  emotions: <Smile className="w-5 h-5" />,
  memory: <Grid3X3 className="w-5 h-5" />,
  counting: <Hash className="w-5 h-5" />,
  comparing: <Scale className="w-5 h-5" />,
};

const gameColors: Record<string, string> = {
  shapes: 'bg-duo-purple/20 text-duo-purple',
  colors: 'bg-duo-orange/20 text-duo-orange',
  fruits: 'bg-duo-green/20 text-duo-green',
  sorting: 'bg-duo-blue/20 text-duo-blue',
  clock: 'bg-duo-blue/20 text-duo-blue',
  weather: 'bg-duo-teal/20 text-duo-teal',
  numbers: 'bg-duo-orange/20 text-duo-orange',
  letters: 'bg-duo-purple/20 text-duo-purple',
  emotions: 'bg-duo-pink/20 text-duo-pink',
  memory: 'bg-duo-teal/20 text-duo-teal',
  counting: 'bg-duo-yellow/20 text-duo-yellow',
  comparing: 'bg-duo-orange/20 text-duo-orange',
};

const gameProgressColors: Record<string, string> = {
  shapes: 'bg-duo-purple',
  colors: 'bg-duo-orange',
  fruits: 'bg-duo-green',
  sorting: 'bg-duo-blue',
  clock: 'bg-duo-blue',
  weather: 'bg-duo-teal',
  numbers: 'bg-duo-orange',
  letters: 'bg-duo-purple',
  emotions: 'bg-duo-pink',
  memory: 'bg-duo-teal',
  counting: 'bg-duo-yellow',
  comparing: 'bg-duo-orange',
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function PlayerStatsModal({ open, onOpenChange, childId, childName }: PlayerStatsModalProps) {
  const { getChildStats } = useGameStats();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && childId) {
      setLoading(true);
      getChildStats(childId).then(data => {
        setStats(data);
        setLoading(false);
      });
    }
  }, [open, childId, getChildStats]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-duo-yellow" />
            {childName}'s Progress Report
          </DialogTitle>
          <DialogDescription>
            Comprehensive learning analytics and AI-powered insights
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stats && stats.totalGames > 0 ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="games">Games</TabsTrigger>
              <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
              <TabsTrigger value="ai">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 py-4">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  icon={<Gamepad2 className="w-5 h-5" />}
                  label="Games Played"
                  value={stats.totalGames}
                  color="bg-duo-blue/20 text-duo-blue"
                />
                <StatCard
                  icon={<Trophy className="w-5 h-5" />}
                  label="Total Score"
                  value={stats.totalScore}
                  color="bg-duo-yellow/20 text-duo-yellow"
                />
                <StatCard
                  icon={<Target className="w-5 h-5" />}
                  label="Accuracy"
                  value={`${stats.averageAccuracy}%`}
                  color="bg-duo-green/20 text-duo-green"
                />
                <StatCard
                  icon={<Flame className="w-5 h-5" />}
                  label="Best Streak"
                  value={stats.bestStreak}
                  color="bg-duo-orange/20 text-duo-orange"
                />
              </div>

              {/* Time Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-5 h-5 text-duo-blue" />
                    <span className="font-semibold">Total Play Time</span>
                  </div>
                  <p className="text-2xl font-bold">{formatDuration(stats.totalPlayTime)}</p>
                </div>
                <div className="bg-muted/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-duo-red" />
                    <span className="font-semibold">Total Mistakes</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalMistakes}</p>
                </div>
              </div>

              {/* Performance Trend */}
              {stats.performanceOverTime.length > 0 && (
                <div className="bg-muted/50 rounded-2xl p-4">
                  <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Recent Performance
                  </h3>
                  <div className="space-y-2">
                    {stats.performanceOverTime.slice(-5).map((session, i) => (
                      <div key={i} className="flex items-center justify-between bg-card rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('p-1.5 rounded-lg', gameColors[session.gameType] || 'bg-muted')}>
                            {gameIcons[session.gameType] || <Gamepad2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-medium capitalize">{session.gameType}</span>
                            <p className="text-xs text-muted-foreground">{formatDate(session.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            "font-bold",
                            session.accuracy >= 80 ? "text-duo-green" : 
                            session.accuracy >= 50 ? "text-duo-yellow" : "text-duo-red"
                          )}>
                            {session.accuracy}%
                          </span>
                          <p className="text-xs text-muted-foreground">{formatDuration(session.duration)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="games" className="space-y-4 py-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-primary" />
                Game Performance Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.gameBreakdown).map(([game, data]) => (
                  <div key={game} className="bg-card rounded-2xl p-4 shadow-soft">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn('p-2 rounded-xl', gameColors[game] || 'bg-muted')}>
                        {gameIcons[game] || <Gamepad2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold capitalize">{game}</span>
                          <span className="text-sm font-bold">{data.accuracy}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn('h-full rounded-full gpu-accelerated', gameProgressColors[game] || 'bg-primary')}
                            style={{ width: `${data.accuracy}%`, transition: 'width 0.5s ease' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <div className="font-bold">{data.games}</div>
                        <div className="text-xs text-muted-foreground">Games</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <div className="font-bold">{data.totalScore}</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <div className="font-bold">{formatDuration(data.avgTime)}</div>
                        <div className="text-xs text-muted-foreground">Avg Time</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <div className="font-bold text-duo-red">{data.wrongAnswers}</div>
                        <div className="text-xs text-muted-foreground">Mistakes</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mistakes" className="space-y-4 py-4">
              {/* Areas to Improve */}
              {stats.areasToImprove.length > 0 && (
                <div className="bg-duo-red/10 rounded-2xl p-4">
                  <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-duo-red" />
                    Areas to Practice
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.areasToImprove.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-card rounded-full text-sm font-medium flex items-center gap-1"
                      >
                        {item.area}
                        <span className="text-xs text-muted-foreground">({item.count}x)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Mistake Log */}
              {stats.recentMistakes.length > 0 && (
                <div className="bg-muted/50 rounded-2xl p-4">
                  <h3 className="font-display text-lg font-semibold mb-3">Detailed Mistake Log</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {stats.recentMistakes.map((mistake, i) => (
                      <div key={i} className="bg-card rounded-xl p-3 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn('p-1 rounded', gameColors[mistake.gameType || ''] || 'bg-muted')}>
                              {gameIcons[mistake.gameType || ''] || <Gamepad2 className="w-3 h-3" />}
                            </div>
                            <span className="font-medium capitalize">{mistake.gameType}</span>
                          </div>
                          {mistake.responseTimeMs && (
                            <span className="text-xs text-muted-foreground">
                              {(mistake.responseTimeMs / 1000).toFixed(1)}s response
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-1">{mistake.question}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-duo-red line-through">{mistake.userAnswer}</span>
                          <span className="text-duo-green font-medium">→ {mistake.correctAnswer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.recentMistakes.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-duo-yellow mx-auto mb-3" />
                  <h3 className="font-display text-xl font-semibold mb-2">No Mistakes Yet!</h3>
                  <p className="text-muted-foreground">Keep up the great work!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="space-y-4 py-4">
              <div className="bg-gradient-to-br from-duo-purple/10 to-duo-blue/10 rounded-2xl p-4 border border-duo-purple/20">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-6 h-6 text-duo-purple" />
                  <h3 className="font-display text-lg font-semibold">AI Learning Analysis</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Learning Style */}
                  <div className="bg-card rounded-xl p-4">
                    <h4 className="font-semibold mb-2">Learning Style Detected</h4>
                    <p className="text-muted-foreground text-sm">
                      {stats.averageAccuracy >= 80 
                        ? "Fast learner - child adapts quickly to new concepts and shows consistent performance."
                        : stats.averageAccuracy >= 60
                        ? "Steady learner - child benefits from repetition and visual cues."
                        : "Needs support - consider slower pacing and more encouragement."}
                    </p>
                  </div>

                  {/* Response Time Analysis */}
                  <div className="bg-card rounded-xl p-4">
                    <h4 className="font-semibold mb-2">Response Time Insights</h4>
                    <p className="text-muted-foreground text-sm">
                      Average response time: <span className="font-bold text-foreground">
                        {stats.averageResponseTime > 0 ? `${(stats.averageResponseTime / 1000).toFixed(1)}s` : 'N/A'}
                      </span>
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {stats.averageResponseTime > 5000
                        ? "Child takes time to process - ensure patience and avoid rushing."
                        : stats.averageResponseTime > 2000
                        ? "Normal processing speed - current difficulty level is appropriate."
                        : "Quick responses - may be ready for increased challenge."}
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-card rounded-xl p-4">
                    <h4 className="font-semibold mb-2">AI Recommendations</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      {stats.areasToImprove.length > 0 && (
                        <li className="flex items-start gap-2">
                          <span className="text-duo-yellow">•</span>
                          Focus on: {stats.areasToImprove.slice(0, 3).map(a => a.area).join(', ')}
                        </li>
                      )}
                      {Object.keys(stats.gameBreakdown).length < 6 && (
                        <li className="flex items-start gap-2">
                          <span className="text-duo-blue">•</span>
                          Try more game types for diverse learning
                        </li>
                      )}
                      {stats.totalPlayTime < 300 && (
                        <li className="flex items-start gap-2">
                          <span className="text-duo-green">•</span>
                          Increase daily play time for better retention
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <span className="text-duo-purple">•</span>
                        AI is continuously adapting to this child's learning patterns
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No games played yet!</h3>
            <p className="text-muted-foreground">Start playing games to see progress here.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 text-center shadow-soft">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2', color)}>
        {icon}
      </div>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
