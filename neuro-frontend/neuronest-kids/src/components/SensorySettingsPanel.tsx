 import { useState, useEffect } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import { Slider } from '@/components/ui/slider';
 import { Separator } from '@/components/ui/separator';
 import { useToast } from '@/hooks/use-toast';
 import { 
   Sun, 
   Moon, 
   Volume2, 
   VolumeX, 
   Sparkles,
   Eye,
   Zap,
   Type,
   Save,
   RotateCcw,
   Palette
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface SensorySettings {
   lowStimulusMode: boolean;
   calmingMode: boolean;
   soundEnabled: boolean;
   soundVolume: number;
   animationsEnabled: boolean;
   fontSizeScale: number;
   increasedSpacing: boolean;
   colorTheme: 'default' | 'warm' | 'cool' | 'muted';
 }
 
 interface SensorySettingsPanelProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 export function SensorySettingsPanel({ open, onOpenChange }: SensorySettingsPanelProps) {
   const { toast } = useToast();
   const [saving, setSaving] = useState(false);
   const [settings, setSettings] = useState<SensorySettings>({
     lowStimulusMode: false,
     calmingMode: false,
     soundEnabled: true,
     soundVolume: 80,
     animationsEnabled: true,
     fontSizeScale: 100,
     increasedSpacing: false,
     colorTheme: 'default',
   });
 
   useEffect(() => {
     if (open) {
       const stored = localStorage.getItem('neuronest-sensory-settings');
       if (stored) {
         try {
           setSettings(JSON.parse(stored));
         } catch {
           // Use defaults
         }
       }
     }
   }, [open]);
 
  useEffect(() => {
    const root = document.documentElement;
    
    // Low stimulus mode
    root.classList.toggle('low-stimulus', settings.lowStimulusMode);
    
    // Calming/Night mode
    root.classList.toggle('calming-mode', settings.calmingMode);
    
    // Reduced motion (from animations toggle)
    root.classList.toggle('reduce-motion', !settings.animationsEnabled);
    
    // Increased spacing
    root.classList.toggle('increased-spacing', settings.increasedSpacing);
    
    // Font size scale
    root.style.setProperty('--font-scale', `${settings.fontSizeScale / 100}`);
    
    // Sound class
    root.classList.toggle('sound-off', !settings.soundEnabled);

    // Color theme
    root.classList.remove('theme-warm', 'theme-cool', 'theme-muted');
    if (settings.colorTheme !== 'default' && !settings.calmingMode && !settings.lowStimulusMode) {
      root.classList.add(`theme-${settings.colorTheme}`);
    }
  }, [settings]);
 
   const saveSettings = async () => {
     setSaving(true);
     try {
       localStorage.setItem('neuronest-sensory-settings', JSON.stringify(settings));
       localStorage.setItem('neuronest-sound-enabled', settings.soundEnabled.toString());
       localStorage.setItem('neuronest-sound-volume', settings.soundVolume.toString());
       localStorage.setItem('neuronest-animations-enabled', settings.animationsEnabled.toString());
 
       toast({
         title: 'Settings Saved ✨',
         description: 'Your sensory preferences have been updated.',
       });
       
       onOpenChange(false);
     } catch (error) {
       toast({
         title: 'Error',
         description: 'Failed to save settings. Please try again.',
         variant: 'destructive',
       });
     } finally {
       setSaving(false);
     }
   };
 
   const resetToDefaults = () => {
     setSettings({
       lowStimulusMode: false,
       calmingMode: false,
       soundEnabled: true,
       soundVolume: 80,
       animationsEnabled: true,
       fontSizeScale: 100,
       increasedSpacing: false,
       colorTheme: 'default',
     });
   };
 
   const colorThemes = [
     { id: 'default', name: 'Bright', colors: ['#58CC02', '#1CB0F6', '#FF9600'] },
     { id: 'warm', name: 'Warm', colors: ['#E8A838', '#E07B53', '#C4A35A'] },
     { id: 'cool', name: 'Cool', colors: ['#6B93D6', '#82B3D1', '#A8C8DC'] },
     { id: 'muted', name: 'Muted', colors: ['#8B9A7D', '#9B8E7B', '#7D8B9A'] },
   ];
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-lg rounded-3xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle className="font-display text-2xl flex items-center gap-2">
             <Sparkles className="w-6 h-6 text-duo-purple" />
             Sensory-Friendly Settings
           </DialogTitle>
           <DialogDescription>
             Customize the experience to reduce sensory overload
           </DialogDescription>
         </DialogHeader>
 
         <div className="space-y-6 py-4">
           {/* Display Modes */}
           <div className="space-y-4">
             <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
               <Eye className="w-4 h-4" />
               Display Modes
             </h3>
             
             {/* Low Stimulus Mode */}
             <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
               <div className="flex items-center gap-3">
                 <div className={cn(
                   'w-10 h-10 rounded-xl flex items-center justify-center',
                   settings.lowStimulusMode ? 'bg-duo-green/20' : 'bg-muted'
                 )}>
                   <Sun className={cn('w-5 h-5', settings.lowStimulusMode ? 'text-duo-green' : 'text-muted-foreground')} />
                 </div>
                 <div>
                   <Label htmlFor="low-stimulus" className="font-medium">Low Stimulus Mode</Label>
                   <p className="text-xs text-muted-foreground">Softer colors, minimal animations</p>
                 </div>
               </div>
               <Switch
                 id="low-stimulus"
                 checked={settings.lowStimulusMode}
                 onCheckedChange={(checked) => setSettings(prev => ({ 
                   ...prev, 
                   lowStimulusMode: checked,
                   calmingMode: checked ? false : prev.calmingMode
                 }))}
               />
             </div>
             
             {/* Night/Calming Mode */}
             <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
               <div className="flex items-center gap-3">
                 <div className={cn(
                   'w-10 h-10 rounded-xl flex items-center justify-center',
                   settings.calmingMode ? 'bg-duo-purple/20' : 'bg-muted'
                 )}>
                   <Moon className={cn('w-5 h-5', settings.calmingMode ? 'text-duo-purple' : 'text-muted-foreground')} />
                 </div>
                 <div>
                   <Label htmlFor="calming-mode" className="font-medium">Night / Calming Mode</Label>
                   <p className="text-xs text-muted-foreground">Darker, soothing environment</p>
                 </div>
               </div>
               <Switch
                 id="calming-mode"
                 checked={settings.calmingMode}
                 onCheckedChange={(checked) => setSettings(prev => ({ 
                   ...prev, 
                   calmingMode: checked,
                   lowStimulusMode: checked ? false : prev.lowStimulusMode
                 }))}
               />
             </div>
           </div>
 
           <Separator />
 
           {/* Sound Controls */}
           <div className="space-y-4">
             <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
               <Volume2 className="w-4 h-4" />
               Sound Sensitivity
             </h3>
             
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 {settings.soundEnabled ? (
                   <Volume2 className="w-5 h-5 text-duo-blue" />
                 ) : (
                   <VolumeX className="w-5 h-5 text-muted-foreground" />
                 )}
                 <div>
                   <Label htmlFor="sound-toggle" className="font-medium">Sound Effects</Label>
                   <p className="text-xs text-muted-foreground">Game sounds and feedback</p>
                 </div>
               </div>
               <Switch
                 id="sound-toggle"
                 checked={settings.soundEnabled}
                 onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
               />
             </div>
 
             {settings.soundEnabled && (
               <div className="space-y-2 pl-8">
                 <div className="flex justify-between text-sm">
                   <span>Volume</span>
                   <span className="font-medium text-duo-blue">{settings.soundVolume}%</span>
                 </div>
                 <Slider
                   value={[settings.soundVolume]}
                   onValueChange={(value) => setSettings(prev => ({ ...prev, soundVolume: value[0] }))}
                   min={10}
                   max={100}
                   step={10}
                   className="py-2"
                 />
               </div>
             )}
           </div>
 
           <Separator />
 
           {/* Motion & Animation */}
           <div className="space-y-4">
             <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
               <Zap className="w-4 h-4" />
               Motion & Animation
             </h3>
             
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <Zap className={cn('w-5 h-5', settings.animationsEnabled ? 'text-duo-orange' : 'text-muted-foreground')} />
                 <div>
                   <Label htmlFor="animations" className="font-medium">Animations</Label>
                   <p className="text-xs text-muted-foreground">Moving elements and transitions</p>
                 </div>
               </div>
               <Switch
                 id="animations"
                 checked={settings.animationsEnabled}
                 onCheckedChange={(checked) => setSettings(prev => ({ ...prev, animationsEnabled: checked }))}
               />
             </div>
           </div>
 
           <Separator />
 
           {/* Text & Spacing */}
           <div className="space-y-4">
             <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
               <Type className="w-4 h-4" />
               Text & Spacing
             </h3>
 
             <div className="space-y-3">
               <div className="flex justify-between">
                 <span className="text-sm">Font Size</span>
                 <span className="font-medium text-duo-purple">{settings.fontSizeScale}%</span>
               </div>
               <Slider
                 value={[settings.fontSizeScale]}
                 onValueChange={(value) => setSettings(prev => ({ ...prev, fontSizeScale: value[0] }))}
                 min={80}
                 max={150}
                 step={10}
                 className="py-2"
               />
               <div className="flex justify-between text-xs text-muted-foreground">
                 <span>Smaller</span>
                 <span>Larger</span>
               </div>
             </div>
 
             <div className="flex items-center justify-between">
               <div>
                 <Label htmlFor="spacing" className="font-medium">Increased Spacing</Label>
                 <p className="text-xs text-muted-foreground">More space between text</p>
               </div>
               <Switch
                 id="spacing"
                 checked={settings.increasedSpacing}
                 onCheckedChange={(checked) => setSettings(prev => ({ ...prev, increasedSpacing: checked }))}
               />
             </div>
           </div>
 
           <Separator />
 
           {/* Color Theme */}
           <div className="space-y-4">
             <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
               <Palette className="w-4 h-4" />
               Color Theme
             </h3>
             
             <div className="grid grid-cols-4 gap-3">
               {colorThemes.map((theme) => (
                 <button
                   key={theme.id}
                   onClick={() => setSettings(prev => ({ ...prev, colorTheme: theme.id as any }))}
                   className={cn(
                     'p-3 rounded-xl border-2 transition-all',
                     settings.colorTheme === theme.id
                       ? 'border-primary bg-primary/10'
                       : 'border-transparent bg-muted/30 hover:bg-muted/50'
                   )}
                 >
                   <div className="flex gap-1 justify-center mb-2">
                     {theme.colors.map((color, i) => (
                       <div
                         key={i}
                         className="w-4 h-4 rounded-full"
                         style={{ backgroundColor: color }}
                       />
                     ))}
                   </div>
                   <p className="text-xs font-medium text-center">{theme.name}</p>
                 </button>
               ))}
             </div>
           </div>
 
           <Separator />
 
           {/* Actions */}
           <div className="flex gap-3 pt-2">
             <Button
               variant="outline"
               onClick={resetToDefaults}
               className="flex-1 gap-2"
             >
               <RotateCcw className="w-4 h-4" />
               Reset
             </Button>
             <Button
               onClick={saveSettings}
               disabled={saving}
               className="flex-1 gap-2"
             >
               <Save className="w-4 h-4" />
               {saving ? 'Saving...' : 'Save'}
             </Button>
           </div>
         </div>
       </DialogContent>
     </Dialog>
   );
 }