-- Create game_sessions table to track each game play
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('shapes', 'colors', 'fruits')),
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  mistakes JSONB DEFAULT '[]'::jsonb,
  max_streak INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Parents can view their children's game sessions
CREATE POLICY "Parents can view children game sessions"
ON public.game_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles
    WHERE child_profiles.id = game_sessions.child_id
    AND child_profiles.parent_id = auth.uid()
  )
);

-- Parents can insert game sessions for their children
CREATE POLICY "Parents can insert children game sessions"
ON public.game_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles
    WHERE child_profiles.id = game_sessions.child_id
    AND child_profiles.parent_id = auth.uid()
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_game_sessions_child_id ON public.game_sessions(child_id);
CREATE INDEX idx_game_sessions_game_type ON public.game_sessions(game_type);
CREATE INDEX idx_game_sessions_created_at ON public.game_sessions(created_at DESC);