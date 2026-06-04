import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { InteractiveMascot } from '@/components/InteractiveMascot';
import { ChildAvatar } from '@/components/ChildAvatar';
import { EnhancedMiniGameCard } from '@/components/EnhancedMiniGameCard';
import { GameHubCategory } from '@/components/GameHubCategory';
import { PlayerStatsModal } from '@/components/PlayerStatsModal';
import { AIStudentAnalysis } from '@/components/AIStudentAnalysis';
import { RewardDisplay } from '@/components/RewardDisplay';
import { useToast } from '@/hooks/use-toast';
import { useGameStats } from '@/hooks/useGameStats';
import { useRewardSystem } from '@/hooks/useRewardSystem';
import { useRemoteControlSettingsChild } from '@/hooks/useRemoteControlSettings';
import { ArrowLeft, Star, BarChart3, Clock, Hash, Type, Brain, Sparkles, Trophy, Award, Apple, PawPrint, Music, Calendar, Users, Settings2, Wifi } from 'lucide-react';
import gsap from 'gsap';
import { SensorySettingsPanel } from '@/components/SensorySettingsPanel';
import { DailyScheduleBuilder } from '@/components/DailyScheduleBuilder';
import { SocialSkillsTraining } from '@/components/SocialSkillsTraining';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
}

export default function ChildDashboard() {
  const { childId } = useParams<{ childId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getChildStats } = useGameStats();
  const { unlockedBadgeCount, updateProgress } = useRewardSystem(childId);
  const { settings: remoteSettings } = useRemoteControlSettingsChild(childId || null);
  
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showSensorySettings, setShowSensorySettings] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showSocialSkills, setShowSocialSkills] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [gameProgress, setGameProgress] = useState<Record<string, number>>({});
  const [unlockedBadges, setUnlockedBadges] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Category mapping for remote control filtering
  const CATEGORY_GAMES: Record<string, string[]> = {
    everyday: ['clock', 'weather', 'fruits', 'kitchen', 'hometools'],
    numbers: ['numbers', 'counting', 'comparing'],
    words: ['alphabet', 'vowels', 'consonants', 'letters'],
    sensory: ['shapes', 'colors', 'emotions', 'memory', 'sorting'],
    world: ['animals', 'bodyparts', 'music'],
  };

  const isGameEnabled = (gameKey: string) => {
    if (!remoteSettings) return true; // No remote settings = all enabled
    for (const [catId, games] of Object.entries(CATEGORY_GAMES)) {
      if (games.includes(gameKey)) {
        return remoteSettings.enabledCategories.includes(catId);
      }
    }
    return true;
  };

  const isCategoryEnabled = (catId: string) => {
    if (!remoteSettings) return true;
    return remoteSettings.enabledCategories.includes(catId);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && childId) {
      fetchChildProfile();
      fetchStats();
    }
  }, [user, childId]);

  useEffect(() => {
    if (childId) {
      updateProgress(childId);
    }
  }, [childId, updateProgress]);

  useEffect(() => {
    setUnlockedBadges(unlockedBadgeCount);
  }, [unlockedBadgeCount]);

  const fetchChildProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('id', childId)
        .single();

      if (error) throw error;
      setChild(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
      navigate('/parent-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!childId) return;
    const stats = await getChildStats(childId);
    if (stats) {
      setTotalXP(stats.totalScore);
      const progress: Record<string, number> = {};
      Object.entries(stats.gameBreakdown).forEach(([game, data]) => {
        progress[game] = Math.min(data.accuracy, 100);
      });
      setGameProgress(progress);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-duo-green/10 via-background to-duo-blue/10 flex items-center justify-center">
        <InteractiveMascot size="xl" emotion="happy" />
      </div>
    );
  }

  if (!child) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-mint via-background to-pastel-sky overflow-hidden page-enter">
      {/* Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-5xl opacity-15 float-animation gpu-accelerated">⭐</div>
        <div className="absolute top-32 right-8 text-4xl opacity-15 float-animation gpu-accelerated" style={{animationDelay: '0.5s'}}>🎮</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-15 float-animation gpu-accelerated" style={{animationDelay: '1s'}}>🏆</div>
        <div className="absolute bottom-16 right-16 text-5xl opacity-15 float-animation gpu-accelerated" style={{animationDelay: '1.5s'}}>🎯</div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/parent-dashboard')}
          className="gap-2 text-lg font-semibold gpu-accelerated"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowRewards(true)}
            className="gap-2 rounded-full bg-gradient-to-r from-duo-yellow/10 to-duo-orange/10 border-duo-yellow/30 hover:border-duo-yellow gpu-accelerated"
          >
            <Trophy className="w-5 h-5 text-duo-yellow" />
            <span className="hidden sm:inline">Rewards</span>
            {unlockedBadges > 0 && (
              <span className="bg-duo-yellow text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unlockedBadges}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowStats(true)}
            className="gap-2 rounded-full gpu-accelerated"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="hidden sm:inline">Stats</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSensorySettings(true)}
            className="gap-2 rounded-full gpu-accelerated"
          >
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pb-12">
        {/* Hero greeting */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Remote control sync indicator */}
          {remoteSettings && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 slide-up" style={{ animationDelay: '0.05s' }}>
              <Wifi className="w-3 h-3 text-duo-green" />
              <span>Parent remote control active</span>
            </div>
          )}
          <div className="flex items-center gap-4 mb-3 slide-up">
            <ChildAvatar avatar={child.avatar} size="lg" />
            <InteractiveMascot size="lg" emotion="happy" />
          </div>
          
           <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-1 slide-up" style={{ animationDelay: '0.1s' }}>
            Hello, {child.name}! 👋
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground slide-up" style={{ animationDelay: '0.15s' }}>
            Choose a game and start learning!
          </p>
          
          {/* XP Badge and AI Button */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-duo-yellow/20 to-duo-orange/20 px-4 py-1.5 rounded-full gpu-accelerated shadow-sm">
              <Star className="w-4 h-4 text-duo-yellow fill-duo-yellow" />
              <span className="font-bold text-foreground text-sm">{totalXP} XP</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-duo-purple/20 to-duo-pink/20 px-4 py-1.5 rounded-full gpu-accelerated shadow-sm">
              <Award className="w-4 h-4 text-duo-purple" />
              <span className="font-bold text-foreground text-sm">{unlockedBadges} Badges</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIAnalysis(true)}
              className="gap-2 rounded-full bg-gradient-to-r from-duo-purple/10 to-duo-pink/10 border-duo-purple/30 hover:border-duo-purple"
            >
              <Sparkles className="w-4 h-4 text-duo-purple" />
              AI Insights
            </Button>
          </div>
        </div>

        {/* Game Categories with Enhanced MiniGameCard UI */}
        <div className="stagger-children space-y-6">
          {/* Everyday Basics */}
          {isCategoryEnabled('everyday') && (
          <GameHubCategory 
            title="Everyday Basics" 
            icon={<Clock className="w-5 h-5" />}
            color="bg-duo-blue"
          >
            <EnhancedMiniGameCard
              title="Set the Clock"
              emoji="🕐"
              color="blue"
              description="Learn to tell time"
              difficulty="Easy"
              onClick={() => navigate(`/games/clock/${childId}`)}
              progress={gameProgress.clock || 0}
            />
            <EnhancedMiniGameCard
              title="Learn Weather"
              emoji="🌤️"
              color="teal"
              description="Understand weather patterns"
              difficulty="Easy"
              onClick={() => navigate(`/games/weather/${childId}`)}
              progress={gameProgress.weather || 0}
            />
            <EnhancedMiniGameCard
              title="Fruits & Veggies"
              emoji="🍎"
              color="green"
              description="Identify healthy foods"
              difficulty="Easy"
              onClick={() => navigate(`/games/fruits/${childId}`)}
              progress={gameProgress.fruits || 0}
            />
          </GameHubCategory>
          )}

          {/* Numbers in Action */}
          {isCategoryEnabled('numbers') && (
          <GameHubCategory 
            title="Numbers in Action" 
            icon={<Hash className="w-5 h-5" />}
            color="bg-duo-orange"
          >
            <EnhancedMiniGameCard title="Match Numbers" emoji="🔢" color="orange" description="Practice number recognition" difficulty="Medium" onClick={() => navigate(`/games/numbers/${childId}`)} progress={gameProgress.numbers || 0} />
            <EnhancedMiniGameCard title="Count Along" emoji="🧮" color="yellow" description="Learn counting skills" difficulty="Easy" onClick={() => navigate(`/games/counting/${childId}`)} progress={gameProgress.counting || 0} />
            <EnhancedMiniGameCard title="Compare Items" emoji="⚖️" color="orange" description="Greater, less, or equal" difficulty="Medium" onClick={() => navigate(`/games/comparing/${childId}`)} progress={gameProgress.comparing || 0} />
          </GameHubCategory>
          )}

          {/* Word Station */}
          {isCategoryEnabled('words') && (
          <GameHubCategory 
            title="Word Station" 
            icon={<Type className="w-5 h-5" />}
            color="bg-duo-purple"
          >
            <EnhancedMiniGameCard title="Alphabet A-Z" emoji="🔤" color="purple" description="Learn the alphabet" difficulty="Easy" onClick={() => navigate(`/games/alphabet/${childId}`)} progress={gameProgress.alphabet || 0} />
            <EnhancedMiniGameCard title="Vowels A-E-I-O-U" emoji="🅰️" color="pink" description="Master the vowels" difficulty="Easy" onClick={() => navigate(`/games/vowels/${childId}`)} progress={gameProgress.vowels || 0} />
            <EnhancedMiniGameCard title="Vowel or Consonant" emoji="📝" color="teal" description="Sort letters by type" difficulty="Medium" onClick={() => navigate(`/games/consonants/${childId}`)} progress={gameProgress.consonants || 0} />
            <EnhancedMiniGameCard title="Draw Letters" emoji="✏️" color="purple" description="Practice letter tracing" difficulty="Medium" onClick={() => navigate(`/games/letters/${childId}`)} progress={gameProgress.letters || 0} />
          </GameHubCategory>
          )}

          {/* Life Skills (maps to everyday) */}
          {isCategoryEnabled('everyday') && (
          <GameHubCategory 
            title="Life Skills" 
            icon={<Apple className="w-5 h-5" />}
            color="bg-duo-orange"
          >
            <EnhancedMiniGameCard title="Kitchen Items" emoji="👨‍🍳" color="orange" description="Learn kitchen tools" difficulty="Easy" onClick={() => navigate(`/games/kitchen/${childId}`)} progress={gameProgress.kitchen || 0} />
            <EnhancedMiniGameCard title="Home Tools" emoji="🔧" color="blue" description="Identify household tools" difficulty="Easy" onClick={() => navigate(`/games/hometools/${childId}`)} progress={gameProgress.hometools || 0} />
            <EnhancedMiniGameCard title="Learn Colors" emoji="🎨" color="pink" description="Identify different colors" difficulty="Easy" onClick={() => navigate(`/games/colors/${childId}`)} progress={gameProgress.colors || 0} />
            <EnhancedMiniGameCard title="Match Shapes" emoji="🔷" color="purple" description="Recognize shape patterns" difficulty="Easy" onClick={() => navigate(`/games/shapes/${childId}`)} progress={gameProgress.shapes || 0} />
          </GameHubCategory>
          )}

          {/* Sensory & Memory */}
          {isCategoryEnabled('sensory') && (
          <GameHubCategory 
            title="Sensory & Memory" 
            icon={<Brain className="w-5 h-5" />}
            color="bg-duo-pink"
          >
            <EnhancedMiniGameCard title="Learn Emotions" emoji="😊" color="pink" description="Understand feelings" difficulty="Medium" onClick={() => navigate(`/games/emotions/${childId}`)} progress={gameProgress.emotions || 0} />
            <EnhancedMiniGameCard title="Memory Cards" emoji="🃏" color="teal" description="Train your memory" difficulty="Hard" onClick={() => navigate(`/games/memory/${childId}`)} progress={gameProgress.memory || 0} />
            <EnhancedMiniGameCard title="Sort Items" emoji="📦" color="green" description="Categorize objects" difficulty="Medium" onClick={() => navigate(`/games/sorting/${childId}`)} progress={gameProgress.sorting || 0} />
          </GameHubCategory>
          )}

          {/* World Around Us */}
          {isCategoryEnabled('world') && (
          <GameHubCategory 
            title="World Around Us" 
            icon={<PawPrint className="w-5 h-5" />}
            color="bg-duo-green"
          >
            <EnhancedMiniGameCard title="Animals" emoji="🦁" color="green" description="Learn animal names" difficulty="Easy" onClick={() => navigate(`/games/animals/${childId}`)} progress={gameProgress.animals || 0} />
            <EnhancedMiniGameCard title="Body Parts" emoji="🧍" color="orange" description="Know your body" difficulty="Easy" onClick={() => navigate(`/games/bodyparts/${childId}`)} progress={gameProgress.bodyparts || 0} />
            <EnhancedMiniGameCard title="Music & Instruments" emoji="🎵" color="pink" description="Explore musical sounds" difficulty="Easy" onClick={() => navigate(`/games/music/${childId}`)} progress={gameProgress.music || 0} />
          </GameHubCategory>
          )}

          {/* Social & Routine Skills */}
          <GameHubCategory 
            title="Social & Routine Skills" 
            icon={<Users className="w-5 h-5" />}
            color="bg-duo-purple"
          >
            <EnhancedMiniGameCard title="Daily Schedule" emoji="📅" color="blue" description="Build your daily routine" difficulty="Easy" onClick={() => setShowSchedule(true)} progress={0} />
            <EnhancedMiniGameCard title="Social Stories" emoji="👋" color="purple" description="Learn social situations" difficulty="Medium" onClick={() => setShowSocialSkills(true)} progress={0} />
          </GameHubCategory>
        </div>

        {/* Mascot encouragement */}
        <div className="mt-8 flex justify-center slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-card gpu-accelerated">
            <InteractiveMascot size="sm" emotion="encouraging" />
            <p className="text-base text-foreground font-medium">
              Pick any game and have fun learning! 🚀
            </p>
          </div>
        </div>
      </main>

      {/* Stats Modal */}
      {childId && child && (
        <PlayerStatsModal
          open={showStats}
          onOpenChange={setShowStats}
          childId={childId}
          childName={child.name}
        />
      )}

      {/* AI Analysis Modal */}
      {childId && child && (
        <AIStudentAnalysis
          open={showAIAnalysis}
          onOpenChange={setShowAIAnalysis}
          childId={childId}
          childName={child.name}
          childAge={child.age}
        />
      )}

      {/* Rewards Modal */}
      {childId && child && (
        <RewardDisplay
          open={showRewards}
          onOpenChange={setShowRewards}
          childId={childId}
          childName={child.name}
        />
      )}

      {/* Sensory Settings Panel */}
      <SensorySettingsPanel
        open={showSensorySettings}
        onOpenChange={setShowSensorySettings}
      />

      {/* Daily Schedule Builder */}
      {childId && child && (
        <DailyScheduleBuilder
          open={showSchedule}
          onOpenChange={setShowSchedule}
          childId={childId}
          childName={child.name}
        />
      )}

      {/* Social Skills Training */}
      {childId && (
        <SocialSkillsTraining
          open={showSocialSkills}
          onOpenChange={setShowSocialSkills}
          childId={childId}
        />
      )}
    </div>
  );
}
