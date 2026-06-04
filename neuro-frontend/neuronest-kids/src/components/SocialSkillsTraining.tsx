 import { useState, useEffect } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import { useToast } from '@/hooks/use-toast';
 import { 
   Users,
   MessageCircle,
   Heart,
   Star,
   ArrowRight,
   ArrowLeft,
   RotateCcw,
   CheckCircle2,
   XCircle
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface SocialStory {
   id: string;
   title: string;
   emoji: string;
   category: 'greeting' | 'sharing' | 'school' | 'emotions';
   slides: {
     image: string;
     text: string;
   }[];
 }
 
 interface SituationScenario {
   id: string;
   situation: string;
   emoji: string;
   options: {
     text: string;
     isCorrect: boolean;
     feedback: string;
   }[];
 }
 
 interface SocialSkillsTrainingProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   childId?: string;
 }
 
 const SOCIAL_STORIES: SocialStory[] = [
   {
     id: 'greeting',
     title: 'Saying Hello',
     emoji: '👋',
     category: 'greeting',
     slides: [
       { image: '👋', text: 'When I see someone I know, I can wave and say "Hello!"' },
       { image: '😊', text: 'I look at their face and smile. This shows I am friendly.' },
       { image: '🗣️', text: 'I can say "How are you?" This is a nice thing to ask.' },
       { image: '👂', text: 'Then I listen to what they say. Listening is important.' },
       { image: '🌟', text: 'Great job! Saying hello makes people feel happy!' },
     ],
   },
   {
     id: 'sharing',
     title: 'Sharing with Friends',
     emoji: '🤝',
     category: 'sharing',
     slides: [
       { image: '🧸', text: 'I have toys and things I like to play with.' },
       { image: '👫', text: 'Sometimes my friend wants to play with my toy too.' },
       { image: '🤔', text: 'I can let them have a turn. This is called sharing.' },
       { image: '⏰', text: 'We can take turns. First them, then me, then them again.' },
       { image: '💫', text: 'Sharing makes playing together more fun for everyone!' },
     ],
   },
   {
     id: 'school',
     title: 'Raising My Hand',
     emoji: '✋',
     category: 'school',
     slides: [
       { image: '🏫', text: 'When I am in class, the teacher asks questions.' },
       { image: '💭', text: 'When I know the answer, I want to say it!' },
       { image: '✋', text: 'First, I raise my hand quietly and wait.' },
       { image: '👀', text: 'I look at the teacher and wait for them to call my name.' },
       { image: '⭐', text: 'When they say my name, I can share my answer. Good job!' },
     ],
   },
   {
     id: 'feelings',
     title: 'Feeling Frustrated',
     emoji: '😤',
     category: 'emotions',
     slides: [
       { image: '😤', text: 'Sometimes things don\'t go the way I want. I might feel frustrated.' },
       { image: '🫁', text: 'I can take deep breaths. Breathe in... breathe out...' },
       { image: '🧘', text: 'I can count to 5 slowly. 1... 2... 3... 4... 5...' },
       { image: '🗣️', text: 'I can tell someone how I feel using words.' },
       { image: '💪', text: 'After calming down, I can try again. I am strong!' },
     ],
   },
 ];
 
 const SITUATION_SCENARIOS: SituationScenario[] = [
   {
     id: 's1',
     situation: 'A classmate drops their pencil. What should you do?',
     emoji: '✏️',
     options: [
       { text: 'Pick it up and give it to them', isCorrect: true, feedback: 'Great! Helping others is very kind! 🌟' },
       { text: 'Ignore it', isCorrect: false, feedback: 'It\'s nice to help when we can. Try again!' },
       { text: 'Laugh at them', isCorrect: false, feedback: 'That might hurt their feelings. Try a kinder choice!' },
     ],
   },
   {
     id: 's2',
     situation: 'Someone says "Hi" to you. What should you do?',
     emoji: '👋',
     options: [
       { text: 'Look away and say nothing', isCorrect: false, feedback: 'It\'s polite to respond when someone greets you!' },
       { text: 'Say "Hi" back and smile', isCorrect: true, feedback: 'Perfect! Greeting people is friendly! 😊' },
       { text: 'Run away', isCorrect: false, feedback: 'That might confuse them. Try saying hi back!' },
     ],
   },
   {
     id: 's3',
     situation: 'You want to join other kids playing. What should you do?',
     emoji: '🎮',
     options: [
       { text: 'Ask "Can I play too?"', isCorrect: true, feedback: 'Asking nicely is the best way! Good job! 🎉' },
       { text: 'Just take their toys', isCorrect: false, feedback: 'That might make them upset. Try asking first!' },
       { text: 'Push them away', isCorrect: false, feedback: 'Pushing is not nice. Use your words instead!' },
     ],
   },
   {
     id: 's4',
     situation: 'You accidentally bump into someone. What should you do?',
     emoji: '😯',
     options: [
       { text: 'Keep walking', isCorrect: false, feedback: 'It\'s polite to say sorry when we bump into someone!' },
       { text: 'Blame them', isCorrect: false, feedback: 'Even if it was an accident, it\'s kind to apologize!' },
       { text: 'Say "I\'m sorry!"', isCorrect: true, feedback: 'That\'s right! Saying sorry shows you care! ❤️' },
     ],
   },
   {
     id: 's5',
     situation: 'Your friend looks sad. What should you do?',
     emoji: '😢',
     options: [
       { text: 'Ask "Are you okay?"', isCorrect: true, feedback: 'Wonderful! Checking on friends shows you care! 💕' },
       { text: 'Ignore them', isCorrect: false, feedback: 'Friends help each other. Try showing you care!' },
       { text: 'Make fun of them', isCorrect: false, feedback: 'That would make them feel worse. Be kind!' },
     ],
   },
 ];
 
 export function SocialSkillsTraining({ open, onOpenChange, childId }: SocialSkillsTrainingProps) {
   const { toast } = useToast();
   const [mode, setMode] = useState<'menu' | 'stories' | 'situations'>('menu');
   const [selectedStory, setSelectedStory] = useState<SocialStory | null>(null);
   const [currentSlide, setCurrentSlide] = useState(0);
   const [currentScenario, setCurrentScenario] = useState(0);
   const [selectedOption, setSelectedOption] = useState<number | null>(null);
   const [scenarioScore, setScenarioScore] = useState(0);
   const [showResult, setShowResult] = useState(false);
 
   const resetToMenu = () => {
     setMode('menu');
     setSelectedStory(null);
     setCurrentSlide(0);
     setCurrentScenario(0);
     setSelectedOption(null);
     setScenarioScore(0);
     setShowResult(false);
   };
 
   const startStory = (story: SocialStory) => {
     setSelectedStory(story);
     setCurrentSlide(0);
     setMode('stories');
   };
 
   const nextSlide = () => {
     if (selectedStory && currentSlide < selectedStory.slides.length - 1) {
       setCurrentSlide(prev => prev + 1);
     }
   };
 
   const prevSlide = () => {
     if (currentSlide > 0) {
       setCurrentSlide(prev => prev - 1);
     }
   };
 
   const handleOptionSelect = (optionIndex: number) => {
     setSelectedOption(optionIndex);
     const scenario = SITUATION_SCENARIOS[currentScenario];
     if (scenario.options[optionIndex].isCorrect) {
       setScenarioScore(prev => prev + 1);
     }
     
     setTimeout(() => {
       if (currentScenario < SITUATION_SCENARIOS.length - 1) {
         setCurrentScenario(prev => prev + 1);
         setSelectedOption(null);
       } else {
         setShowResult(true);
       }
     }, 2000);
   };
 
   // Story View
   if (mode === 'stories' && selectedStory) {
     const slide = selectedStory.slides[currentSlide];
     const isLastSlide = currentSlide === selectedStory.slides.length - 1;
 
     return (
       <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-lg rounded-3xl">
           <DialogHeader>
             <DialogTitle className="font-display text-xl flex items-center gap-2">
               <span className="text-2xl">{selectedStory.emoji}</span>
               {selectedStory.title}
             </DialogTitle>
           </DialogHeader>
 
           <div className="space-y-6">
             {/* Progress */}
             <Progress 
               value={((currentSlide + 1) / selectedStory.slides.length) * 100} 
               className="h-2"
             />
 
             {/* Story Content */}
             <div className="text-center py-8">
               <div className="text-8xl mb-6 animate-bounce">{slide.image}</div>
               <p className="text-xl font-medium leading-relaxed">{slide.text}</p>
             </div>
 
             {/* Navigation */}
             <div className="flex gap-3">
               {currentSlide > 0 ? (
                 <Button
                   variant="outline"
                   onClick={prevSlide}
                   className="flex-1 gap-2"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   Back
                 </Button>
               ) : (
                 <Button
                   variant="outline"
                   onClick={resetToMenu}
                   className="flex-1 gap-2"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   Menu
                 </Button>
               )}
               
               {isLastSlide ? (
                 <Button
                   onClick={resetToMenu}
                   className="flex-1 gap-2 bg-duo-green hover:bg-duo-green/90"
                 >
                   <Star className="w-4 h-4" />
                   Done!
                 </Button>
               ) : (
                 <Button
                   onClick={nextSlide}
                   className="flex-1 gap-2 bg-duo-blue hover:bg-duo-blue/90"
                 >
                   Next
                   <ArrowRight className="w-4 h-4" />
                 </Button>
               )}
             </div>
           </div>
         </DialogContent>
       </Dialog>
     );
   }
 
   // Situations View
   if (mode === 'situations') {
     if (showResult) {
       const percentage = Math.round((scenarioScore / SITUATION_SCENARIOS.length) * 100);
       return (
         <Dialog open={open} onOpenChange={onOpenChange}>
           <DialogContent className="sm:max-w-md rounded-3xl text-center">
             <div className="py-8 space-y-6">
               <div className="text-7xl">
                 {percentage >= 80 ? '🌟' : percentage >= 60 ? '⭐' : '💪'}
               </div>
               <h2 className="font-display text-2xl font-bold">
                 {percentage >= 80 ? 'Amazing!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
               </h2>
               <p className="text-muted-foreground">
                 You got {scenarioScore} out of {SITUATION_SCENARIOS.length} correct!
               </p>
               <div className="flex gap-3">
                 <Button
                   variant="outline"
                   onClick={resetToMenu}
                   className="flex-1"
                 >
                   Menu
                 </Button>
                 <Button
                   onClick={() => {
                     setCurrentScenario(0);
                     setSelectedOption(null);
                     setScenarioScore(0);
                     setShowResult(false);
                   }}
                   className="flex-1 gap-2 bg-duo-purple hover:bg-duo-purple/90"
                 >
                   <RotateCcw className="w-4 h-4" />
                   Try Again
                 </Button>
               </div>
             </div>
           </DialogContent>
         </Dialog>
       );
     }
 
     const scenario = SITUATION_SCENARIOS[currentScenario];
     
     return (
       <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-lg rounded-3xl">
           <DialogHeader>
             <DialogTitle className="font-display text-xl flex items-center gap-2">
               <MessageCircle className="w-5 h-5 text-duo-purple" />
               What Should I Do?
             </DialogTitle>
           </DialogHeader>
 
           <div className="space-y-6">
             {/* Progress */}
             <div className="flex justify-between text-sm text-muted-foreground">
               <span>Question {currentScenario + 1} of {SITUATION_SCENARIOS.length}</span>
               <span className="font-bold text-duo-green">{scenarioScore} correct</span>
             </div>
 
             {/* Scenario */}
             <div className="text-center py-6 bg-muted/30 rounded-2xl">
               <div className="text-5xl mb-4">{scenario.emoji}</div>
               <p className="text-lg font-medium px-4">{scenario.situation}</p>
             </div>
 
             {/* Options */}
             <div className="space-y-3">
               {scenario.options.map((option, index) => (
                 <button
                   key={index}
                   onClick={() => selectedOption === null && handleOptionSelect(index)}
                   disabled={selectedOption !== null}
                   className={cn(
                     "w-full p-4 rounded-2xl text-left transition-all border-2",
                     selectedOption === null
                       ? "bg-card hover:bg-muted/50 border-transparent hover:border-duo-purple/50"
                       : selectedOption === index
                       ? option.isCorrect
                         ? "bg-duo-green/20 border-duo-green"
                         : "bg-red-100 border-red-400"
                       : option.isCorrect && selectedOption !== null
                       ? "bg-duo-green/10 border-duo-green/50"
                       : "opacity-50 border-transparent"
                   )}
                 >
                   <div className="flex items-center gap-3">
                     <div className={cn(
                       "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                       selectedOption === index
                         ? option.isCorrect
                           ? "bg-duo-green text-white"
                           : "bg-red-500 text-white"
                         : "bg-muted"
                     )}>
                       {selectedOption === index ? (
                         option.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />
                       ) : (
                         String.fromCharCode(65 + index)
                       )}
                     </div>
                     <span className="font-medium">{option.text}</span>
                   </div>
                   {selectedOption === index && (
                     <p className="mt-2 text-sm pl-11">{option.feedback}</p>
                   )}
                 </button>
               ))}
             </div>
           </div>
         </DialogContent>
       </Dialog>
     );
   }
 
   // Main Menu
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-lg rounded-3xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle className="font-display text-2xl flex items-center gap-2">
             <Users className="w-6 h-6 text-duo-purple" />
             Social Skills Training
           </DialogTitle>
           <DialogDescription>
             Learn how to interact with others through stories and practice
           </DialogDescription>
         </DialogHeader>
 
         <div className="space-y-6 py-4">
           {/* Social Stories Section */}
           <div>
             <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
               <Heart className="w-4 h-4" />
               Social Stories
             </h3>
             <div className="grid grid-cols-2 gap-3">
               {SOCIAL_STORIES.map((story) => (
                 <button
                   key={story.id}
                   onClick={() => startStory(story)}
                   className="p-4 rounded-2xl bg-gradient-to-br from-duo-purple/10 to-duo-pink/10 hover:from-duo-purple/20 hover:to-duo-pink/20 border border-duo-purple/20 transition-all text-left"
                 >
                   <div className="text-3xl mb-2">{story.emoji}</div>
                   <p className="font-medium text-sm">{story.title}</p>
                 </button>
               ))}
             </div>
           </div>
 
           {/* Situation Training */}
           <div>
             <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
               <MessageCircle className="w-4 h-4" />
               Situation Training
             </h3>
             <button
               onClick={() => {
                 setMode('situations');
                 setCurrentScenario(0);
                 setSelectedOption(null);
                 setScenarioScore(0);
                 setShowResult(false);
               }}
               className="w-full p-5 rounded-2xl bg-gradient-to-r from-duo-orange/10 to-duo-yellow/10 hover:from-duo-orange/20 hover:to-duo-yellow/20 border border-duo-orange/20 transition-all"
             >
               <div className="flex items-center gap-4">
                 <div className="text-4xl">🤔</div>
                 <div className="text-left">
                   <p className="font-bold text-lg">What Should I Do?</p>
                   <p className="text-sm text-muted-foreground">{SITUATION_SCENARIOS.length} real-life situations to practice</p>
                 </div>
                 <ArrowRight className="w-5 h-5 text-duo-orange ml-auto" />
               </div>
             </button>
           </div>
 
           {/* Close Button */}
           <Button
             variant="outline"
             onClick={() => onOpenChange(false)}
             className="w-full"
           >
             Close
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   );
 }