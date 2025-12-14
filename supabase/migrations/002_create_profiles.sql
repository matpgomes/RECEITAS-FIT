-- User Profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Etapa 1: Vamos Conhecer Você
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
  height_cm DECIMAL(5,2) NOT NULL CHECK (height_cm > 0),
  current_weight_kg DECIMAL(5,2) NOT NULL CHECK (current_weight_kg > 0),
  goal_weight_kg DECIMAL(5,2) NOT NULL CHECK (goal_weight_kg > 0),

  -- Etapa 2: Seu Corpo e Hábitos
  biological_sex TEXT CHECK (biological_sex IN ('female', 'male')) NOT NULL,
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active')) NOT NULL,
  health_conditions TEXT[],
  health_conditions_other TEXT,
  main_goal TEXT CHECK (main_goal IN ('fast_weight_loss', 'healthy_weight_loss', 'maintain_energy', 'improve_health')),
  home_meals_per_week INTEGER CHECK (home_meals_per_week >= 0 AND home_meals_per_week <= 21),

  -- Etapa 3: Quase Lá!
  waist_cm DECIMAL(5,2) CHECK (waist_cm > 0),
  hip_cm DECIMAL(5,2) CHECK (hip_cm > 0),
  weight_change_pattern TEXT CHECK (weight_change_pattern IN ('gain_easily', 'lose_easily', 'stable', 'yoyo')),
  tried_restrictive_diets BOOLEAN,
  time_trying_to_lose_weight TEXT CHECK (time_trying_to_lose_weight IN ('less_3_months', '3_6_months', '6_12_months', 'more_1_year')),
  food_allergies TEXT[],
  food_allergies_other TEXT,

  -- Cálculos (auto-gerados)
  bmi DECIMAL(5,2),
  bmr DECIMAL(7,2),
  metabolic_age INTEGER,
  initial_metabolic_age INTEGER,
  body_fat_percentage DECIMAL(5,2),
  recommended_daily_calories INTEGER,

  -- Foto de perfil
  avatar_url TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para calcular métricas automaticamente
CREATE OR REPLACE FUNCTION calculate_user_metrics()
RETURNS TRIGGER AS $$
DECLARE
  height_m DECIMAL(5,2);
  bmr_value DECIMAL(7,2);
  activity_multiplier DECIMAL(3,2);
  rcq DECIMAL(4,2);
BEGIN
  -- Calcular IMC
  height_m := NEW.height_cm / 100;
  NEW.bmi := NEW.current_weight_kg / (height_m * height_m);

  -- Calcular TMB usando Harris-Benedict
  IF NEW.biological_sex = 'female' THEN
    bmr_value := 655.1 + (9.563 * NEW.current_weight_kg) + (1.850 * NEW.height_cm) - (4.676 * NEW.age);
  ELSE
    bmr_value := 66.47 + (13.75 * NEW.current_weight_kg) + (5.003 * NEW.height_cm) - (6.755 * NEW.age);
  END IF;
  NEW.bmr := bmr_value;

  -- Calcular calorias diárias recomendadas
  activity_multiplier := CASE NEW.activity_level
    WHEN 'sedentary' THEN 1.2
    WHEN 'light' THEN 1.375
    WHEN 'moderate' THEN 1.55
    WHEN 'very_active' THEN 1.725
    ELSE 1.2
  END;

  NEW.recommended_daily_calories := ROUND((bmr_value * activity_multiplier) * 0.8);

  -- Calcular % Gordura Corporal
  IF NEW.waist_cm IS NOT NULL AND NEW.hip_cm IS NOT NULL AND NEW.hip_cm > 0 THEN
    rcq := NEW.waist_cm / NEW.hip_cm;
    IF NEW.biological_sex = 'female' THEN
      NEW.body_fat_percentage := (1.20 * NEW.bmi) + (0.23 * NEW.age) - 5.4 + (rcq * 10);
    ELSE
      NEW.body_fat_percentage := (1.20 * NEW.bmi) + (0.23 * NEW.age) - 16.2 + (rcq * 10);
    END IF;
  ELSE
    IF NEW.biological_sex = 'female' THEN
      NEW.body_fat_percentage := (1.20 * NEW.bmi) + (0.23 * NEW.age) - 5.4;
    ELSE
      NEW.body_fat_percentage := (1.20 * NEW.bmi) + (0.23 * NEW.age) - 16.2;
    END IF;
  END IF;

  -- Calcular Idade Metabólica
  NEW.metabolic_age := NEW.age +
    CASE
      WHEN NEW.bmi < 18.5 THEN -2
      WHEN NEW.bmi >= 18.5 AND NEW.bmi < 25 THEN 0
      WHEN NEW.bmi >= 25 AND NEW.bmi < 30 THEN 3
      WHEN NEW.bmi >= 30 THEN 7
      ELSE 0
    END +
    CASE NEW.activity_level
      WHEN 'sedentary' THEN 5
      WHEN 'light' THEN 2
      WHEN 'moderate' THEN -1
      WHEN 'very_active' THEN -3
      ELSE 0
    END;

  -- Salvar idade metabólica inicial (apenas no INSERT)
  IF TG_OP = 'INSERT' THEN
    NEW.initial_metabolic_age := NEW.metabolic_age;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_metrics ON public.user_profiles;
CREATE TRIGGER trigger_calculate_metrics
BEFORE INSERT OR UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION calculate_user_metrics();

-- RLS Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
