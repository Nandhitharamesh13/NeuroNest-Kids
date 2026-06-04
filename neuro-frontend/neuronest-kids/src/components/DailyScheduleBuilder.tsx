 import { useState, useEffect } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Checkbox } from '@/components/ui/checkbox';
 import { useToast } from '@/hooks/use-toast';
 import { 
   Plus,
   Trash2,
   Clock,
   Check,
   Star,
   Calendar,
   GripVertical,
   Bell,
   Volume2
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface ScheduleTask {
   id: string;
   title: string;
   emoji: string;
   time: string;
   completed: boolean;
   order: number;
 }
 
 interface DailyScheduleBuilderProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   childId?: string;
   childName?: string;
 }
 
 const DEFAULT_TASKS: ScheduleTask[] = [
   { id: '1', title: 'Wake Up & Stretch', emoji: '🌅', time: '07:00', completed: false, order: 0 },
   { id: '2', title: 'Brush Teeth', emoji: '🪥', time: '07:15', completed: false, order: 1 },
   { id: '3', title: 'Eat Breakfast', emoji: '🥣', time: '07:30', completed: false, order: 2 },
   { id: '4', title: 'Get Dressed', emoji: '👕', time: '08:00', completed: false, order: 3 },
   { id: '5', title: 'Learning Time', emoji: '📚', time: '09:00', completed: false, order: 4 },
   { id: '6', title: 'Play Games', emoji: '🎮', time: '10:00', completed: false, order: 5 },
   { id: '7', title: 'Lunch', emoji: '🍽️', time: '12:00', completed: false, order: 6 },
   { id: '8', title: 'Rest Time', emoji: '😴', time: '13:00', completed: false, order: 7 },
 ];
 
 const EMOJI_OPTIONS = ['🌅', '🪥', '🥣', '👕', '📚', '🎮', '🍽️', '😴', '🚿', '🏃', '🎨', '🎵', '🧹', '📺', '🛏️', '🌙'];
 
 export function DailyScheduleBuilder({ open, onOpenChange, childId, childName }: DailyScheduleBuilderProps) {
   const { toast } = useToast();
   const [tasks, setTasks] = useState<ScheduleTask[]>([]);
   const [newTaskTitle, setNewTaskTitle] = useState('');
   const [newTaskTime, setNewTaskTime] = useState('09:00');
   const [newTaskEmoji, setNewTaskEmoji] = useState('📚');
   const [showAddForm, setShowAddForm] = useState(false);
   const [completedCount, setCompletedCount] = useState(0);
 
   useEffect(() => {
     if (open && childId) {
       const stored = localStorage.getItem(`neuronest-schedule-${childId}`);
       if (stored) {
         try {
           setTasks(JSON.parse(stored));
         } catch {
           setTasks(DEFAULT_TASKS);
         }
       } else {
         setTasks(DEFAULT_TASKS);
       }
     }
   }, [open, childId]);
 
   useEffect(() => {
     setCompletedCount(tasks.filter(t => t.completed).length);
   }, [tasks]);
 
   const saveTasks = (newTasks: ScheduleTask[]) => {
     if (childId) {
       localStorage.setItem(`neuronest-schedule-${childId}`, JSON.stringify(newTasks));
     }
     setTasks(newTasks);
   };
 
   const toggleTask = (taskId: string) => {
     const newTasks = tasks.map(t => 
       t.id === taskId ? { ...t, completed: !t.completed } : t
     );
     saveTasks(newTasks);
     
     const task = tasks.find(t => t.id === taskId);
     if (task && !task.completed) {
       toast({
         title: `Great job! ${task.emoji}`,
         description: `"${task.title}" completed!`,
       });
     }
   };
 
   const addTask = () => {
     if (!newTaskTitle.trim()) return;
     
     const newTask: ScheduleTask = {
       id: Date.now().toString(),
       title: newTaskTitle.trim(),
       emoji: newTaskEmoji,
       time: newTaskTime,
       completed: false,
       order: tasks.length,
     };
     
     saveTasks([...tasks, newTask].sort((a, b) => a.time.localeCompare(b.time)));
     setNewTaskTitle('');
     setShowAddForm(false);
     
     toast({
       title: 'Task Added!',
       description: `"${newTask.title}" has been added to the schedule.`,
     });
   };
 
   const deleteTask = (taskId: string) => {
     saveTasks(tasks.filter(t => t.id !== taskId));
   };
 
   const resetDay = () => {
     const resetTasks = tasks.map(t => ({ ...t, completed: false }));
     saveTasks(resetTasks);
     toast({
       title: 'Schedule Reset',
       description: 'All tasks have been reset for a new day!',
     });
   };
 
   const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-lg rounded-3xl max-h-[90vh] overflow-hidden flex flex-col">
         <DialogHeader>
           <DialogTitle className="font-display text-2xl flex items-center gap-2">
             <Calendar className="w-6 h-6 text-duo-blue" />
             {childName ? `${childName}'s Daily Schedule` : 'Daily Schedule'}
           </DialogTitle>
           <DialogDescription>
             Visual routine builder with task completion rewards
           </DialogDescription>
         </DialogHeader>
 
         {/* Progress Bar */}
         <div className="px-1">
           <div className="flex justify-between text-sm mb-2">
             <span className="text-muted-foreground">Today's Progress</span>
             <span className="font-bold text-duo-green">{completedCount}/{tasks.length} tasks</span>
           </div>
           <div className="h-4 bg-muted rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-duo-green to-duo-teal rounded-full transition-all duration-500"
               style={{ width: `${progress}%` }}
             />
           </div>
           {progress >= 100 && (
             <div className="mt-2 text-center p-3 bg-duo-yellow/20 rounded-xl">
               <span className="text-2xl mr-2">🌟</span>
               <span className="font-bold text-duo-yellow">All tasks complete! Amazing!</span>
             </div>
           )}
         </div>
 
         {/* Task List */}
         <div className="flex-1 overflow-y-auto space-y-2 py-4">
           {tasks.sort((a, b) => a.time.localeCompare(b.time)).map((task) => (
             <div
               key={task.id}
               className={cn(
                 "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                 task.completed
                   ? "bg-duo-green/10 border-duo-green/30"
                   : "bg-card border-transparent hover:border-muted"
               )}
             >
               <button
                 onClick={() => toggleTask(task.id)}
                 className={cn(
                   "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                   task.completed
                     ? "bg-duo-green border-duo-green text-white"
                     : "border-muted-foreground/30 hover:border-duo-green"
                 )}
               >
                 {task.completed && <Check className="w-5 h-5" />}
               </button>
               
               <span className="text-2xl">{task.emoji}</span>
               
               <div className="flex-1">
                 <p className={cn(
                   "font-medium transition-all",
                   task.completed && "line-through text-muted-foreground"
                 )}>
                   {task.title}
                 </p>
                 <p className="text-xs text-muted-foreground flex items-center gap-1">
                   <Clock className="w-3 h-3" />
                   {task.time}
                 </p>
               </div>
               
               {task.completed && <Star className="w-5 h-5 text-duo-yellow fill-duo-yellow" />}
               
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => deleteTask(task.id)}
                 className="h-8 w-8 text-muted-foreground hover:text-red-500"
               >
                 <Trash2 className="w-4 h-4" />
               </Button>
             </div>
           ))}
 
           {/* Add Task Form */}
           {showAddForm ? (
             <div className="p-4 rounded-2xl border-2 border-dashed border-duo-blue/50 bg-duo-blue/5 space-y-4">
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <Label className="text-xs">Task Name</Label>
                   <Input
                     value={newTaskTitle}
                     onChange={(e) => setNewTaskTitle(e.target.value)}
                     placeholder="e.g., Brush teeth"
                     className="rounded-xl"
                   />
                 </div>
                 <div>
                   <Label className="text-xs">Time</Label>
                   <Input
                     type="time"
                     value={newTaskTime}
                     onChange={(e) => setNewTaskTime(e.target.value)}
                     className="rounded-xl"
                   />
                 </div>
               </div>
               
               <div>
                 <Label className="text-xs">Choose Emoji</Label>
                 <div className="flex flex-wrap gap-2 mt-1">
                   {EMOJI_OPTIONS.map((emoji) => (
                     <button
                       key={emoji}
                       onClick={() => setNewTaskEmoji(emoji)}
                       className={cn(
                         "w-10 h-10 rounded-xl text-xl transition-all",
                         newTaskEmoji === emoji
                           ? "bg-duo-blue/20 scale-110"
                           : "bg-muted hover:bg-muted/80"
                       )}
                     >
                       {emoji}
                     </button>
                   ))}
                 </div>
               </div>
               
               <div className="flex gap-2">
                 <Button
                   variant="outline"
                   onClick={() => setShowAddForm(false)}
                   className="flex-1"
                 >
                   Cancel
                 </Button>
                 <Button
                   onClick={addTask}
                   className="flex-1 bg-duo-blue hover:bg-duo-blue/90"
                 >
                   Add Task
                 </Button>
               </div>
             </div>
           ) : (
             <button
               onClick={() => setShowAddForm(true)}
               className="w-full p-4 rounded-2xl border-2 border-dashed border-muted-foreground/30 hover:border-duo-blue flex items-center justify-center gap-2 text-muted-foreground hover:text-duo-blue transition-all"
             >
               <Plus className="w-5 h-5" />
               Add New Task
             </button>
           )}
         </div>
 
         {/* Footer Actions */}
         <div className="flex gap-3 pt-4 border-t">
           <Button
             variant="outline"
             onClick={resetDay}
             className="flex-1 gap-2"
           >
             <Bell className="w-4 h-4" />
             Reset Day
           </Button>
           <Button
             onClick={() => onOpenChange(false)}
             className="flex-1 gap-2 bg-duo-green hover:bg-duo-green/90"
           >
             <Check className="w-4 h-4" />
             Done
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   );
 }