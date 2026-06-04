import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mascot } from '@/components/Mascot';
import { ChildAvatar } from '@/components/ChildAvatar';
import { GameHubCategory } from '@/components/GameHubCategory';
import { MiniGameCard } from '@/components/MiniGameCard';
import { PlayerStatsModal } from '@/components/PlayerStatsModal';
import { useToast } from '@/hooks/use-toast';
import { useGameStats } from '@/hooks/useGameStats';
import {
  ArrowLeft, Star, BarChart3,
  Clock, Cloud, Hash, Type, Brain, Grid3X3,
  Smile, Music, Palette, Apple, PawPrint, User
} from 'lucide-react';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
}

export default function GameHub() {
  const { childId } = useParams<{ childId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getChildStats } = useGameStats();

  const [child, setChild] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [gameProgress, setGameProgress] = useState<Record<string, number>>({});

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
        <Mascot size="xl" />
      </div>
    );
  }

  if (!child) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-mint via-background to-pastel-sky overflow-hidden page-enter">
      {/* Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-5xl opacity-15 float-animation gpu-accelerated">⭐</div>
        <div className="absolute top-32 right-8 text-4xl opacity-15 float-animation gpu-accelerated" style={{ animationDelay: '0.5s' }}>🎮</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-15 float-animation gpu-accelerated" style={{ animationDelay: '1s' }}>🏆</div>
        <div className="absolute bottom-16 right-16 text-5xl opacity-15 float-animation gpu-accelerated" style={{ animationDelay: '1.5s' }}>🎯</div>
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

        <Button
          variant="outline"
          onClick={() => setShowStats(true)}
          className="gap-2 rounded-full gpu-accelerated"
        >
          <BarChart3 className="w-5 h-5" />
          Stats
        </Button>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pb-12">
        {/* Hero greeting */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-4 mb-3 slide-up">
            <ChildAvatar avatar={child.avatar} size="lg" />
            <Mascot size="lg" waving />
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1 slide-up" style={{ animationDelay: '0.1s' }}>
            Hello, {child.name}! 👋
          </h1>
          <p className="text-lg text-muted-foreground slide-up" style={{ animationDelay: '0.15s' }}>
            Choose a game and start learning!
          </p>

          {/* XP Badge */}
          <div className="mt-3 inline-flex items-center gap-2 bg-duo-yellow/20 px-4 py-1.5 rounded-full slide-up gpu-accelerated" style={{ animationDelay: '0.2s' }}>
            <Star className="w-4 h-4 text-duo-yellow fill-duo-yellow" />
            <span className="font-bold text-foreground text-sm">{totalXP} XP</span>
          </div>
        </div>

        {/* Game Categories */}
        <div className="stagger-children">
          {/* Everyday Basics */}
          <GameHubCategory
            title="Everyday Basics"
            icon={<Clock className="w-5 h-5" />}
            color="bg-duo-blue"
          >
            <MiniGameCard
              title="Set the Clock"
              emoji="🕐"
              color="blue"
              onClick={() => navigate(`/games/clock/${childId}`)}
              progress={gameProgress.clock || 0}
            />
            <MiniGameCard
              title="Learn Weather"
              emoji="🌤️"
              color="teal"
              onClick={() => navigate(`/games/weather/${childId}`)}
              progress={gameProgress.weather || 0}
            />
            <MiniGameCard
              title="Fruits & Veggies"
              emoji="🍎"
              color="green"
              onClick={() => navigate(`/games/fruits/${childId}`)}
              progress={gameProgress.fruits || 0}
            />
          </GameHubCategory>

          {/* Numbers in Action */}
          <GameHubCategory
            title="Numbers in Action"
            icon={<Hash className="w-5 h-5" />}
            color="bg-duo-orange"
          >
            <MiniGameCard
              title="Match Numbers"
              emoji="🔢"
              color="orange"
              onClick={() => navigate(`/games/numbers/${childId}`)}
              progress={gameProgress.numbers || 0}
            />
            <MiniGameCard
              title="Count Along"
              emoji="🧮"
              color="yellow"
              onClick={() => navigate(`/games/counting/${childId}`)}
              progress={gameProgress.counting || 0}
            />
            <MiniGameCard
              title="Compare Items"
              emoji="⚖️"
              color="orange"
              onClick={() => navigate(`/games/comparing/${childId}`)}
              progress={gameProgress.comparing || 0}
            />
          </GameHubCategory>

          {/* Word Station */}
          <GameHubCategory
            title="Word Station"
            icon={<Type className="w-5 h-5" />}
            color="bg-duo-purple"
          >
            <MiniGameCard
              title="Alphabet"
              emoji="🔤"
              color="purple"
              onClick={() => navigate(`/games/alphabet/${childId}`)}
              progress={gameProgress.alphabet || 0}
            />
            <MiniGameCard
              title="Vowels A-E-I-O-U"
              emoji="🅰️"
              color="pink"
              onClick={() => navigate(`/games/vowels/${childId}`)}
              progress={gameProgress.vowels || 0}
            />
            <MiniGameCard
              title="Vowel or Consonant"
              emoji="📝"
              color="teal"
              onClick={() => navigate(`/games/consonants/${childId}`)}
              progress={gameProgress.consonants || 0}
            />
            <MiniGameCard
              title="Draw Letters"
              emoji="✏️"
              color="purple"
              onClick={() => navigate(`/games/letters/${childId}`)}
              progress={gameProgress.letters || 0}
            />
          </GameHubCategory>

          {/* Life Skills */}
          <GameHubCategory
            title="Life Skills"
            icon={<Apple className="w-5 h-5" />}
            color="bg-duo-orange"
          >
            <MiniGameCard
              title="Kitchen Items"
              emoji="👨‍🍳"
              color="orange"
              onClick={() => navigate(`/games/kitchen/${childId}`)}
              progress={gameProgress.kitchen || 0}
            />
            <MiniGameCard
              title="Home Tools"
              emoji="🔧"
              color="blue"
              onClick={() => navigate(`/games/hometools/${childId}`)}
              progress={gameProgress.hometools || 0}
            />
            <MiniGameCard
              title="Learn Colors"
              emoji="🎨"
              color="pink"
              onClick={() => navigate(`/games/colors/${childId}`)}
              progress={gameProgress.colors || 0}
            />
            <MiniGameCard
              title="Match Shapes"
              emoji="🔷"
              color="purple"
              onClick={() => navigate(`/games/shapes/${childId}`)}
              progress={gameProgress.shapes || 0}
            />
          </GameHubCategory>

          {/* Sensory & Memory */}
          <GameHubCategory
            title="Sensory & Memory"
            icon={<Brain className="w-5 h-5" />}
            color="bg-duo-pink"
          >
            <MiniGameCard
              title="Learn Emotions"
              emoji="😊"
              color="pink"
              onClick={() => navigate(`/games/emotions/${childId}`)}
              progress={gameProgress.emotions || 0}
            />
            <MiniGameCard
              title="Memory Cards"
              emoji="🃏"
              color="teal"
              onClick={() => navigate(`/games/memory/${childId}`)}
              progress={gameProgress.memory || 0}
            />
            <MiniGameCard
              title="Sort Items"
              emoji="📦"
              color="green"
              onClick={() => navigate(`/games/sorting/${childId}`)}
              progress={gameProgress.sorting || 0}
            />
          </GameHubCategory>

          {/* World Around Us */}
          <GameHubCategory
            title="World Around Us"
            icon={<PawPrint className="w-5 h-5" />}
            color="bg-duo-green"
          >
            <MiniGameCard
              title="Animals"
              emoji="🦁"
              color="green"
              onClick={() => navigate(`/games/animals/${childId}`)}
              progress={gameProgress.animals || 0}
            />
            <MiniGameCard
              title="Body Parts"
              emoji="🧍"
              color="orange"
              onClick={() => navigate(`/games/bodyparts/${childId}`)}
              progress={gameProgress.bodyparts || 0}
            />
            <MiniGameCard
              title="Music & Instruments"
              emoji="🎵"
              color="pink"
              onClick={() => navigate(`/games/music/${childId}`)}
              progress={gameProgress.music || 0}
            />
          </GameHubCategory>
        </div>

        {/* Mascot encouragement */}
        <div className="mt-8 flex justify-center slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-card gpu-accelerated">
            <Mascot size="sm" />
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
    </div>
  );
}
