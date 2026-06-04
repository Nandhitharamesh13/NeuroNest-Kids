
-- Create remote_control_settings table for real-time sync
CREATE TABLE public.remote_control_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL,
  difficulty_level INTEGER DEFAULT 3,
  auto_adjust_difficulty BOOLEAN DEFAULT true,
  enabled_categories JSONB DEFAULT '["everyday","numbers","words","sensory","world"]'::jsonb,
  daily_time_limit INTEGER DEFAULT 30,
  learning_goals JSONB DEFAULT '[]'::jsonb,
  focus_mode BOOLEAN DEFAULT false,
  age_filter INTEGER DEFAULT 5,
  content_filter_level TEXT DEFAULT 'standard',
  schedule JSONB DEFAULT '[]'::jsonb,
  milestone_notifications JSONB DEFAULT '[]'::jsonb,
  break_reminders BOOLEAN DEFAULT true,
  break_interval_minutes INTEGER DEFAULT 15,
  max_games_per_session INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id)
);

-- Enable RLS
ALTER TABLE public.remote_control_settings ENABLE ROW LEVEL SECURITY;

-- Parents can manage their own children's remote settings
CREATE POLICY "Parents can view remote settings for own children"
ON public.remote_control_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = remote_control_settings.child_id
    AND cp.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can insert remote settings for own children"
ON public.remote_control_settings FOR INSERT
WITH CHECK (
  auth.uid() = parent_id AND
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = remote_control_settings.child_id
    AND cp.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can update remote settings for own children"
ON public.remote_control_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = remote_control_settings.child_id
    AND cp.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can delete remote settings for own children"
ON public.remote_control_settings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = remote_control_settings.child_id
    AND cp.parent_id = auth.uid()
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_remote_control_settings_updated_at
BEFORE UPDATE ON public.remote_control_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.remote_control_settings;
