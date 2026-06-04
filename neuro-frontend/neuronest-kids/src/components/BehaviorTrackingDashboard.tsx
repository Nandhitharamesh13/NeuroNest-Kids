 import { useState, useEffect } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { supabase } from '@/integrations/supabase/client';
 import { ChildAvatar } from './ChildAvatar';
 import { 
   Brain,
   TrendingUp,
   TrendingDown,
   Clock,
   Zap,
   Heart,
   Target,
   AlertTriangle,
   CheckCircle2,
   Calendar,
   Activity
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface ChildProfile {
   id: string;
   name: string;
   age: number;
   avatar: string;
 }
 
 interface BehaviorProfile {
   attention_span_minutes: number;
   average_accuracy: number;
   average_response_time_seconds: number;
   frustration_threshold: number;
   current_difficulty_level: number;
   preferred_pace: string;
   best_time_of_day: string;
   prefers_sounds: boolean;
   prefers_animations: boolean;
   strong_categories: string[];
   challenging_categories: string[];
   ai_insights: Record<string, any>;
   last_ai_analysis: string;
 }
 
 interface BehaviorTrackingDashboardProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   children: ChildProfile[];
 }
 
 export function BehaviorTrackingDashboard({ open, onOpenChange, children }: BehaviorTrackingDashboardProps) {
   const [profiles, setProfiles] = useState<Record<string, BehaviorProfile>>({});
   const [loading, setLoading] = useState(true);
   const [selectedChild, setSelectedChild] = useState<string>(children[0]?.id || '');
 
   useEffect(() => {
     if (open && children.length > 0) {
       fetchProfiles();
       if (!selectedChild && children[0]) {
         setSelectedChild(children[0].id);
       }
     }
   }, [open, children]);
 
   const fetchProfiles = async () => {
     setLoading(true);
     const newProfiles: Record<string, BehaviorProfile> = {};
 
     for (const child of children) {
       const { data } = await supabase
         .from('child_behavior_profiles')
         .select('*')
         .eq('child_id', child.id)
         .single();
 
       if (data) {
         newProfiles[child.id] = {
           attention_span_minutes: data.attention_span_minutes || 10,
           average_accuracy: data.average_accuracy || 0,
           average_response_time_seconds: data.average_response_time_seconds || 0,
           frustration_threshold: data.frustration_threshold || 3,
           current_difficulty_level: data.current_difficulty_level || 1,
           preferred_pace: data.preferred_pace || 'normal',
           best_time_of_day: data.best_time_of_day || 'morning',
           prefers_sounds: data.prefers_sounds ?? true,
           prefers_animations: data.prefers_animations ?? true,
           strong_categories: (data.strong_categories as string[]) || [],
           challenging_categories: (data.challenging_categories as string[]) || [],
           ai_insights: (data.ai_insights as Record<string, any>) || {},
           last_ai_analysis: data.last_ai_analysis || '',
         };
       }
     }
 
     setProfiles(newProfiles);
     setLoading(false);
   };
 
   const selectedProfile = profiles[selectedChild];
   const selectedChildData = children.find(c => c.id === selectedChild);
 
   const getPaceLabel = (pace: string) => {
     switch (pace) {
       case 'slow': return '🐢 Slow & Steady';
       case 'normal': return '🚶 Normal';
       case 'fast': return '🏃 Fast Learner';
       default: return pace;
     }
   };
 
   const getTimeLabel = (time: string) => {
     switch (time) {
       case 'morning': return '🌅 Morning';
       case 'afternoon': return '☀️ Afternoon';
       case 'evening': return '🌙 Evening';
       default: return time;
     }
   };
 
   const getDifficultyColor = (level: number) => {
     if (level <= 2) return 'text-duo-green';
     if (level <= 4) return 'text-duo-orange';
     return 'text-duo-purple';
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
         <DialogHeader>
           <DialogTitle className="font-display text-2xl flex items-center gap-2">
             <Brain className="w-6 h-6 text-duo-purple" />
             Behavior Tracking Dashboard
           </DialogTitle>
           <DialogDescription>
             AI-powered insights into your child's learning behavior and patterns
           </DialogDescription>
         </DialogHeader>
 
         {loading ? (
           <div className="flex items-center justify-center py-12">
             <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
           </div>
         ) : children.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground">
             <p>No children profiles found. Add a child to start tracking!</p>
           </div>
         ) : (
           <div className="space-y-6">
             {/* Child Selector */}
             {children.length > 1 && (
               <div className="flex gap-2 overflow-x-auto pb-2">
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
 
             {selectedProfile && selectedChildData ? (
               <Tabs defaultValue="overview" className="w-full">
                 <TabsList className="grid w-full grid-cols-3">
                   <TabsTrigger value="overview">Overview</TabsTrigger>
                   <TabsTrigger value="preferences">Preferences</TabsTrigger>
                   <TabsTrigger value="insights">AI Insights</TabsTrigger>
                 </TabsList>
 
                 <TabsContent value="overview" className="space-y-4 mt-4">
                   {/* Quick Stats */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     <div className="bg-duo-green/10 rounded-xl p-4 text-center">
                       <Target className="w-6 h-6 mx-auto mb-2 text-duo-green" />
                       <p className="text-2xl font-bold">{selectedProfile.average_accuracy}%</p>
                       <p className="text-xs text-muted-foreground">Avg Accuracy</p>
                     </div>
                     <div className="bg-duo-blue/10 rounded-xl p-4 text-center">
                       <Clock className="w-6 h-6 mx-auto mb-2 text-duo-blue" />
                       <p className="text-2xl font-bold">{selectedProfile.attention_span_minutes}m</p>
                       <p className="text-xs text-muted-foreground">Attention Span</p>
                     </div>
                     <div className="bg-duo-purple/10 rounded-xl p-4 text-center">
                       <Zap className="w-6 h-6 mx-auto mb-2 text-duo-purple" />
                       <p className={cn('text-2xl font-bold', getDifficultyColor(selectedProfile.current_difficulty_level))}>
                         Level {selectedProfile.current_difficulty_level}
                       </p>
                       <p className="text-xs text-muted-foreground">Difficulty</p>
                     </div>
                     <div className="bg-duo-orange/10 rounded-xl p-4 text-center">
                       <Activity className="w-6 h-6 mx-auto mb-2 text-duo-orange" />
                       <p className="text-2xl font-bold">{selectedProfile.average_response_time_seconds}s</p>
                       <p className="text-xs text-muted-foreground">Avg Response</p>
                     </div>
                   </div>
 
                   {/* Strengths & Challenges */}
                   <div className="grid md:grid-cols-2 gap-4">
                     <div className="bg-duo-green/10 rounded-xl p-4">
                       <h4 className="font-semibold flex items-center gap-2 mb-3 text-duo-green">
                         <CheckCircle2 className="w-5 h-5" />
                         Strong Areas
                       </h4>
                       {selectedProfile.strong_categories.length > 0 ? (
                         <div className="flex flex-wrap gap-2">
                           {selectedProfile.strong_categories.map((cat, i) => (
                             <span key={i} className="bg-duo-green/20 text-duo-green px-3 py-1 rounded-full text-sm">
                               {cat}
                             </span>
                           ))}
                         </div>
                       ) : (
                         <p className="text-sm text-muted-foreground">Building data...</p>
                       )}
                     </div>
                     
                     <div className="bg-duo-orange/10 rounded-xl p-4">
                       <h4 className="font-semibold flex items-center gap-2 mb-3 text-duo-orange">
                         <AlertTriangle className="w-5 h-5" />
                         Areas to Practice
                       </h4>
                       {selectedProfile.challenging_categories.length > 0 ? (
                         <div className="flex flex-wrap gap-2">
                           {selectedProfile.challenging_categories.map((cat, i) => (
                             <span key={i} className="bg-duo-orange/20 text-duo-orange px-3 py-1 rounded-full text-sm">
                               {cat}
                             </span>
                           ))}
                         </div>
                       ) : (
                         <p className="text-sm text-muted-foreground">Great progress!</p>
                       )}
                     </div>
                   </div>
 
                   {/* Frustration Threshold */}
                   <div className="bg-card rounded-xl p-4">
                     <h4 className="font-semibold flex items-center gap-2 mb-3">
                       <Heart className="w-5 h-5 text-duo-pink" />
                       Frustration Sensitivity
                     </h4>
                     <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span>Patience Level</span>
                         <span>{selectedProfile.frustration_threshold} consecutive errors before needing help</span>
                       </div>
                       <Progress value={(selectedProfile.frustration_threshold / 5) * 100} className="h-2" />
                       <p className="text-xs text-muted-foreground">
                         {selectedProfile.frustration_threshold <= 2 
                           ? 'Needs frequent encouragement and easier questions when struggling'
                           : selectedProfile.frustration_threshold <= 3
                           ? 'Moderate patience - benefits from timely hints'
                           : 'Good resilience - can handle more challenging sequences'}
                       </p>
                     </div>
                   </div>
                 </TabsContent>
 
                 <TabsContent value="preferences" className="space-y-4 mt-4">
                   <div className="grid md:grid-cols-2 gap-4">
                     {/* Learning Pace */}
                     <div className="bg-card rounded-xl p-4">
                       <h4 className="font-semibold mb-3">Preferred Pace</h4>
                       <p className="text-2xl">{getPaceLabel(selectedProfile.preferred_pace)}</p>
                     </div>
 
                     {/* Best Time */}
                     <div className="bg-card rounded-xl p-4">
                       <h4 className="font-semibold mb-3">Best Learning Time</h4>
                       <p className="text-2xl">{getTimeLabel(selectedProfile.best_time_of_day)}</p>
                     </div>
 
                     {/* Sensory Preferences */}
                     <div className="bg-card rounded-xl p-4">
                       <h4 className="font-semibold mb-3">Sensory Preferences</h4>
                       <div className="space-y-2">
                         <div className="flex items-center justify-between">
                           <span>Sound Effects</span>
                           <span className={selectedProfile.prefers_sounds ? 'text-duo-green' : 'text-muted-foreground'}>
                             {selectedProfile.prefers_sounds ? '✓ Enabled' : '✗ Disabled'}
                           </span>
                         </div>
                         <div className="flex items-center justify-between">
                           <span>Animations</span>
                           <span className={selectedProfile.prefers_animations ? 'text-duo-green' : 'text-muted-foreground'}>
                             {selectedProfile.prefers_animations ? '✓ Enabled' : '✗ Disabled'}
                           </span>
                         </div>
                       </div>
                     </div>
 
                     {/* Attention Span Detail */}
                     <div className="bg-card rounded-xl p-4">
                       <h4 className="font-semibold mb-3">Attention Span</h4>
                       <p className="text-2xl mb-2">{selectedProfile.attention_span_minutes} minutes</p>
                       <p className="text-xs text-muted-foreground">
                         Recommended session length for optimal engagement
                       </p>
                     </div>
                   </div>
                 </TabsContent>
 
                 <TabsContent value="insights" className="space-y-4 mt-4">
                   {selectedProfile.last_ai_analysis ? (
                     <div className="space-y-4">
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <Calendar className="w-4 h-4" />
                         Last analyzed: {new Date(selectedProfile.last_ai_analysis).toLocaleDateString()}
                       </div>
                       
                       {selectedProfile.ai_insights && Object.keys(selectedProfile.ai_insights).length > 0 ? (
                         <div className="bg-duo-purple/10 rounded-xl p-4 space-y-3">
                           {Object.entries(selectedProfile.ai_insights).map(([key, value]) => (
                             <div key={key}>
                               <h5 className="font-medium capitalize">{key.replace(/_/g, ' ')}</h5>
                               <p className="text-sm text-muted-foreground">
                                 {typeof value === 'string' ? value : JSON.stringify(value)}
                               </p>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <p className="text-muted-foreground">AI insights will appear after more gameplay data is collected.</p>
                       )}
                     </div>
                   ) : (
                     <div className="text-center py-8">
                       <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                       <p className="text-muted-foreground">
                         AI analysis pending. Keep playing games to generate insights!
                       </p>
                     </div>
                   )}
                 </TabsContent>
               </Tabs>
             ) : (
               <div className="text-center py-8">
                 <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                 <p className="text-muted-foreground">
                   No behavior data yet. Play some games to start tracking patterns!
                 </p>
               </div>
             )}
 
             <Button onClick={() => onOpenChange(false)} className="w-full">
               Close
             </Button>
           </div>
         )}
       </DialogContent>
     </Dialog>
   );
 }