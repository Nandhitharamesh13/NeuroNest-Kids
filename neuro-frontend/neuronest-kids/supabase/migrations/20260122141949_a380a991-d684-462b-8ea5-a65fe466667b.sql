-- Create table for adaptive AI behavior tracking
CREATE TABLE public.child_behavior_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  
  -- Learning style indicators
  preferred_pace VARCHAR(20) DEFAULT 'normal' CHECK (preferred_pace IN ('slow', 'normal', 'fast')),
  attention_span_minutes INTEGER DEFAULT 10,
  best_time_of_day VARCHAR(20) DEFAULT 'morning' CHECK (best_time_of_day IN ('morning', 'afternoon', 'evening')),
  
  -- Sensory preferences
  prefers_sounds BOOLEAN DEFAULT true,
  prefers_animations BOOLEAN DEFAULT true,
  color_sensitivity VARCHAR(20) DEFAULT 'normal' CHECK (color_sensitivity IN ('low', 'normal', 'high')),
  
  -- Performance patterns
  average_accuracy DECIMAL(5,2) DEFAULT 0,
  average_response_time_seconds DECIMAL(8,2) DEFAULT 0,
  frustration_threshold INTEGER DEFAULT 3, -- number of consecutive wrong answers before needing encouragement
  
  -- Strengths and challenges (JSON arrays)
  strong_categories JSONB DEFAULT '[]'::jsonb,
  challenging_categories JSONB DEFAULT '[]'::jsonb,
  
  -- AI recommendations
  current_difficulty_level INTEGER DEFAULT 1 CHECK (current_difficulty_level BETWEEN 1 AND 5),
  recommended_games JSONB DEFAULT '[]'::jsonb,
  last_ai_analysis TIMESTAMPTZ,
  ai_insights JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.child_behavior_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Parents can view their children's behavior profiles"
ON public.child_behavior_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_behavior_profiles.child_id
    AND cp.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can insert behavior profiles for their children"
ON public.child_behavior_profiles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_behavior_profiles.child_id
    AND cp.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can update their children's behavior profiles"
ON public.child_behavior_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = child_behavior_profiles.child_id
    AND cp.parent_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_child_behavior_profiles_updated_at
BEFORE UPDATE ON public.child_behavior_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint on child_id
CREATE UNIQUE INDEX idx_child_behavior_profiles_child_id ON public.child_behavior_profiles(child_id);