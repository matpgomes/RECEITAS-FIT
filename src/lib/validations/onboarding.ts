import { z } from 'zod'

// Step 1: Vamos Conhecer Você
export const step1Schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  age: z.coerce.number()
    .min(18, 'Idade mínima: 18 anos')
    .max(120, 'Idade máxima: 120 anos'),
  height_cm: z.coerce.number()
    .min(100, 'Altura mínima: 100cm')
    .max(250, 'Altura máxima: 250cm'),
  current_weight_kg: z.coerce.number()
    .min(30, 'Peso mínimo: 30kg')
    .max(300, 'Peso máximo: 300kg'),
  goal_weight_kg: z.coerce.number()
    .min(30, 'Peso mínimo: 30kg')
    .max(300, 'Peso máximo: 300kg'),
})

// Step 2: Seu Corpo e Hábitos
export const step2Schema = z.object({
  biological_sex: z.enum(['female', 'male']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'very_active']),
  health_conditions: z.array(z.string()),
  health_conditions_other: z.string(),
  main_goal: z
    .enum(['fast_weight_loss', 'healthy_weight_loss', 'maintain_energy', 'improve_health'])
    .optional(),
  home_meals_per_week: z.coerce.number()
    .min(0, 'Mínimo: 0 refeições')
    .max(21, 'Máximo: 21 refeições')
    .optional(),
})

// Step 3: Quase Lá!
export const step3Schema = z.object({
  waist_cm: z.coerce.number()
    .min(40, 'Cintura mínima: 40cm')
    .max(200, 'Cintura máxima: 200cm')
    .optional(),
  hip_cm: z.coerce.number()
    .min(40, 'Quadril mínimo: 40cm')
    .max(200, 'Quadril máximo: 200cm')
    .optional(),
  weight_change_pattern: z
    .enum(['gain_easily', 'lose_easily', 'stable', 'yoyo'])
    .optional(),
  tried_restrictive_diets: z.boolean().optional(),
  time_trying_to_lose_weight: z
    .enum(['less_3_months', '3_6_months', '6_12_months', 'more_1_year'])
    .optional(),
  food_allergies: z.array(z.string()),
  food_allergies_other: z.string(),
})

// Schema completo
export const completeOnboardingSchema = step1Schema.merge(step2Schema).merge(step3Schema)

export type Step1Input = z.infer<typeof step1Schema>
export type Step2Input = z.infer<typeof step2Schema>
export type Step3Input = z.infer<typeof step3Schema>
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>
