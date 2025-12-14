'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step3Schema, type Step3Input } from '@/lib/validations/onboarding'
import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function Step3Page() {
  const router = useRouter()
  const { data, updateStep3, setStep } = useOnboardingStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    data.food_allergies || []
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step3Input>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      waist_cm: data.waist_cm || undefined,
      hip_cm: data.hip_cm || undefined,
      weight_change_pattern: data.weight_change_pattern || undefined,
      tried_restrictive_diets: data.tried_restrictive_diets || undefined,
      time_trying_to_lose_weight: data.time_trying_to_lose_weight || undefined,
      food_allergies: data.food_allergies || [],
      food_allergies_other: data.food_allergies_other || '',
    },
  })

  const selectedPattern = watch('weight_change_pattern')
  const selectedTime = watch('time_trying_to_lose_weight')
  const triedDiets = watch('tried_restrictive_diets')

  const onSubmit = async (formData: Step3Input) => {
    setIsSubmitting(true)

    try {
      // Atualizar store com dados do Step 3
      updateStep3({ ...formData, food_allergies: selectedAllergies })

      // Combinar todos os dados
      const completeData = {
        ...data,
        ...formData,
        food_allergies: selectedAllergies,
      }

      // Enviar para API
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar perfil')
      }

      const result = await response.json()

      toast.success('Perfil criado com sucesso! 🎉')

      // Redirecionar para resultados
      router.push('/onboarding/results')
    } catch (error: any) {
      console.error('Error completing onboarding:', error)
      toast.error(error.message || 'Erro ao completar onboarding')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep(2)
    router.push('/onboarding/step-2')
  }

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    )
  }

  const allergyOptions = [
    { value: 'lactose', label: 'Lactose' },
    { value: 'gluten', label: 'Glúten' },
    { value: 'nuts', label: 'Oleaginosas (castanhas, nozes)' },
    { value: 'shellfish', label: 'Frutos do mar' },
    { value: 'eggs', label: 'Ovos' },
    { value: 'soy', label: 'Soja' },
    { value: 'other', label: 'Outro' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Etapa 3 de 3</span>
            <span className="text-sm font-medium text-green-600">100%</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quase Lá! 🎉
            </h1>
            <p className="text-gray-600">
              Últimas informações para personalizar sua experiência
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Medidas (opcional) */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Medidas Corporais (opcional)
              </Label>
              <p className="text-sm text-gray-500">
                Essas medidas nos ajudam a calcular sua composição corporal
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waist_cm">Cintura (cm)</Label>
                  <Input
                    id="waist_cm"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 80"
                    {...register('waist_cm')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hip_cm">Quadril (cm)</Label>
                  <Input
                    id="hip_cm"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 95"
                    {...register('hip_cm')}
                  />
                </div>
              </div>
            </div>

            {/* Padrão de Mudança de Peso */}
            <div className="space-y-3">
              <Label>Como seu peso costuma se comportar? (opcional)</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'gain_easily', emoji: '📈', label: 'Ganho Fácil', desc: 'Engordo facilmente' },
                  { value: 'lose_easily', emoji: '📉', label: 'Perda Fácil', desc: 'Emagreço com facilidade' },
                  { value: 'stable', emoji: '➡️', label: 'Estável', desc: 'Peso constante' },
                  { value: 'yoyo', emoji: '🎢', label: 'Efeito Sanfona', desc: 'Varia muito' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('weight_change_pattern', option.value as any)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPattern === option.value
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

            {/* Dietas Restritivas */}
            <div className="space-y-3">
              <Label>Já tentou dietas muito restritivas? (opcional)</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setValue('tried_restrictive_diets', true)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    triedDiets === true
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Sim</div>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('tried_restrictive_diets', false)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    triedDiets === false
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Não</div>
                </button>
              </div>
            </div>

            {/* Tempo Tentando Perder Peso */}
            <div className="space-y-3">
              <Label>Há quanto tempo tenta perder peso? (opcional)</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'less_3_months', label: 'Menos de 3 meses' },
                  { value: '3_6_months', label: '3-6 meses' },
                  { value: '6_12_months', label: '6-12 meses' },
                  { value: 'more_1_year', label: 'Mais de 1 ano' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('time_trying_to_lose_weight', option.value as any)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTime === option.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Alergias Alimentares */}
            <div className="space-y-3">
              <Label>Alergias ou Restrições Alimentares (opcional)</Label>
              <div className="space-y-2">
                {allergyOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`allergy-${option.value}`}
                      checked={selectedAllergies.includes(option.value)}
                      onCheckedChange={() => toggleAllergy(option.value)}
                    />
                    <label
                      htmlFor={`allergy-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {selectedAllergies.includes('other') && (
                <Input
                  placeholder="Especifique suas alergias..."
                  {...register('food_allergies_other')}
                />
              )}
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                size="lg"
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar
              </Button>
              <Button type="submit" className="flex-1" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Concluir'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
