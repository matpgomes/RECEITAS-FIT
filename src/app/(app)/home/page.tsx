'use client'

import { useState, useEffect } from 'react'
import { format, addDays, subDays, isToday, isFuture, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { AchievementCard } from '@/components/shared/AchievementCard'
import { MiniCalendar } from '@/components/ui/mini-calendar'
import { useRecipesByDateRange, useSelectedRecipes } from '@/hooks/useRecipes'
import { getRecipeRatingStats } from '@/lib/supabase/queries/recipes'
import { Recipe } from '@/types/recipe'
import { Lock } from 'lucide-react'

export default function HomePage() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [ratingStats, setRatingStats] = useState<{ averageRating: number; totalReviews: number }>({
    averageRating: 0,
    totalReviews: 0,
  })

  // Generate date range for fetching (matches calendar range: -10 to +10 days)
  const startDate = format(subDays(today, 10), 'yyyy-MM-dd')
  const endDate = format(addDays(today, 10), 'yyyy-MM-dd')

  // Fetch recipes for the range
  const { recipes: weekRecipes, loading: loadingRecipes } = useRecipesByDateRange(startDate, endDate)

  // Fetch user's selected recipes
  const { selectedRecipes, loading: loadingSelected } = useSelectedRecipes(startDate, endDate)

  // Get recipe for a specific day
  const getRecipeForDay = (day: Date): Recipe | undefined => {
    const dayStr = format(day, 'yyyy-MM-dd')

    // Check if user has selected a recipe for this day
    if (selectedRecipes.has(dayStr)) {
      return selectedRecipes.get(dayStr)
    }

    // Otherwise, check if there's a featured recipe for this day
    return weekRecipes.find((r) => r.featured_date === dayStr)
  }

  const selectedRecipe = getRecipeForDay(selectedDate)
  const loading = loadingRecipes || loadingSelected

  // Fetch rating stats for selected recipe
  useEffect(() => {
    const fetchRating = async () => {
      if (selectedRecipe) {
        const stats = await getRecipeRatingStats(selectedRecipe.id)
        setRatingStats(stats)
      } else {
        setRatingStats({ averageRating: 0, totalReviews: 0 })
      }
    }

    fetchRating()
  }, [selectedRecipe])

  // Check if a date has a recipe
  const hasRecipe = (date: Date): boolean => {
    return !!getRecipeForDay(date)
  }

  // Check if selected date is in the future (after today)
  const isDateInFuture = isFuture(startOfDay(selectedDate)) && !isToday(selectedDate)

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Suas Receitas
          </h1>
          <p className="text-sm text-muted-foreground">
            Planeje suas refeições saudáveis
          </p>
        </div>
      </div>

      {/* Achievement Card */}
      <AchievementCard checkins={0} nextMilestone={10} />

      {/* Mini Calendar */}
      <MiniCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        hasRecipe={hasRecipe}
      />

      {/* Recipe of the Selected Day */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {isToday(selectedDate) ? 'Receita de Hoje' : `Receita do Dia ${format(selectedDate, 'dd/MM')}`}
        </h2>

        {loading ? (
          <Card className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-48 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </Card>
        ) : isDateInFuture && selectedRecipe ? (
          <Card className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-dashed">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Receita Bloqueada</h3>
                <p className="text-muted-foreground">
                  Esta receita será liberada em{' '}
                  <span className="font-semibold text-foreground">
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Volte neste dia para acessar a receita completa!
                </p>
              </div>
              <Button asChild variant="default" className="mt-4">
                <a href="/recipes">Explorar Outras Receitas</a>
              </Button>
            </div>
          </Card>
        ) : selectedRecipe ? (
          <RecipeCard
            recipe={selectedRecipe}
            averageRating={ratingStats.averageRating}
            totalReviews={ratingStats.totalReviews}
            className="max-w-sm"
          />
        ) : (
          <Card className="p-8">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                {isDateInFuture
                  ? 'Nenhuma receita programada para este dia futuro'
                  : 'Nenhuma receita programada para este dia'}
              </p>
              {!isDateInFuture && (
                <Button asChild variant="outline">
                  <a href={`/recipes?date=${format(selectedDate, 'yyyy-MM-dd')}`}>
                    Escolher Receita
                  </a>
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
          <a href="/recipes">Ver Receitas</a>
        </Button>
        <Button asChild size="sm" variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary/10">
          <a href="/shopping-list">Lista</a>
        </Button>
      </div>
    </div>
  )
}
