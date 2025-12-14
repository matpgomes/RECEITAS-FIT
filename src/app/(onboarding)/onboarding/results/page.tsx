'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, TrendingDown, Flame, Activity, Target } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  name: string
  bmi: number
  bmr: number
  metabolic_age: number
  initial_metabolic_age: number
  body_fat_percentage: number
  recommended_daily_calories: number
  goal_weight_kg: number
  current_weight_kg: number
}

export default function ResultsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        toast.error('Erro ao carregar resultados')
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erro ao carregar resultados')
    } finally {
      setIsLoading(false)
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-600' }
    if (bmi < 25) return { label: 'Peso normal', color: 'text-green-600' }
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600' }
    return { label: 'Obesidade', color: 'text-red-600' }
  }

  const getBodyFatCategory = (percentage: number, isFemale: boolean = true) => {
    if (isFemale) {
      if (percentage < 14) return { label: 'Atleta', color: 'text-blue-600' }
      if (percentage < 21) return { label: 'Fitness', color: 'text-green-600' }
      if (percentage < 25) return { label: 'Normal', color: 'text-green-600' }
      if (percentage < 32) return { label: 'Acima', color: 'text-yellow-600' }
      return { label: 'Obesidade', color: 'text-red-600' }
    } else {
      if (percentage < 6) return { label: 'Atleta', color: 'text-blue-600' }
      if (percentage < 14) return { label: 'Fitness', color: 'text-green-600' }
      if (percentage < 18) return { label: 'Normal', color: 'text-green-600' }
      if (percentage < 25) return { label: 'Acima', color: 'text-yellow-600' }
      return { label: 'Obesidade', color: 'text-red-600' }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Calculando suas métricas...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Erro ao carregar perfil</p>
          <Button onClick={() => router.push('/onboarding/step-1')}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  const bmiCategory = getBMICategory(profile.bmi)
  const fatCategory = getBodyFatCategory(profile.body_fat_percentage)
  const weightToLose = profile.current_weight_kg - profile.goal_weight_kg

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Seu Perfil Está Pronto, {profile.name}! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Calculamos suas métricas personalizadas
          </p>
        </div>

        {/* Métricas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* IMC */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-700">IMC</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {profile.bmi.toFixed(1)}
                </p>
                <p className={`text-sm font-medium ${bmiCategory.color}`}>
                  {bmiCategory.label}
                </p>
              </div>
            </div>
          </Card>

          {/* Idade Metabólica */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-700">Idade Metabólica</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {profile.metabolic_age} anos
                </p>
                <p className="text-sm text-gray-500">
                  Vamos reduzir isso juntas!
                </p>
              </div>
            </div>
          </Card>

          {/* Taxa Metabólica Basal */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-700">TMB</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(profile.bmr)} kcal
                </p>
                <p className="text-sm text-gray-500">
                  Calorias queimadas em repouso
                </p>
              </div>
            </div>
          </Card>

          {/* Calorias Recomendadas */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-700">Meta Diária</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {profile.recommended_daily_calories} kcal
                </p>
                <p className="text-sm text-gray-500">
                  Para alcançar seu objetivo
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gordura Corporal */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">
                Percentual de Gordura Corporal
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {profile.body_fat_percentage.toFixed(1)}%
                </span>
                <span className={`text-sm font-medium ${fatCategory.color}`}>
                  {fatCategory.label}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Seu Objetivo */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <h3 className="font-semibold text-gray-900 mb-3 text-lg">
            Seu Objetivo 🎯
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Peso atual:</span>
              <span className="font-semibold">{profile.current_weight_kg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Peso meta:</span>
              <span className="font-semibold">{profile.goal_weight_kg} kg</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-700 font-medium">A perder:</span>
              <span className="font-bold text-green-600">{weightToLose.toFixed(1)} kg</span>
            </div>
          </div>
        </Card>

        {/* Próximos Passos */}
        <Card className="p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3 text-lg">
            Próximos Passos ✨
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Receitas personalizadas baseadas nas suas necessidades</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Acompanhamento diário da sua evolução</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Lista de compras inteligente gerada por IA</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Sistema de pontos e badges para te motivar</span>
            </li>
          </ul>
        </Card>

        {/* Botão */}
        <Button
          onClick={() => router.push('/home')}
          className="w-full"
          size="lg"
        >
          Começar Minha Jornada! 🚀
        </Button>
      </div>
    </div>
  )
}
