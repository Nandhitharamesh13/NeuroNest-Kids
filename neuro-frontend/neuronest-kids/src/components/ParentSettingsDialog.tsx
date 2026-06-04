import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Volume2, VolumeX, Sparkles, Clock, Save, RotateCcw, Accessibility } from 'lucide-react';
import { ParentAccessibilitySettings } from './ParentAccessibilitySettings';
import { cn } from '@/lib/utils';

interface ParentalSettings {
  sound_enabled: boolean;
  animations_enabled: boolean;
  session_duration_minutes: number;
}

interface ParentSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ParentSettingsDialog({ open, onOpenChange }: ParentSettingsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [settings, setSettings] = useState<ParentalSettings>({
    sound_enabled: true,
    animations_enabled: true,
    session_duration_minutes: 30,
  });

  useEffect(() => {
    if (open && user) {
      fetchSettings();
    }
  }, [open, user]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parental_settings')
        .select('*')
        .eq('parent_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          sound_enabled: data.sound_enabled ?? true,
          animations_enabled: data.animations_enabled ?? true,
          session_duration_minutes: data.session_duration_minutes ?? 30,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('parental_settings')
        .upsert({
          parent_id: user!.id,
          sound_enabled: settings.sound_enabled,
          animations_enabled: settings.animations_enabled,
          session_duration_minutes: settings.session_duration_minutes,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'parent_id' 
        });

      if (error) throw error;

      // Also save to localStorage for immediate effect
      localStorage.setItem('neuronest-sound-enabled', settings.sound_enabled.toString());
      localStorage.setItem('neuronest-animations-enabled', settings.animations_enabled.toString());
      localStorage.setItem('neuronest-session-duration', settings.session_duration_minutes.toString());

      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully.',
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
      sound_enabled: true,
      animations_enabled: true,
      session_duration_minutes: 30,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Application Settings</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Sound Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Audio</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.sound_enabled ? (
                    <Volume2 className="w-5 h-5 text-primary" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="sound" className="font-medium">Sound Effects</Label>
                    <p className="text-xs text-muted-foreground">Game sounds and feedback</p>
                  </div>
                </div>
                <Switch
                  id="sound"
                  checked={settings.sound_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sound_enabled: checked }))}
                />
              </div>
            </div>

            <Separator />

            {/* Animation Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Visual</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className={cn('w-5 h-5', settings.animations_enabled ? 'text-primary' : 'text-muted-foreground')} />
                  <div>
                    <Label htmlFor="animations" className="font-medium">Animations</Label>
                    <p className="text-xs text-muted-foreground">Celebration effects and transitions</p>
                  </div>
                </div>
                <Switch
                  id="animations"
                  checked={settings.animations_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, animations_enabled: checked }))}
                />
              </div>
            </div>

            <Separator />

            {/* Session Duration */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Session</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <Label className="font-medium">Play Session Duration</Label>
                    <p className="text-xs text-muted-foreground">Suggested break reminder</p>
                  </div>
                  <span className="font-bold text-primary">{settings.session_duration_minutes} min</span>
                </div>
                
                <Slider
                  value={[settings.session_duration_minutes]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, session_duration_minutes: value[0] }))}
                  min={10}
                  max={60}
                  step={5}
                  className="py-2"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10 min</span>
                  <span>60 min</span>
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Accessibility Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Accessibility</h3>
              <Button
                variant="outline"
                onClick={() => setShowAccessibility(true)}
                className="w-full justify-start gap-3"
              >
                <Accessibility className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Accessibility Options</div>
                  <div className="text-xs text-muted-foreground">Large text, contrast, reduced motion</div>
                </div>
              </Button>
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
                Reset Defaults
              </Button>
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="flex-1 gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
      
      <ParentAccessibilitySettings 
        open={showAccessibility} 
        onOpenChange={setShowAccessibility} 
      />
    </Dialog>
  );
}
