import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ChildAvatar } from './ChildAvatar';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Award,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Calendar,
  Flame,
  Star,
  Shapes,
  Palette,
  Apple,
  GripVertical,
  Cloud,
  Hash,
  Type,
  Smile,
  Grid3X3,
  Scale,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
}

interface GameSession {
  id: string;
  game_type: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  max_streak: number;
  duration_seconds: number;
  mistakes: Array<{ question?: string; correctAnswer?: string; userAnswer?: string; category?: string }>;
  created_at: string;
}

interface ChildReport {
  child: ChildProfile;
  sessions: GameSession[];
  totalGames: number;
  totalScore: number;
  avgAccuracy: number;
  totalTime: number;
  bestStreak: number;
  recentActivity: string;
  strengths: string[];
  areasToImprove: string[];
  gameBreakdown: Record<string, {
    games: number;
    avgScore: number;
    accuracy: number;
    totalTime: number;
    commonMistakes: string[];
  }>;
}

interface ParentReportDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ChildProfile[];
}

// ALL 12 game types with proper names and icons
const GAME_CONFIG: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  shapes: { name: '🔷 Match Shapes', icon: <Shapes className="w-4 h-4" />, color: 'bg-duo-purple/20' },
  colors: { name: '🎨 Learn Colors', icon: <Palette className="w-4 h-4" />, color: 'bg-duo-pink/20' },
  fruits: { name: '🍎 Fruits & Veggies', icon: <Apple className="w-4 h-4" />, color: 'bg-duo-green/20' },
  sorting: { name: '📦 Sort Items', icon: <GripVertical className="w-4 h-4" />, color: 'bg-duo-blue/20' },
  clock: { name: '🕐 Set the Clock', icon: <Clock className="w-4 h-4" />, color: 'bg-duo-blue/20' },
  weather: { name: '🌤️ Learn Weather', icon: <Cloud className="w-4 h-4" />, color: 'bg-duo-teal/20' },
  numbers: { name: '🔢 Match Numbers', icon: <Hash className="w-4 h-4" />, color: 'bg-duo-orange/20' },
  letters: { name: '✏️ Draw Letters', icon: <Type className="w-4 h-4" />, color: 'bg-duo-purple/20' },
  emotions: { name: '😊 Learn Emotions', icon: <Smile className="w-4 h-4" />, color: 'bg-duo-pink/20' },
  memory: { name: '🃏 Memory Cards', icon: <Grid3X3 className="w-4 h-4" />, color: 'bg-duo-teal/20' },
  counting: { name: '🧮 Count Along', icon: <Hash className="w-4 h-4" />, color: 'bg-duo-yellow/20' },
  comparing: { name: '⚖️ Compare Items', icon: <Scale className="w-4 h-4" />, color: 'bg-duo-orange/20' },
  alphabet: { name: '🔤 Alphabet A-Z', icon: <Type className="w-4 h-4" />, color: 'bg-duo-purple/20' },
  vowels: { name: '🅰️ Vowels', icon: <Type className="w-4 h-4" />, color: 'bg-duo-pink/20' },
  consonants: { name: '📝 Consonants', icon: <Type className="w-4 h-4" />, color: 'bg-duo-teal/20' },
  kitchen: { name: '👨‍🍳 Kitchen Items', icon: <Apple className="w-4 h-4" />, color: 'bg-duo-orange/20' },
  hometools: { name: '🔧 Home Tools', icon: <GripVertical className="w-4 h-4" />, color: 'bg-duo-blue/20' },
  animals: { name: '🦁 Animals', icon: <Star className="w-4 h-4" />, color: 'bg-duo-green/20' },
  bodyparts: { name: '🧍 Body Parts', icon: <Smile className="w-4 h-4" />, color: 'bg-duo-orange/20' },
  music: { name: '🎵 Music', icon: <Star className="w-4 h-4" />, color: 'bg-duo-pink/20' },
};

const ALL_GAME_TYPES = Object.keys(GAME_CONFIG);

export function ParentReportDashboard({ open, onOpenChange, children }: ParentReportDashboardProps) {
  const [reports, setReports] = useState<ChildReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string>('all');

  useEffect(() => {
    if (open && children.length > 0) {
      fetchAllReports();
    }
  }, [open, children]);

  const fetchAllReports = async () => {
    setLoading(true);
    const allReports: ChildReport[] = [];

    for (const child of children) {
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('child_id', child.id)
        .order('created_at', { ascending: false });

      const typedSessions = (sessions || []) as unknown as GameSession[];
      const report = calculateReport(child, typedSessions);
      allReports.push(report);
    }

    setReports(allReports);
    setLoading(false);
  };

  const calculateReport = (child: ChildProfile, sessions: GameSession[]): ChildReport => {
    const totalGames = sessions.length;
    const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correct_answers, 0);
    const totalQuestions = sessions.reduce((sum, s) => sum + s.total_questions, 0);
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    const bestStreak = Math.max(0, ...sessions.map(s => s.max_streak));
    
    const recentSession = sessions[0];
    const recentActivity = recentSession 
      ? new Date(recentSession.created_at).toLocaleDateString()
      : 'No activity yet';

    // Game breakdown for ALL game types
    const gameBreakdown: Record<string, { games: number; avgScore: number; accuracy: number; totalTime: number; commonMistakes: string[] }> = {};
    
    ALL_GAME_TYPES.forEach(type => {
      const gameSessions = sessions.filter(s => s.game_type === type);
      if (gameSessions.length > 0) {
        const gameCorrect = gameSessions.reduce((sum, s) => sum + s.correct_answers, 0);
        const gameTotal = gameSessions.reduce((sum, s) => sum + s.total_questions, 0);
        const gameTotalTime = gameSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
        
        // Collect mistakes
        const allMistakes: string[] = [];
        gameSessions.forEach(s => {
          if (s.mistakes && Array.isArray(s.mistakes)) {
            s.mistakes.forEach(m => {
              const mistakeText = m.correctAnswer || m.category || 'Unknown';
              allMistakes.push(mistakeText);
            });
          }
        });
        
        // Count mistake frequency
        const mistakeCounts: Record<string, number> = {};
        allMistakes.forEach(m => {
          mistakeCounts[m] = (mistakeCounts[m] || 0) + 1;
        });
        
        const commonMistakes = Object.entries(mistakeCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([item]) => item);

        gameBreakdown[type] = {
          games: gameSessions.length,
          avgScore: gameSessions.length > 0 
            ? Math.round(gameSessions.reduce((sum, s) => sum + s.score, 0) / gameSessions.length)
            : 0,
          accuracy: gameTotal > 0 ? Math.round((gameCorrect / gameTotal) * 100) : 0,
          totalTime: gameTotalTime,
          commonMistakes,
        };
      }
    });

    // Determine strengths and areas to improve
    const strengths: string[] = [];
    const areasToImprove: string[] = [];

    Object.entries(gameBreakdown).forEach(([game, data]) => {
      if (data.games >= 2) {
        const gameName = GAME_CONFIG[game]?.name || game;
        if (data.accuracy >= 80) {
          strengths.push(gameName);
        } else if (data.accuracy < 60) {
          areasToImprove.push(gameName);
        }
      }
    });

    return {
      child,
      sessions,
      totalGames,
      totalScore,
      avgAccuracy,
      totalTime,
      bestStreak,
      recentActivity,
      strengths,
      areasToImprove,
      gameBreakdown,
    };
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const filteredReports = selectedChild === 'all' 
    ? reports 
    : reports.filter(r => r.child.id === selectedChild);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Learning Progress Report
          </DialogTitle>
          <DialogDescription>
            Comprehensive analytics for all 12 game types across all children
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No children profiles found. Add a child to start tracking progress!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Child selector */}
            {children.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedChild === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChild('all')}
                  className="rounded-full"
                >
                  All Children
                </Button>
                {children.map(child => (
                  <Button
                    key={child.id}
                    variant={selectedChild === child.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedChild(child.id)}
                    className="rounded-full flex items-center gap-2"
                  >
                    <ChildAvatar avatar={child.avatar} size="xs" />
                    {child.name}
                  </Button>
                ))}
              </div>
            )}

            {/* Reports */}
            {filteredReports.map(report => (
              <div key={report.child.id} className="bg-muted/30 rounded-2xl p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <ChildAvatar avatar={report.child.avatar} size="lg" />
                  <div>
                    <h3 className="font-display text-2xl font-bold">{report.child.name}</h3>
                    <p className="text-muted-foreground">{report.child.age} years old</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-muted-foreground">Last Activity</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {report.recentActivity}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatCard
                    icon={<Award className="w-5 h-5 text-duo-yellow" />}
                    label="Total XP"
                    value={report.totalScore.toString()}
                    color="bg-duo-yellow/10"
                  />
                  <StatCard
                    icon={<Target className="w-5 h-5 text-duo-green" />}
                    label="Accuracy"
                    value={`${report.avgAccuracy}%`}
                    color="bg-duo-green/10"
                  />
                  <StatCard
                    icon={<Flame className="w-5 h-5 text-duo-orange" />}
                    label="Best Streak"
                    value={report.bestStreak.toString()}
                    color="bg-duo-orange/10"
                  />
                  <StatCard
                    icon={<Star className="w-5 h-5 text-duo-purple" />}
                    label="Games Played"
                    value={report.totalGames.toString()}
                    color="bg-duo-purple/10"
                  />
                  <StatCard
                    icon={<Timer className="w-5 h-5 text-duo-blue" />}
                    label="Total Time"
                    value={formatTime(report.totalTime)}
                    color="bg-duo-blue/10"
                  />
                </div>

                {/* Strengths & Areas to Improve */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-duo-green/10 rounded-xl p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-3 text-duo-green">
                      <CheckCircle2 className="w-5 h-5" />
                      Strengths
                    </h4>
                    {report.strengths.length > 0 ? (
                      <ul className="space-y-1">
                        {report.strengths.map((s, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-duo-green" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Play more games to discover strengths!
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-duo-orange/10 rounded-xl p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-3 text-duo-orange">
                      <AlertTriangle className="w-5 h-5" />
                      Areas to Focus
                    </h4>
                    {report.areasToImprove.length > 0 ? (
                      <ul className="space-y-1">
                        {report.areasToImprove.map((s, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <TrendingDown className="w-4 h-4 text-duo-orange" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Great progress! Keep it up!
                      </p>
                    )}
                  </div>
                </div>

                {/* All 12 Games Breakdown */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    All Games Performance ({Object.keys(report.gameBreakdown).length} of {ALL_GAME_TYPES.length} played)
                  </h4>
                  <Tabs defaultValue="played" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="played">Played Games</TabsTrigger>
                      <TabsTrigger value="all">All Games</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="played" className="space-y-3 mt-4">
                      {Object.entries(report.gameBreakdown).length > 0 ? (
                        Object.entries(report.gameBreakdown).map(([game, data]) => (
                          <GameStatCard key={game} gameType={game} data={data} formatTime={formatTime} />
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">No games played yet</p>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="all" className="space-y-3 mt-4">
                      {ALL_GAME_TYPES.map(game => {
                        const data = report.gameBreakdown[game];
                        if (data) {
                          return <GameStatCard key={game} gameType={game} data={data} formatTime={formatTime} />;
                        }
                        return (
                          <div key={game} className="bg-card rounded-xl p-4 opacity-50">
                            <div className="flex items-center gap-3">
                              <div className={cn('p-2 rounded-lg', GAME_CONFIG[game]?.color || 'bg-muted')}>
                                {GAME_CONFIG[game]?.icon}
                              </div>
                              <span className="font-medium">{GAME_CONFIG[game]?.name || game}</span>
                              <span className="ml-auto text-sm text-muted-foreground">Not played yet</span>
                            </div>
                          </div>
                        );
                      })}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Recent Sessions */}
                {report.sessions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-4">Recent Activity</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {report.sessions.slice(0, 10).map(session => (
                        <div 
                          key={session.id}
                          className="flex items-center justify-between bg-card rounded-lg p-3 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn('p-1.5 rounded', GAME_CONFIG[session.game_type]?.color || 'bg-muted')}>
                              {GAME_CONFIG[session.game_type]?.icon || <Star className="w-3 h-3" />}
                            </div>
                            <span>{GAME_CONFIG[session.game_type]?.name || session.game_type}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              {formatTime(session.duration_seconds || 0)}
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(session.created_at).toLocaleDateString()}
                            </span>
                            <span className="font-medium text-duo-green">
                              {session.score} XP
                            </span>
                            <span className={cn(
                              'font-medium',
                              session.total_questions > 0 && (session.correct_answers / session.total_questions) >= 0.8 
                                ? 'text-duo-green' 
                                : 'text-muted-foreground'
                            )}>
                              {session.total_questions > 0 
                                ? Math.round((session.correct_answers / session.total_questions) * 100)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className={cn(color, 'rounded-xl p-3 text-center')}>
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="font-bold text-lg">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function GameStatCard({ 
  gameType, 
  data, 
  formatTime 
}: { 
  gameType: string; 
  data: { games: number; avgScore: number; accuracy: number; totalTime: number; commonMistakes: string[] };
  formatTime: (s: number) => string;
}) {
  const config = GAME_CONFIG[gameType];
  
  return (
    <div className="bg-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-lg', config?.color || 'bg-muted')}>
            {config?.icon || <Star className="w-4 h-4" />}
          </div>
          <span className="font-medium">{config?.name || gameType}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {data.games} games • {formatTime(data.totalTime)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Progress value={data.accuracy} className="h-2" />
        </div>
        <span className={cn(
          'font-bold text-sm w-12 text-right',
          data.accuracy >= 80 ? 'text-duo-green' : data.accuracy >= 60 ? 'text-duo-yellow' : 'text-duo-orange'
        )}>
          {data.accuracy}%
        </span>
      </div>
      {data.commonMistakes.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Practice more: {data.commonMistakes.join(', ')}
        </p>
      )}
    </div>
  );
}
