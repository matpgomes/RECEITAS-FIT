'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step2Schema, type Step2Input } from '@/lib/validations/onboarding'
import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function Step2Page() {
  const router = useRouter()
  const { data, updateStep2, setStep } = useOnboardingStore()

  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    data.health_conditions || []
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2Input>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      biological_sex: data.biological_sex || undefined,
      activity_level: data.activity_level || undefined,
      health_conditions: data.health_conditions || [],
      health_conditions_other: data.health_conditions_other || '',
      main_goal: data.main_goal || undefined,
      home_meals_per_week: data.home_meals_per_week || undefined,
    },
  })

  const selectedSex = watch('biological_sex')
  const selectedActivity = watch('activity_level')
  const selectedGoal = watch('main_goal')

  const onSubmit = (formData: Step2Input) => {
    updateStep2({ ...formData, health_conditions: selectedConditions })
    setStep(3)
    router.push('/onboarding/step-3')
  }

  const handleBack = () => {
    setStep(1)
    router.push('/onboarding/step-1')
  }

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    )
  }

  const healthOptions = [
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'hypertension', label: 'Hipertensão' },
    { value: 'thyroid', label: 'Problemas de Tireoide' },
    { value: 'pcos', label: 'SOP (Síndrome dos Ovários Policísticos)' },
    { value: 'other', label: 'Outro' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Etapa 2 de 3</span>
            <span className="text-sm font-medium text-green-600">66%</span>
          </div>
          <Progress value={66} className="h-2" />
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Seu Corpo e Hábitos 💪
            </h1>
            <p className="text-gray-600">
              Vamos entender melhor seu estilo de vida
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Sexo Biológico */}
            <div className="space-y-3">
              <Label>Sexo Biológico *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('biological_sex', 'female')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSex === 'female'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">♀️</div>
                  <div className="font-medium">Feminino</div>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('biological_sex', 'male')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSex === 'male'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">♂️</div>
                  <div className="font-medium">Masculino</div>
                </button>
              </div>
              {errors.biological_sex && (
                <p className="text-sm text-red-500">{errors.biological_sex.message}</p>
              )}
            </div>

            {/* Nível de Atividade */}
            <div className="space-y-3">
              <Label>Nível de Atividade Física *</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'sedentary', emoji: '🛋️', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
                  { value: 'light', emoji: '🚶', label: 'Leve', desc: '1-3 dias/semana' },
                  { value: 'moderate', emoji: '🏃', label: 'Moderado', desc: '3-5 dias/semana' },
                  { value: 'very_active', emoji: '💪', label: 'Muito Ativo', desc: '6-7 dias/semana' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('activity_level', option.value as any)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedActivity === option.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </button>
                ))}
              </div>
              {errors.activity_level && (
                <p className="text-sm text-red-500">{errors.activity_level.message}</p>
              )}
            </div>

            {/* Condições de Saúde */}
            <div className="space-y-3">
              <Label>Condições de Saúde (opcional)</Label>
              <div className="space-y-2">
                {healthOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={selectedConditions.includes(option.value)}
                      onCheckedChange={() => toggleCondition(option.value)}
                    />
                    <label
                      htmlFor={option.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {selectedConditions.includes('other') && (
                <Input
                  placeholder="Especifique..."
                  {...register('health_conditions_other')}
                />
              )}
            </div>

            {/* Objetivo Principal */}
            <div className="space-y-3">
              <Label>Objetivo Principal (opcional)</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'fast_weight_loss', emoji: '⚡', label: 'Perda Rápida', desc: 'Resultados acelerados' },
                  { value: 'healthy_weight_loss', emoji: '🌱', label: 'Perda Saudável', desc: 'Ritmo sustentável' },
                  { value: 'maintain_energy', emoji: '✨', label: 'Manter Energia', desc: 'Foco em disposição' },
                  { value: 'improve_health', emoji: '❤️', label: 'Melhorar Saúde', desc: 'Bem-estar geral' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('main_goal', option.value as any)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedGoal === option.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Refeições em casa */}
            <div className="space-y-2">
              <Label htmlFor="home_meals_per_week">
                Quantas refeições você faz em casa por semana? (opcional)
              </Label>
              <Input
                id="home_meals_per_week"
                type="number"
                placeholder="Ex: 14 (2 por dia)"
                {...register('home_meals_per_week')}
              />
              <p className="text-xs text-gray-500">
                Isso nos ajuda a personalizar as receitas para você
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar
              </Button>
              <Button type="submit" className="flex-1" size="lg">
                Próxima Etapa
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
