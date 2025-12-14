-- Check-ins table
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Conteúdo do check-in
  photo_url TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT CHECK (LENGTH(comment) <= 300),

  -- Moderação
  moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES public.users(id),
  rejection_reason TEXT,

  -- Pontos ganhos
  points_earned INTEGER DEFAULT 0
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON public.check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_recipe_id ON public.check_ins(recipe_id);
CREATE INDEX IF NOT EXISTS idx_checkins_status ON public.check_ins(moderation_status);
CREATE INDEX IF NOT EXISTS idx_checkins_created ON public.check_ins(created_at DESC);

-- RLS Policies
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Users can view their own check-ins
CREATE POLICY "Users can view own check-ins" ON public.check_ins
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own check-ins
CREATE POLICY "Users can create own check-ins" ON public.check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view approved check-ins from others
CREATE POLICY "Users can view approved check-ins from others" ON public.check_ins
  FOR SELECT USING (moderation_status = 'approved');

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_checkins_updated_at ON public.check_ins;
CREATE TRIGGER trigger_checkins_updated_at
BEFORE UPDATE ON public.check_ins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to award points when check-in is approved
CREATE OR REPLACE FUNCTION award_checkin_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.moderation_status = 'approved' AND (OLD.moderation_status = 'pending' OR OLD.moderation_status IS NULL) THEN
    -- Update user points
    UPDATE public.users
    SET
      total_points = total_points + 10,
      updated_at = NOW()
    WHERE id = NEW.user_id;

    -- Record points in check-in
    NEW.points_earned := 10;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_award_points ON public.check_ins;
CREATE TRIGGER trigger_award_points
BEFORE UPDATE ON public.check_ins
FOR EACH ROW
EXECUTE FUNCTION award_checkin_points();
