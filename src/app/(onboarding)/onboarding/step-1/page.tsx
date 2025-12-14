'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step1Schema, type Step1Input } from '@/lib/validations/onboarding'
import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ArrowRight } from 'lucide-react'

export default function Step1Page() {
  const router = useRouter()
  const { data, updateStep1, setStep } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Input>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: data.name || '',
      age: data.age || undefined,
      height_cm: data.height_cm || undefined,
      current_weight_kg: data.current_weight_kg || undefined,
      goal_weight_kg: data.goal_weight_kg || undefined,
    },
  })

  const onSubmit = (formData: Step1Input) => {
    updateStep1(formData)
    setStep(2)
    router.push('/onboarding/step-2')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Etapa 1 de 3</span>
            <span className="text-sm font-medium text-green-600">33%</span>
          </div>
          <Progress value={33} className="h-2" />
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vamos Conhecer Você! 🎯
            </h1>
            <p className="text-gray-600">
              Precisamos de algumas informações básicas para criar seu plano personalizado
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Como você gostaria de ser chamada?"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Idade */}
            <div className="space-y-2">
              <Label htmlFor="age">Idade *</Label>
              <Input
                id="age"
                type="number"
                placeholder="Ex: 30"
                {...register('age')}
              />
              {errors.age && (
                <p className="text-sm text-red-500">{errors.age.message}</p>
              )}
            </div>

            {/* Grid - Altura e Peso Atual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height_cm">Altura (cm) *</Label>
                <Input
                  id="height_cm"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 165"
                  {...register('height_cm')}
                />
                {errors.height_cm && (
                  <p className="text-sm text-red-500">{errors.height_cm.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_weight_kg">Peso Atual (kg) *</Label>
                <Input
                  id="current_weight_kg"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 70"
                  {...register('current_weight_kg')}
                />
                {errors.current_weight_kg && (
                  <p className="text-sm text-red-500">{errors.current_weight_kg.message}</p>
                )}
              </div>
            </div>

            {/* Peso Meta */}
            <div className="space-y-2">
              <Label htmlFor="goal_weight_kg">Peso Meta (kg) *</Label>
              <Input
                id="goal_weight_kg"
                type="number"
                step="0.1"
                placeholder="Ex: 65"
                {...register('goal_weight_kg')}
              />
              {errors.goal_weight_kg && (
                <p className="text-sm text-red-500">{errors.goal_weight_kg.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Qual é o seu peso ideal? Vamos te ajudar a chegar lá!
              </p>
            </div>

            {/* Botão */}
            <Button type="submit" className="w-full" size="lg">
              Próxima Etapa
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Seus dados estão seguros e serão usados apenas para personalizar sua experiência
        </div>
      </div>
    </div>
  )
}
