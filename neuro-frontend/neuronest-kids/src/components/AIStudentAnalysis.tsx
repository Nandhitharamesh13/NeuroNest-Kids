import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameStats } from '@/hooks/useGameStats';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Sparkles, Target, TrendingUp, Lightbulb, Heart, Loader2, RefreshCw, Star, CheckCircle2 } from 'lucide-react';
import { InteractiveMascot } from './InteractiveMascot';

interface AIAnalysisProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childId: string;
  childName: string;
  childAge: number;
}

interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  gameToPlay: string | null;
}

interface AnalysisResult {
  summary: string;
  strengths: string[];
  areasForGrowth: string[];
  recommendations: Recommendation[];
  encouragement: string;
  nextMilestone: string;
  learningStyle: string;
  sensoryNotes: string;
}

export function AIStudentAnalysis({ open, onOpenChange, childId, childName, childAge }: AIAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisType, setAnalysisType] = useState<'comprehensive' | 'quick' | 'recommendations' | 'progress'>('comprehensive');
  const { getChildStats } = useGameStats();
  const { toast } = useToast();

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const stats = await getChildStats(childId);
      
      if (!stats || stats.totalGames === 0) {
        toast({
          title: 'No Data Yet',
          description: 'Play some games first to get AI insights!',
          variant: 'default',
        });
        setLoading(false);
        return;
      }

      // Transform stats for AI - using correct property names from useGameStats
      const gameStats = Object.entries(stats.gameBreakdown).map(([game, data]) => ({
        game,
        totalPlays: data.games,
        correctAnswers: Math.round(data.games * (data.accuracy / 100)),
        incorrectAnswers: data.games - Math.round(data.games * (data.accuracy / 100)),
        accuracy: data.accuracy,
        avgTimePerQuestion: 0,
        mostMissedAreas: stats.areasToImprove
          .filter(a => a.area.toLowerCase().includes(game.toLowerCase()))
          .map(a => a.area),
        streaks: {
          best: stats.bestStreak || 0,
          current: 0,
        },
      }));

      const strongAreas = Object.entries(stats.gameBreakdown)
        .filter(([_, data]) => data.accuracy >= 70)
        .map(([game]) => game);

      const weakAreas = Object.entries(stats.gameBreakdown)
        .filter(([_, data]) => data.accuracy < 50 && data.games > 0)
        .map(([game]) => game);

      const studentData = {
        childName,
        age: childAge,
        gameStats,
        totalPlayTime: stats.totalGames * 3,
        overallAccuracy: stats.averageAccuracy,
        strongAreas,
        weakAreas,
      };

      const { data, error } = await supabase.functions.invoke('ai-student-analysis', {
        body: { studentData, analysisType },
      });

      if (error) throw error;

      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not complete AI analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-duo-pink text-white';
      case 'medium': return 'bg-duo-orange text-white';
      case 'low': return 'bg-duo-blue text-white';
      default: return 'bg-muted';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Brain className="w-7 h-7 text-duo-purple" />
            AI Learning Insights
          </DialogTitle>
          <DialogDescription>
            Personalized analysis of {childName}'s learning journey
          </DialogDescription>
        </DialogHeader>

        {!analysis ? (
          <div className="py-8">
            <div className="flex justify-center mb-6">
              <InteractiveMascot size="lg" emotion={loading ? 'thinking' : 'encouraging'} />
            </div>

            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-lg mb-2">Choose Analysis Type</h3>
                <p className="text-muted-foreground text-sm">Select the type of insights you'd like</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'comprehensive', label: 'Full Report', icon: Sparkles, desc: 'Complete learning assessment' },
                  { type: 'quick', label: 'Quick Snapshot', icon: TrendingUp, desc: 'Brief overview' },
                  { type: 'recommendations', label: 'Game Tips', icon: Target, desc: 'What to play next' },
                  { type: 'progress', label: 'Progress Check', icon: CheckCircle2, desc: 'Track milestones' },
                ].map(({ type, label, icon: Icon, desc }) => (
                  <button
                    key={type}
                    onClick={() => setAnalysisType(type as typeof analysisType)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      analysisType === type 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${analysisType === type ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </button>
                ))}
              </div>

              <Button 
                onClick={runAnalysis} 
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-duo-purple to-duo-pink hover:opacity-90"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="next">Next Steps</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Summary */}
                <Card className="bg-gradient-to-br from-pastel-mint/30 to-pastel-sky/30 border-none">
                  <CardContent className="p-4">
                    <p className="text-foreground">{analysis.summary}</p>
                  </CardContent>
                </Card>

                {/* Strengths */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-duo-yellow fill-duo-yellow" />
                    Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.strengths.map((strength, i) => (
                      <Badge key={i} variant="secondary" className="bg-duo-green/20 text-duo-green border-duo-green/30">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Growth Areas */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-duo-blue" />
                    Areas for Growth
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.areasForGrowth.map((area, i) => (
                      <Badge key={i} variant="outline" className="border-duo-orange/50 text-duo-orange">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Encouragement */}
                <Card className="bg-gradient-to-r from-duo-pink/10 to-duo-purple/10 border-none">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Heart className="w-5 h-5 text-duo-pink flex-shrink-0 mt-0.5" />
                    <p className="text-foreground italic">{analysis.encouragement}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-duo-yellow" />
                        Learning Style
                      </h4>
                      <p className="text-muted-foreground text-sm">{analysis.learningStyle}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-duo-green" />
                        Next Milestone
                      </h4>
                      <p className="text-muted-foreground text-sm">{analysis.nextMilestone}</p>
                    </CardContent>
                  </Card>

                  {analysis.sensoryNotes && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Sensory Notes</h4>
                        <p className="text-muted-foreground text-sm">{analysis.sensoryNotes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="next" className="space-y-4 mt-4">
                <h4 className="font-semibold">Personalized Recommendations</h4>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium">{rec.title}</h5>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{rec.description}</p>
                        {rec.gameToPlay && (
                          <Badge variant="outline" className="mt-1">
                            🎮 Try: {rec.gameToPlay}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <Button 
              onClick={() => setAnalysis(null)} 
              variant="outline" 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Run New Analysis
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
