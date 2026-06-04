import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FloatingGuideProvider } from "@/components/FloatingGuide";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ParentAlertsProvider } from "@/contexts/ParentAlertsContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ParentDashboard from "./pages/ParentDashboard";
import ChildDashboard from "./pages/ChildDashboard";
import ShapeMatchingGame from "./pages/games/ShapeMatchingGame";
import ColorRecognitionGame from "./pages/games/ColorRecognitionGame";
import FruitsLearningGame from "./pages/games/FruitsLearningGame";
import DragDropGame from "./pages/games/DragDropGame";
import GameHub from "./pages/GameHub";
import ClockGame from "./pages/games/ClockGame";
import WeatherGame from "./pages/games/WeatherGame";
import NumbersGame from "./pages/games/NumbersGame";
import LetterTracingGame from "./pages/games/LetterTracingGame";
import EmotionsGame from "./pages/games/EmotionsGame";
import MemoryGame from "./pages/games/MemoryGame";
import CountAlongGame from "./pages/games/CountAlongGame";
import CompareItemsGame from "./pages/games/CompareItemsGame";
import AlphabetGame from "./pages/games/AlphabetGame";
import VowelsGame from "./pages/games/VowelsGame";
import ConsonantsGame from "./pages/games/ConsonantsGame";
import KitchenGame from "./pages/games/KitchenGame";
import HomeToolsGame from "./pages/games/HomeToolsGame";
import MusicGame from "./pages/games/MusicGame";
import AnimalsGame from "./pages/games/AnimalsGame";
import BodyPartsGame from "./pages/games/BodyPartsGame";
import NotFound from "./pages/NotFound";
import Documentation from "./pages/Documentation";
import { AIDebugOverlay } from "@/components/AIDebugOverlay";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('neuronest-loaded');
    if (hasLoaded) {
      setIsLoading(false);
      setShowApp(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('neuronest-loaded', 'true');
    setIsLoading(false);
    setTimeout(() => setShowApp(true), 100);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
          
          <div className={`transition-opacity duration-500 ${showApp ? 'opacity-100' : 'opacity-0'}`}>
            <ParentAlertsProvider>
              <BrowserRouter>
                <FloatingGuideProvider>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/parent-dashboard" element={<ParentDashboard />} />
                    <Route path="/child-dashboard/:childId" element={<ChildDashboard />} />
                    <Route path="/games/shapes/:childId" element={<ShapeMatchingGame />} />
                    <Route path="/games/colors/:childId" element={<ColorRecognitionGame />} />
                    <Route path="/games/fruits/:childId" element={<FruitsLearningGame />} />
                    <Route path="/games/sorting/:childId" element={<DragDropGame />} />
                    <Route path="/game-hub/:childId" element={<GameHub />} />
                    <Route path="/games/clock/:childId" element={<ClockGame />} />
                    <Route path="/games/weather/:childId" element={<WeatherGame />} />
                    <Route path="/games/numbers/:childId" element={<NumbersGame />} />
                    <Route path="/games/letters/:childId" element={<LetterTracingGame />} />
                    <Route path="/games/emotions/:childId" element={<EmotionsGame />} />
                    <Route path="/games/memory/:childId" element={<MemoryGame />} />
                    <Route path="/games/counting/:childId" element={<CountAlongGame />} />
                    <Route path="/games/comparing/:childId" element={<CompareItemsGame />} />
                    <Route path="/games/alphabet/:childId" element={<AlphabetGame />} />
                    <Route path="/games/vowels/:childId" element={<VowelsGame />} />
                    <Route path="/games/consonants/:childId" element={<ConsonantsGame />} />
                    <Route path="/games/kitchen/:childId" element={<KitchenGame />} />
                    <Route path="/games/hometools/:childId" element={<HomeToolsGame />} />
                    <Route path="/games/music/:childId" element={<MusicGame />} />
                    <Route path="/games/animals/:childId" element={<AnimalsGame />} />
                    <Route path="/games/bodyparts/:childId" element={<BodyPartsGame />} />
                    <Route path="/documentation" element={<Documentation />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </FloatingGuideProvider>
                <AIDebugOverlay />
              </BrowserRouter>
            </ParentAlertsProvider>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
