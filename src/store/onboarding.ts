import { create } from 'zustand'

export interface OnboardingStep1 {
  name: string
  age: number | null
  height_cm: number | null
  current_weight_kg: number | null
  goal_weight_kg: number | null
}

export interface OnboardingStep2 {
  biological_sex: 'female' | 'male' | null
  activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active' | null
  health_conditions: string[]
  health_conditions_other: string
  main_goal: 'fast_weight_loss' | 'healthy_weight_loss' | 'maintain_energy' | 'improve_health' | null
  home_meals_per_week: number | null
}

export interface OnboardingStep3 {
  waist_cm: number | null
  hip_cm: number | null
  weight_change_pattern: 'gain_easily' | 'lose_easily' | 'stable' | 'yoyo' | null
  tried_restrictive_diets: boolean | null
  time_trying_to_lose_weight: 'less_3_months' | '3_6_months' | '6_12_months' | 'more_1_year' | null
  food_allergies: string[]
  food_allergies_other: string
}

export interface OnboardingData extends OnboardingStep1, OnboardingStep2, OnboardingStep3 {}

interface OnboardingStore {
  currentStep: 1 | 2 | 3
  data: Partial<OnboardingData>

  setStep: (step: 1 | 2 | 3) => void
  updateStep1: (data: Partial<OnboardingStep1>) => void
  updateStep2: (data: Partial<OnboardingStep2>) => void
  updateStep3: (data: Partial<OnboardingStep3>) => void
  reset: () => void
}

const initialData: Partial<OnboardingData> = {
  name: '',
  age: null,
  height_cm: null,
  current_weight_kg: null,
  goal_weight_kg: null,
  biological_sex: null,
  activity_level: null,
  health_conditions: [],
  health_conditions_other: '',
  main_goal: null,
  home_meals_per_week: null,
  waist_cm: null,
  hip_cm: null,
  weight_change_pattern: null,
  tried_restrictive_diets: null,
  time_trying_to_lose_weight: null,
  food_allergies: [],
  food_allergies_other: '',
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 1,
  data: initialData,

  setStep: (step) => set({ currentStep: step }),

  updateStep1: (stepData) =>
    set((state) => ({
      data: { ...state.data, ...stepData },
    })),

  updateStep2: (stepData) =>
    set((state) => ({
      data: { ...state.data, ...stepData },
    })),

  updateStep3: (stepData) =>
    set((state) => ({
      data: { ...state.data, ...stepData },
    })),

  reset: () => set({ currentStep: 1, data: initialData }),
}))
