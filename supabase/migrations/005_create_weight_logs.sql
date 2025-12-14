-- Weight Logs table
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON public.weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_logged_at ON public.weight_logs(logged_at DESC);

-- RLS Policies
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own weight logs
CREATE POLICY "Users can view own weight logs" ON public.weight_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own weight logs
CREATE POLICY "Users can insert own weight logs" ON public.weight_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete weight logs (historical data)
-- If needed, admins can handle this via service role

-- Trigger to update current_weight_kg in user_profiles when new weight is logged
CREATE OR REPLACE FUNCTION update_current_weight()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET current_weight_kg = NEW.weight_kg,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_current_weight ON public.weight_logs;
CREATE TRIGGER trigger_update_current_weight
AFTER INSERT ON public.weight_logs
FOR EACH ROW
EXECUTE FUNCTION update_current_weight();
