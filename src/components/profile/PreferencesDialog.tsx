import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Leaf, Drumstick, Wheat, Milk } from 'lucide-react'

interface PreferencesDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onPreferencesUpdated: () => void
}

type DietaryPreference = 'vegetarian' | 'vegan' | 'gluten_free' | 'lactose_free'
type MeasurementUnit = 'metric' | 'imperial'

export function PreferencesDialog({
  isOpen,
  onOpenChange,
  onPreferencesUpdated
}: PreferencesDialogProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [selectedPreferences, setSelectedPreferences] = useState<DietaryPreference[]>([])
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('metric')

  useEffect(() => {
    if (isOpen) {
      loadPreferences()
    }
  }, [isOpen])

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('dietary_preferences, measurement_unit')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setSelectedPreferences(data.dietary_preferences || [])
        setMeasurementUnit(data.measurement_unit || 'metric')
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error)
    }
  }

  const togglePreference = (pref: DietaryPreference) => {
    setSelectedPreferences(prev =>
      prev.includes(pref)
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    )
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('users')
        .update({
          dietary_preferences: selectedPreferences,
          measurement_unit: measurementUnit
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Preferências atualizadas com sucesso!')
      onPreferencesUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      toast.error('Erro ao salvar preferências')
    } finally {
      setLoading(false)
    }
  }

  const preferences = [
    { id: 'vegetarian' as DietaryPreference, label: 'Vegetariano', icon: Leaf, color: 'text-green-600' },
    { id: 'vegan' as DietaryPreference, label: 'Vegano', icon: Leaf, color: 'text-green-700' },
    { id: 'gluten_free' as DietaryPreference, label: 'Sem Glúten', icon: Wheat, color: 'text-amber-600' },
    { id: 'lactose_free' as DietaryPreference, label: 'Sem Lactose', icon: Milk, color: 'text-blue-600' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Preferências</DialogTitle>
          <DialogDescription>
            Configure suas preferências alimentares e unidades de medida
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preferências Alimentares */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Preferências Alimentares</Label>
            <div className="grid grid-cols-2 gap-3">
              {preferences.map(pref => {
                const Icon = pref.icon
                const isSelected = selectedPreferences.includes(pref.id)

                return (
                  <button
                    key={pref.id}
                    onClick={() => togglePreference(pref.id)}
                    disabled={loading}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : pref.color}`} />
                    <span className="text-sm font-medium">{pref.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Unidades de Medida */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Unidades de Medida</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMeasurementUnit('metric')}
                disabled={loading}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  ${measurementUnit === 'metric'
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="text-sm font-medium">Métrico</div>
                <div className="text-xs text-muted-foreground">g, kg, ml, l</div>
              </button>
              <button
                onClick={() => setMeasurementUnit('imperial')}
                disabled={loading}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  ${measurementUnit === 'imperial'
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="text-sm font-medium">Imperial</div>
                <div className="text-xs text-muted-foreground">oz, lb, cup</div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
