import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getChildrenAPI, addChildAPI, updateChildAPI, deleteChildAPI } from '@/api/backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InteractiveMascot } from '@/components/InteractiveMascot';
import { ChildAvatar, AVATAR_OPTIONS } from '@/components/ChildAvatar';
import { ParentReportDashboard } from '@/components/ParentReportDashboard';
import { PasswordManager } from '@/components/PasswordManager';
import { ParentPinGate } from '@/components/ParentPinGate';
import { ParentSettingsDialog } from '@/components/ParentSettingsDialog';
import { GuideMascot } from '@/components/GuideMascot';
import { useToast } from '@/hooks/use-toast';
import { Plus, LogOut, Play, Trash2, Edit2, Settings, Lock, Shield, Sliders, BarChart3, Users, Activity, Sparkles, Trophy, Smartphone } from 'lucide-react';
import { ParentAlertCenter } from '@/components/ParentAlertCenter';
import { RewardDisplay } from '@/components/RewardDisplay';
import { SensorySettingsPanel } from '@/components/SensorySettingsPanel';
import { ParentRemoteControl } from '@/components/ParentRemoteControl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import gsap from 'gsap';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
}

export default function ParentDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [showReportDashboard, setShowReportDashboard] = useState(false);
  const [showPasswordManager, setShowPasswordManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPinGate, setShowPinGate] = useState(false);
  const [pendingAction, setPendingAction] = useState<'reports' | 'settings' | 'password' | null>(null);
  const [showSensorySettings, setShowSensorySettings] = useState(false);
  const [remoteControlChild, setRemoteControlChild] = useState<ChildProfile | null>(null);

  // Form state
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('default');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  // Animate cards on load
  useEffect(() => {
    if (!cardsRef.current || loading) return;

    const cards = cardsRef.current.querySelectorAll('.child-card');
    gsap.fromTo(cards,
      { opacity: 0, y: 40, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.5)'
      }
    );
  }, [loading, children]);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('neuronest_auth_token') || '';
      const data = await getChildrenAPI(token);
      if (Array.isArray(data)) {
        setChildren(data);
      } else {
        setChildren([]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load child profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async () => {
    if (!childName.trim() || !childAge) {
      toast({
        title: 'Missing Information',
        description: 'Please enter name and age',
        variant: 'destructive',
      });
      return;
    }

    const age = parseInt(childAge);
    if (age < 1 || age > 25) {
      toast({
        title: 'Invalid Age',
        description: 'Age must be between 1 and 25',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate name
    const duplicateName = children.some(
      c => c.name.toLowerCase() === childName.trim().toLowerCase()
    );
    if (duplicateName) {
      toast({
        title: 'Duplicate Name',
        description: `A child named "${childName.trim()}" already exists. Please use a different name.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('neuronest_auth_token') || '';
      const result = await addChildAPI(token, { name: childName.trim(), age, avatar: selectedAvatar });

      if (result.error) throw new Error(result.error);

      toast({
        title: 'Success! 🎉',
        description: `${childName}'s profile has been created`,
      });

      resetForm();
      setIsAddDialogOpen(false);
      fetchChildren();
    } catch (error: any) {
      console.error('Child creation error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create child profile.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateChild = async () => {
    if (!editingChild || !childName.trim() || !childAge) return;

    const age = parseInt(childAge);
    if (age < 1 || age > 25) {
      toast({
        title: 'Invalid Age',
        description: 'Age must be between 1 and 25',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate name (exclude current child)
    const duplicateName = children.some(
      c => c.id !== editingChild.id && c.name.toLowerCase() === childName.trim().toLowerCase()
    );
    if (duplicateName) {
      toast({
        title: 'Duplicate Name',
        description: `A child named "${childName.trim()}" already exists.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('neuronest_auth_token') || '';
      const result = await updateChildAPI(token, editingChild.id, { name: childName.trim(), age, avatar: selectedAvatar });

      if (result.error) throw new Error(result.error);

      toast({
        title: 'Updated!',
        description: `${childName}'s profile has been updated`,
      });

      resetForm();
      setEditingChild(null);
      fetchChildren();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update child profile',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChild = async (child: ChildProfile) => {
    if (!confirm(`Are you sure you want to delete ${child.name}'s profile?`)) return;

    try {
      const token = localStorage.getItem('neuronest_auth_token') || '';
      await deleteChildAPI(token, child.id);

      toast({
        title: 'Deleted',
        description: `${child.name}'s profile has been removed`,
      });

      fetchChildren();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete child profile',
        variant: 'destructive',
      });
    }
  };

  const startEditing = (child: ChildProfile) => {
    setChildName(child.name);
    setChildAge(child.age.toString());
    setSelectedAvatar(child.avatar);
    setEditingChild(child);
  };

  const resetForm = () => {
    setChildName('');
    setChildAge('');
    setSelectedAvatar('default');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const playAsChild = (child: ChildProfile) => {
    navigate(`/child-dashboard/${child.id}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-mint via-background to-pastel-lavender/30 flex flex-col items-center justify-center gap-6">
        <InteractiveMascot size="lg" emotion="happy" />
        <div className="text-center">
          <p className="text-xl font-display font-bold text-slate-700 animate-pulse">Loading your dashboard...</p>
          <p className="text-sm text-slate-500 mt-2">Getting everything ready ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-pastel-mint/40 via-background to-pastel-lavender/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-duo-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-duo-purple/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-duo-yellow/5 rounded-full blur-3xl" />
      </div>

      {/* Header - fixed z-index and no overlap */}
      <header className="relative z-20 bg-white/90 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <InteractiveMascot size="sm" emotion="happy" interactive={false} />
            <span className="font-display text-xl font-bold text-slate-800">NeuroNest</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setPendingAction('reports');
                setShowPinGate(true);
              }}
              className="gap-2 rounded-xl hidden sm:flex bg-white/50 hover:bg-white border-slate-200"
            >
              <Shield className="w-4 h-4 text-duo-purple" />
              <span className="text-slate-700">Reports</span>
            </Button>

            <ParentAlertCenter />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/50">
                  <Settings className="w-5 h-5 text-slate-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl bg-white/95 backdrop-blur-lg border-slate-200">
                <DropdownMenuItem onClick={() => {
                  setPendingAction('reports');
                  setShowPinGate(true);
                }} className="sm:hidden">
                  <Shield className="w-4 h-4 mr-2 text-duo-purple" />
                  View Reports
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setPendingAction('password');
                  setShowPinGate(true);
                }}>
                  <Lock className="w-4 h-4 mr-2 text-duo-blue" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setPendingAction('settings');
                  setShowPinGate(true);
                }}>
                  <Sliders className="w-4 h-4 mr-2 text-duo-orange" />
                  App Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Welcome Section - proper spacing below header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-800">
              Parent Dashboard
            </h1>
            <span className="text-3xl">👋</span>
          </div>
          <p className="text-slate-500 text-base">
            Manage your children's profiles and track their learning progress
          </p>
        </div>

        {/* Quick Stats */}
        {children.length > 0 && (
          <div className="mb-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Child Profiles"
              value={children.length.toString()}
              color="green"
            />
            <StatCard
              icon={<Activity className="w-6 h-6" />}
              label="Active Learners"
              value={children.length.toString()}
              color="blue"
            />
            <button
              onClick={() => {
                setPendingAction('reports');
                setShowPinGate(true);
              }}
              className="bg-white rounded-2xl p-5 text-left shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-duo-purple to-duo-pink flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <p className="font-bold text-lg text-duo-purple">View Reports</p>
              <p className="text-xs text-slate-400">Full Analytics</p>
            </button>
            <button
              onClick={() => {
                setPendingAction('reports');
                setShowPinGate(true);
              }}
              className="bg-white rounded-2xl p-5 text-left shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-duo-blue to-duo-teal flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <p className="font-bold text-lg text-duo-blue">AI Insights</p>
              <p className="text-xs text-slate-400">Behavior & Analytics</p>
            </button>
          </div>
        )}

        {/* Add Child Button - separate from stat cards */}
        <div className="mb-6">
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-br from-duo-green/10 to-duo-teal/10 border-2 border-dashed border-duo-green/40 rounded-2xl px-6 py-4 text-left hover:border-duo-green hover:from-duo-green/20 hover:to-duo-teal/20 transition-all duration-300 group inline-flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-duo-green to-duo-teal flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-lg text-duo-green">Add Child</p>
              <p className="text-xs text-slate-400">New Profile</p>
            </div>
          </button>
        </div>

        {/* Children Grid */}
        <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <div
              key={child.id}
              className="child-card bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 group hover:scale-[1.02]"
            >
              <div className="relative -mx-6 -mt-6 mb-4 px-6 pt-6 pb-4 bg-gradient-to-br from-pastel-mint/50 to-pastel-sky/30 rounded-t-3xl">
                <div className="flex justify-center">
                  <div className="relative">
                    <ChildAvatar avatar={child.avatar} size="lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-duo-green rounded-full flex items-center justify-center border-2 border-white">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="font-display text-2xl font-bold text-slate-800 text-center mb-1">
                {child.name}
              </h3>
              <p className="text-slate-400 text-center mb-6 text-sm">
                {child.age} years old
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={() => playAsChild(child)}
                  className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-duo-green to-duo-teal hover:from-duo-green/90 hover:to-duo-teal/90 shadow-lg shadow-duo-green/20 h-11"
                >
                  <Play className="w-4 h-4" />
                  Play
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRemoteControlChild(child)}
                  className="rounded-xl h-11 w-11 border-slate-200 hover:bg-duo-blue/10 hover:border-duo-blue"
                  title="Remote Control"
                >
                  <Smartphone className="w-4 h-4 text-duo-blue" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => startEditing(child)}
                  className="rounded-xl h-11 w-11 border-slate-200 hover:bg-slate-50"
                >
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteChild(child)}
                  className="rounded-xl h-11 w-11 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}

          {children.length === 0 && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="bg-white/60 border-2 border-dashed border-slate-300 rounded-3xl p-6 min-h-[320px] flex flex-col items-center justify-center gap-4 hover:border-duo-green hover:bg-white/80 transition-all duration-300"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-duo-green/20 to-duo-teal/20 flex items-center justify-center">
                    <Plus className="w-10 h-10 text-duo-green" />
                  </div>
                  <span className="font-display text-xl font-semibold text-slate-700">
                    Add Your First Child
                  </span>
                  <p className="text-slate-400 text-center max-w-[200px]">
                    Create a profile to start their learning journey!
                  </p>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl bg-white">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl text-slate-800">Add Child Profile</DialogTitle>
                </DialogHeader>
                <ChildForm
                  name={childName}
                  setName={setChildName}
                  age={childAge}
                  setAge={setChildAge}
                  avatar={selectedAvatar}
                  setAvatar={setSelectedAvatar}
                  onSubmit={handleAddChild}
                  submitLabel="Create Profile"
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {children.length > 0 && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl bg-white">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-slate-800">Add Child Profile</DialogTitle>
              </DialogHeader>
              <ChildForm
                name={childName}
                setName={setChildName}
                age={childAge}
                setAge={setChildAge}
                avatar={selectedAvatar}
                setAvatar={setSelectedAvatar}
                onSubmit={handleAddChild}
                submitLabel="Create Profile"
              />
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={!!editingChild} onOpenChange={(open) => !open && setEditingChild(null)}>
          <DialogContent className="sm:max-w-md rounded-3xl bg-white">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-slate-800">Edit Profile</DialogTitle>
            </DialogHeader>
            <ChildForm
              name={childName}
              setName={setChildName}
              age={childAge}
              setAge={setChildAge}
              avatar={selectedAvatar}
              setAvatar={setSelectedAvatar}
              onSubmit={handleUpdateChild}
              submitLabel="Save Changes"
            />
          </DialogContent>
        </Dialog>

        {children.length === 0 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-4 bg-white rounded-3xl p-6 shadow-lg max-w-md border border-slate-100">
              <InteractiveMascot size="md" emotion="encouraging" />
              <div>
                <p className="text-lg font-medium text-slate-800 mb-1">
                  Welcome to NeuroNest! 🎉
                </p>
                <p className="text-slate-500">
                  Add your first child profile to start their fun learning adventure!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <ParentReportDashboard
        open={showReportDashboard}
        onOpenChange={setShowReportDashboard}
        children={children}
      />

      <PasswordManager
        open={showPasswordManager}
        onOpenChange={setShowPasswordManager}
      />

      <ParentPinGate
        open={showPinGate}
        onOpenChange={setShowPinGate}
        title="Parent Verification"
        description="Enter your PIN to access this feature"
        onSuccess={() => {
          if (pendingAction === 'reports') {
            setShowReportDashboard(true);
          } else if (pendingAction === 'password') {
            setShowPasswordManager(true);
          } else if (pendingAction === 'settings') {
            setShowSettings(true);
          }
          setPendingAction(null);
        }}
      />

      <ParentSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      <SensorySettingsPanel
        open={showSensorySettings}
        onOpenChange={setShowSensorySettings}
      />

      {remoteControlChild && (
        <ParentRemoteControl
          open={!!remoteControlChild}
          onOpenChange={(open) => !open && setRemoteControlChild(null)}
          childId={remoteControlChild.id}
          childName={remoteControlChild.name}
        />
      )}

    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'green' | 'blue' | 'purple' | 'orange' }) {
  const colorClasses = {
    green: 'from-duo-green to-duo-teal',
    blue: 'from-duo-blue to-duo-teal',
    purple: 'from-duo-purple to-duo-pink',
    orange: 'from-duo-orange to-duo-yellow',
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <p className="font-bold text-2xl text-slate-800">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function ChildForm({
  name,
  setName,
  age,
  setAge,
  avatar,
  setAvatar,
  onSubmit,
  submitLabel,
}: {
  name: string;
  setName: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  avatar: string;
  setAvatar: (v: string) => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label htmlFor="childName" className="text-slate-700">Child's Name</Label>
        <Input
          id="childName"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl border-slate-200 focus:border-duo-green focus:ring-duo-green"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="childAge" className="text-slate-700">Age (1-25)</Label>
        <Input
          id="childAge"
          type="number"
          min="1"
          max="25"
          placeholder="Enter age (1-25)"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="h-12 rounded-xl border-slate-200 focus:border-duo-green focus:ring-duo-green"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Choose Avatar</Label>
        <div className="flex flex-wrap gap-3 justify-center">
          {AVATAR_OPTIONS.map((opt) => (
            <ChildAvatar
              key={opt}
              avatar={opt}
              size="md"
              selected={avatar === opt}
              onClick={() => setAvatar(opt)}
            />
          ))}
        </div>
      </div>

      <Button
        onClick={onSubmit}
        className="w-full h-12 rounded-xl text-lg bg-gradient-to-r from-duo-green to-duo-teal hover:from-duo-green/90 hover:to-duo-teal/90 shadow-lg shadow-duo-green/20"
      >
        {submitLabel}
      </Button>
    </div>
  );
}
