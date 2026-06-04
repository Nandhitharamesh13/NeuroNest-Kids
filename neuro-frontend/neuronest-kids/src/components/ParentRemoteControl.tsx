import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useRemoteControlSettingsParent, type RemoteControlSettings } from '@/hooks/useRemoteControlSettings';
import {
  Settings2, Target, Gamepad2, Brain, Save, RotateCcw,
  BookOpen, Palette, Music, Calculator, Globe,
  Smartphone, Calendar, Bell, Filter, Clock, Shield,
} from 'lucide-react';

interface ParentRemoteControlProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childId: string;
  childName: string;
}

const GAME_CATEGORIES = [
  { id: 'everyday', name: 'Everyday Basics', games: ['clock', 'weather', 'fruits', 'kitchen', 'hometools'], ageMin: 3 },
  { id: 'numbers', name: 'Numbers in Action', games: ['numbers', 'countalong', 'compareitems'], ageMin: 3 },
  { id: 'words', name: 'Word Station', games: ['alphabet', 'vowels', 'consonants', 'lettertracing'], ageMin: 4 },
  { id: 'sensory', name: 'See & Discover', games: ['shapes', 'colors', 'emotions', 'memory'], ageMin: 3 },
  { id: 'world', name: 'World Around Us', games: ['animals', 'bodyparts', 'music'], ageMin: 3 },
];

const GOAL_ICONS: Record<string, React.ReactNode> = {
  letters: <BookOpen className="w-4 h-4" />,
  numbers: <Calculator className="w-4 h-4" />,
  colors: <Palette className="w-4 h-4" />,
  music: <Music className="w-4 h-4" />,
  world: <Globe className="w-4 h-4" />,
  social: <Gamepad2 className="w-4 h-4" />,
};

type TabId = 'difficulty' | 'goals' | 'categories' | 'schedule' | 'notifications' | 'session';

export function ParentRemoteControl({ open, onOpenChange, childId, childName }: ParentRemoteControlProps) {
  const { toast } = useToast();
  const { settings, setSettings, saveSettings, loading, DEFAULT_SETTINGS } = useRemoteControlSettingsParent(childId);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('difficulty');
  const [childAge, setChildAge] = useState(5);

  // Load child age
  useEffect(() => {
    if (open && childId) {
      supabase.from('child_profiles').select('age').eq('id', childId).single()
        .then(({ data }) => {
          if (data?.age) {
            setChildAge(data.age);
          }
        });
    }
  }, [open, childId]);

  const handleSave = async () => {
    setSaving(true);
    const ok = await saveSettings(settings);
    if (ok) {
      // Also sync time limit to parental_settings
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        await supabase.from('parental_settings').upsert({
          parent_id: user.id,
          session_duration_minutes: settings.dailyTimeLimit,
          sound_enabled: true,
          animations_enabled: true,
        }, { onConflict: 'parent_id' });
      }
      toast({
        title: 'Settings Synced 📱',
        description: `${childName}'s learning settings updated in real-time across all devices.`,
      });
      onOpenChange(false);
    }
    setSaving(false);
  };

  const toggleCategory = (catId: string) => {
    setSettings(prev => ({
      ...prev,
      enabledCategories: prev.enabledCategories.includes(catId)
        ? prev.enabledCategories.filter(id => id !== catId)
        : [...prev.enabledCategories, catId],
    }));
  };

  const updateGoalPriority = (goalId: string, priority: 'low' | 'medium' | 'high') => {
    setSettings(prev => ({
      ...prev,
      learningGoals: prev.learningGoals.map(g =>
        g.id === goalId ? { ...g, priority } : g
      ),
    }));
  };

  const toggleGoal = (goalId: string) => {
    setSettings(prev => ({
      ...prev,
      learningGoals: prev.learningGoals.map(g =>
        g.id === goalId ? { ...g, enabled: !g.enabled } : g
      ),
    }));
  };

  const toggleScheduleDay = (dayId: string) => {
    setSettings(prev => ({
      ...prev,
      schedule: prev.schedule.map(s =>
        s.id === dayId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  };

  const updateScheduleTime = (dayId: string, field: 'startTime' | 'endTime', value: string) => {
    setSettings(prev => ({
      ...prev,
      schedule: prev.schedule.map(s =>
        s.id === dayId ? { ...s, [field]: value } : s
      ),
    }));
  };

  const toggleMilestoneNotification = (notifId: string) => {
    setSettings(prev => ({
      ...prev,
      milestoneNotifications: prev.milestoneNotifications.map(n =>
        n.id === notifId ? { ...n, enabled: !n.enabled } : n
      ),
    }));
  };

  const resetSettings = () => {
    setSettings({ ...DEFAULT_SETTINGS, ageFilter: childAge });
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'difficulty', label: 'Difficulty', icon: <Brain className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'categories', label: 'Games', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
    { id: 'session', label: 'Session', icon: <Settings2 className="w-4 h-4" /> },
  ];

  const filteredCategories = GAME_CATEGORIES.filter(c => c.ageMin <= settings.ageFilter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-primary" />
            Remote Control — {childName}
          </DialogTitle>
          <DialogDescription>
            Customize learning from any device. Changes sync <strong>instantly</strong> via real-time WebSocket.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-2">
              {/* Difficulty Tab */}
              {activeTab === 'difficulty' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div>
                      <Label className="font-medium">Auto-Adjust Difficulty</Label>
                      <p className="text-xs text-muted-foreground">AI adapts based on performance</p>
                    </div>
                    <Switch
                      checked={settings.autoAdjustDifficulty}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoAdjustDifficulty: checked }))}
                    />
                  </div>

                  {!settings.autoAdjustDifficulty && (
                    <div className="space-y-2 p-3 rounded-xl bg-muted/30">
                      <div className="flex justify-between text-sm">
                        <span>Manual Difficulty</span>
                        <span className="font-bold text-primary">Level {settings.difficultyLevel}</span>
                      </div>
                      <Slider
                        value={[settings.difficultyLevel]}
                        onValueChange={(v) => setSettings(prev => ({ ...prev, difficultyLevel: v[0] }))}
                        min={1} max={5} step={1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Easy</span><span>Hard</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Filter className="w-4 h-4" /> Content Filtering
                    </h4>
                    <div className="p-3 rounded-xl bg-muted/30 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Age-appropriate content for</span>
                        <span className="font-bold text-primary">Age {settings.ageFilter}</span>
                      </div>
                      <Slider
                        value={[settings.ageFilter]}
                        onValueChange={(v) => setSettings(prev => ({ ...prev, ageFilter: v[0] }))}
                        min={1} max={25} step={1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 yr</span><span>25 yrs</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30">
                      <Label className="font-medium text-sm">Content Level</Label>
                      <Select
                        value={settings.contentFilterLevel}
                        onValueChange={(v) => setSettings(prev => ({ ...prev, contentFilterLevel: v as any }))}
                      >
                        <SelectTrigger className="mt-2 rounded-xl bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border rounded-xl shadow-lg z-50">
                          <SelectItem value="basic">Basic — Simple concepts only</SelectItem>
                          <SelectItem value="standard">Standard — Age-appropriate mix</SelectItem>
                          <SelectItem value="advanced">Advanced — Include challenges</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Goals Tab */}
              {activeTab === 'goals' && (
                <div className="space-y-3">
                  {settings.learningGoals.map(goal => (
                    <div key={goal.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-xl flex items-center justify-center',
                          goal.enabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        )}>
                          {GOAL_ICONS[goal.id] || <Target className="w-4 h-4" />}
                        </div>
                        <Label className="font-medium text-sm">{goal.name}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={goal.priority} onValueChange={(v) => updateGoalPriority(goal.id, v as any)}>
                          <SelectTrigger className="w-24 h-8 text-xs rounded-xl bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-background border rounded-xl shadow-lg z-50">
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <Switch checked={goal.enabled} onCheckedChange={() => toggleGoal(goal.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Showing categories for age {settings.ageFilter}+. Adjust age in Difficulty tab.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={cn(
                          'p-3 rounded-xl border-2 text-left transition-all',
                          settings.enabledCategories.includes(cat.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-muted bg-muted/20 opacity-60'
                        )}
                      >
                        <p className="font-medium text-sm">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.games.length} games</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Ages {cat.ageMin}+</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Set play session times for each day.</p>
                  {settings.schedule.map(slot => (
                    <div key={slot.id} className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-all',
                      slot.enabled ? 'bg-muted/30' : 'bg-muted/10 opacity-60'
                    )}>
                      <Switch checked={slot.enabled} onCheckedChange={() => toggleScheduleDay(slot.id)} />
                      <span className="font-medium text-sm w-20 shrink-0">{slot.day.slice(0, 3)}</span>
                      {slot.enabled && (
                        <div className="flex items-center gap-1.5 flex-1">
                          <Input type="time" value={slot.startTime}
                            onChange={(e) => updateScheduleTime(slot.id, 'startTime', e.target.value)}
                            className="h-8 text-xs rounded-lg flex-1" />
                          <span className="text-xs text-muted-foreground">to</span>
                          <Input type="time" value={slot.endTime}
                            onChange={(e) => updateScheduleTime(slot.id, 'endTime', e.target.value)}
                            className="h-8 text-xs rounded-lg flex-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Choose which milestone alerts you receive.</p>
                  {settings.milestoneNotifications.map(notif => (
                    <div key={notif.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-xl flex items-center justify-center text-sm',
                          notif.enabled ? 'bg-primary/20' : 'bg-muted'
                        )}>
                          {notif.type === 'achievement' ? '🏆' :
                           notif.type === 'milestone' ? '⭐' :
                           notif.type === 'streak' ? '🔥' :
                           notif.type === 'struggle' ? '💙' :
                           notif.type === 'daily_summary' ? '📊' :
                           notif.type === 'badge' ? '🎖️' : '📈'}
                        </div>
                        <Label className="font-medium text-sm">{notif.label}</Label>
                      </div>
                      <Switch checked={notif.enabled} onCheckedChange={() => toggleMilestoneNotification(notif.id)} />
                    </div>
                  ))}
                </div>
              )}

              {/* Session Tab */}
              {activeTab === 'session' && (
                <div className="space-y-4">
                  <div className="space-y-2 p-3 rounded-xl bg-muted/30">
                    <div className="flex justify-between text-sm">
                      <span>Daily Time Limit</span>
                      <span className="font-bold text-primary">{settings.dailyTimeLimit} min</span>
                    </div>
                    <Slider value={[settings.dailyTimeLimit]}
                      onValueChange={(v) => setSettings(prev => ({ ...prev, dailyTimeLimit: v[0] }))}
                      min={10} max={120} step={5} />
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-muted/30">
                    <div className="flex justify-between text-sm">
                      <span>Max Games Per Session</span>
                      <span className="font-bold text-primary">{settings.maxGamesPerSession}</span>
                    </div>
                    <Slider value={[settings.maxGamesPerSession]}
                      onValueChange={(v) => setSettings(prev => ({ ...prev, maxGamesPerSession: v[0] }))}
                      min={3} max={20} step={1} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div>
                      <Label className="font-medium">Focus Mode</Label>
                      <p className="text-xs text-muted-foreground">One game at a time, hide distractions</p>
                    </div>
                    <Switch checked={settings.focusMode}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, focusMode: checked }))} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div>
                      <Label className="font-medium">Break Reminders</Label>
                      <p className="text-xs text-muted-foreground">Remind every {settings.breakIntervalMinutes} min</p>
                    </div>
                    <Switch checked={settings.breakReminders}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, breakReminders: checked }))} />
                  </div>

                  {settings.breakReminders && (
                    <div className="space-y-2 p-3 rounded-xl bg-muted/30">
                      <div className="flex justify-between text-sm">
                        <span>Break Interval</span>
                        <span className="font-bold text-primary">{settings.breakIntervalMinutes} min</span>
                      </div>
                      <Slider value={[settings.breakIntervalMinutes]}
                        onValueChange={(v) => setSettings(prev => ({ ...prev, breakIntervalMinutes: v[0] }))}
                        min={5} max={30} step={5} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Realtime sync indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
              <div className="w-2 h-2 rounded-full bg-duo-green animate-pulse" />
              Real-time sync active — changes apply instantly on child's device
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetSettings} className="flex-1 gap-2 rounded-xl">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2 rounded-xl">
                <Save className="w-4 h-4" /> {saving ? 'Syncing...' : 'Save & Sync'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
