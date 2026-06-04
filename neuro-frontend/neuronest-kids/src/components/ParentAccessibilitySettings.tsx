import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Accessibility, 
  Type, 
  Contrast, 
  Zap, 
  Volume2, 
  VolumeX, 
  Save, 
  RotateCcw,
  Sun,
  Moon,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilitySettings {
  large_text_mode: boolean;
  high_contrast_mode: boolean;
  reduced_motion: boolean;
  sound_enabled: boolean;
  animations_enabled: boolean;
  font_size_scale: number;
}

interface ParentAccessibilitySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ParentAccessibilitySettings({ open, onOpenChange }: ParentAccessibilitySettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    large_text_mode: false,
    high_contrast_mode: false,
    reduced_motion: false,
    sound_enabled: true,
    animations_enabled: true,
    font_size_scale: 100,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem('neuronest-accessibility');
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch {
          // Use defaults
        }
      }
    }
  }, [open]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Large text mode
    if (settings.large_text_mode) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // High contrast mode
    if (settings.high_contrast_mode) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (settings.reduced_motion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Font size scale
    root.style.setProperty('--font-scale', `${settings.font_size_scale / 100}`);
  }, [settings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('neuronest-accessibility', JSON.stringify(settings));
      localStorage.setItem('neuronest-sound-enabled', settings.sound_enabled.toString());
      localStorage.setItem('neuronest-animations-enabled', settings.animations_enabled.toString());

      toast({
        title: 'Settings Saved',
        description: 'Your accessibility preferences have been updated.',
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
      large_text_mode: false,
      high_contrast_mode: false,
      reduced_motion: false,
      sound_enabled: true,
      animations_enabled: true,
      font_size_scale: 100,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Accessibility className="w-6 h-6 text-primary" />
            Accessibility Settings
          </DialogTitle>
          <DialogDescription>
            Customize the app for your needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Visual Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visual
            </h3>
            
            {/* Large Text Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Type className={cn('w-5 h-5', settings.large_text_mode ? 'text-primary' : 'text-muted-foreground')} />
                <div>
                  <Label htmlFor="large-text" className="font-medium">Large Text Mode</Label>
                  <p className="text-xs text-muted-foreground">Increase text size throughout the app</p>
                </div>
              </div>
              <Switch
                id="large-text"
                checked={settings.large_text_mode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, large_text_mode: checked }))}
              />
            </div>
            
            {/* High Contrast Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Contrast className={cn('w-5 h-5', settings.high_contrast_mode ? 'text-primary' : 'text-muted-foreground')} />
                <div>
                  <Label htmlFor="high-contrast" className="font-medium">High Contrast Mode</Label>
                  <p className="text-xs text-muted-foreground">Increase color contrast for better visibility</p>
                </div>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.high_contrast_mode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, high_contrast_mode: checked }))}
              />
            </div>

            {/* Font Size Scale */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="font-medium">Font Size</Label>
                    <p className="text-xs text-muted-foreground">Adjust overall text size</p>
                  </div>
                </div>
                <span className="font-bold text-primary">{settings.font_size_scale}%</span>
              </div>
              <Slider
                value={[settings.font_size_scale]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, font_size_scale: value[0] }))}
                min={80}
                max={150}
                step={10}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>80%</span>
                <span>150%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Motion Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Motion & Animation
            </h3>
            
            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className={cn('w-5 h-5', settings.reduced_motion ? 'text-primary' : 'text-muted-foreground')} />
                <div>
                  <Label htmlFor="reduced-motion" className="font-medium">Reduced Motion</Label>
                  <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
                </div>
              </div>
              <Switch
                id="reduced-motion"
                checked={settings.reduced_motion}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  reduced_motion: checked,
                  animations_enabled: !checked
                }))}
              />
            </div>
          </div>

          <Separator />

          {/* Audio Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Audio
            </h3>
            
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
      </DialogContent>
    </Dialog>
  );
}
