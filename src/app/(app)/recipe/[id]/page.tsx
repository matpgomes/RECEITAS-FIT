'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Heart, Clock, Flame, Users, ArrowLeft, PlayCircle, Camera, ShoppingCart, Minus, Plus, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRecipe, useFavoriteRecipes } from '@/hooks/useRecipes'
import { useCheckIns } from '@/hooks/useCheckIns'
import { RecipeCheckIns } from '@/components/recipes/RecipeCheckIns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [servings, setServings] = useState(4)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [checkingCheckIn, setCheckingCheckIn] = useState(true)

  const { recipe, loading } = useRecipe(recipeId)
  const { recipes: favoriteRecipes, toggleFavorite } = useFavoriteRecipes()
  const { hasUserCheckedIn } = useCheckIns()

  // Check if recipe is favorited and set initial servings
  useEffect(() => {
    if (recipe) {
      const isFavorited = favoriteRecipes.some((r) => r.id === recipe.id)
      setIsLiked(isFavorited)
      setServings(recipe.serves_people)
    }
  }, [recipe, favoriteRecipes])

  // Check if user has already checked in
  useEffect(() => {
    const checkUserCheckIn = async () => {
      if (recipeId) {
        setCheckingCheckIn(true)
        const hasChecked = await hasUserCheckedIn(recipeId)
        setHasCheckedIn(hasChecked)
        setCheckingCheckIn(false)
      }
    }

    checkUserCheckIn()
  }, [recipeId])

  // Calculate multiplier for servings adjustment
  const servingsMultiplier = recipe ? servings / recipe.serves_people : 1

  // Adjust ingredient quantities based on servings
  const adjustedIngredients = recipe?.ingredients.map((ingredient) => {
    // Parse quantity and adjust
    const quantityMatch = ingredient.quantity.match(/^([\d.,]+)/)
    if (quantityMatch) {
      const originalQty = parseFloat(quantityMatch[1].replace(',', '.'))
      const adjustedQty = (originalQty * servingsMultiplier).toFixed(1)
      const newQuantity = ingredient.quantity.replace(quantityMatch[1], adjustedQty)
      return { ...ingredient, quantity: newQuantity }
    }
    return ingredient
  }) || []

  const handleIncreaseServings = () => {
    if (servings < 20) setServings(servings + 1)
  }

  const handleDecreaseServings = () => {
    if (servings > 1) setServings(servings - 1)
  }

  const handleAddToShoppingList = async () => {
    if (!recipe) return

    try {
      // Mostrar loading toast com animação
      const loadingToast = toast.loading('📝 Adicionando ingredientes à lista...', {
        description: `${recipe.ingredients.length} ingredientes sendo processados`
      })

      // Importar função de adicionar à draft
      const { addRecipeToDraft } = await import('@/lib/supabase/queries/shopping-list')

      // Adicionar receita à lista draft
      await addRecipeToDraft(recipe.id, servings)

      // Dismiss loading e mostrar sucesso
      toast.dismiss(loadingToast)
      toast.success('✅ Ingredientes adicionados!', {
        description: 'Redirecionando para sua lista...'
      })

      // Aguardar um pouco para o usuário ver a mensagem
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirecionar para a página de shopping-list (que vai mostrar a draft)
      router.push('/shopping-list')
    } catch (error) {
      console.error('Error adding to shopping list:', error)
      toast.error('Erro ao adicionar à lista. Tente novamente.')
    }
  }

  const handleCheckIn = () => {
    if (!recipe) return
    router.push(`/checkin/${recipe.id}`)
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container max-w-4xl mx-auto p-4 text-center">
        <p className="text-muted-foreground">Receita não encontrada</p>
        <Button onClick={() => router.push('/recipes')} className="mt-4">
          Ver Receitas
        </Button>
      </div>
    )
  }

  const handleToggleFavorite = async () => {
    if (!recipe || isLoading) return

    const previousState = isLiked
    setIsLiked(!isLiked)
    setIsLoading(true)

    try {
      await toggleFavorite(recipe.id, previousState)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      setIsLiked(previousState)
    } finally {
      setIsLoading(false)
    }
  }

  const slides = [
    { id: 'ingredients', title: 'Ingredientes' },
    { id: 'preparation', title: 'Modo de Preparo' },
    { id: 'steps', title: 'Passo a Passo' },
  ]

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else if (currentSlide === 2 && currentStep < recipe.preparation_steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentSlide === 2 && currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const progress = currentSlide === 2
    ? ((currentStep + 1) / recipe.preparation_steps.length) * 100
    : ((currentSlide + 1) / slides.length) * 100

  const isLastStep = currentSlide === 2 && currentStep === recipe.preparation_steps.length - 1

  const handleComplete = () => {
    setIsDialogOpen(false)
    // Reset to beginning for next time
    setCurrentSlide(0)
    setCurrentStep(0)
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      {/* Recipe Image with Favorite Button */}
      <div className="relative w-full h-72 md:h-96 rounded-lg overflow-hidden">
        <Image
          src={recipe.image_url}
          alt={recipe.title}
          fill
          className="object-cover"
          style={{ objectPosition: 'center center' }}
          priority
          quality={85}
        />

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-3 right-3 rounded-full bg-white/90 hover:bg-white',
            'transition-colors duration-200',
            isLiked && 'text-red-500'
          )}
          onClick={handleToggleFavorite}
          disabled={isLoading}
        >
          <Heart
            key={isLiked ? 'liked' : 'not-liked'}
            className={cn(
              'h-5 w-5',
              isLiked && 'fill-current animate-heart-beat'
            )}
          />
        </Button>
      </div>

      {/* Recipe Title */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-muted-foreground">{recipe.description}</p>
        )}
      </div>

      {/* Recipe Info */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm">
            <strong>{recipe.prep_time_minutes}</strong> minutos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm">
            <strong>{recipe.serves_people}</strong> porções
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="text-sm">
            <strong>{recipe.calories_fit}</strong> cal
            {recipe.calories_saved > 0 && (
              <span className="text-green-600 ml-1">
                (economiza {recipe.calories_saved} cal)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Servings Adjuster */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Porções:</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleDecreaseServings}
                disabled={servings <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-bold w-12 text-center">{servings}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleIncreaseServings}
                disabled={servings >= 20}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {servings !== recipe.serves_people && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Receita original: {recipe.serves_people} porções
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          variant="outline"
          onClick={handleAddToShoppingList}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Adicionar à Lista
        </Button>
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          <PlayCircle className="h-5 w-5 mr-2" />
          Iniciar Receita
        </Button>
      </div>

      {/* Check-in Button */}
      {hasCheckedIn ? (
        <Button
          size="lg"
          variant="outline"
          className="w-full border-2 border-green-500 text-green-700 hover:bg-green-50"
          disabled
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          CHECK-IN CONCLUÍDO
        </Button>
      ) : (
        <Button
          size="lg"
          variant="outline"
          className="w-full border-2 border-purple-500 text-purple-700 hover:bg-purple-50"
          onClick={handleCheckIn}
          disabled={checkingCheckIn}
        >
          <Camera className="h-5 w-5 mr-2" />
          {checkingCheckIn ? 'Verificando...' : 'Fazer Check-in da Receita'}
        </Button>
      )}

      {/* Community Check-ins */}
      <RecipeCheckIns recipeId={recipeId} />

      {/* Recipe Steps Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-2xl max-w-[calc(100%-2rem)] animate-dialog-in"
          style={{
            paddingLeft: '10px',
            paddingRight: '10px'
          }}
        >
          <DialogHeader>
            <DialogTitle>{slides[currentSlide].title}</DialogTitle>
          </DialogHeader>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {currentSlide === 2
                  ? `Passo ${currentStep + 1} de ${recipe.preparation_steps.length}`
                  : `${currentSlide + 1} de ${slides.length}`}
              </span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Content with fixed height and scroll */}
          <div className="py-4 min-h-[400px] max-h-[400px] overflow-y-auto pr-2">
            {/* Slide 1: Ingredients */}
            {currentSlide === 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Para {servings} {servings === 1 ? 'porção' : 'porções'}
                  </p>
                  {servings !== recipe.serves_people && (
                    <p className="text-xs text-green-600 font-medium">
                      Quantidades ajustadas
                    </p>
                  )}
                </div>
                <ul className="space-y-3">
                  {adjustedIngredients.map((ingredient, index) => (
                    <li key={index} className="flex gap-3">
                      <div className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{ingredient.item}</div>
                        <div className="text-sm text-muted-foreground">
                          {ingredient.quantity}
                          {ingredient.notes && ` - ${ingredient.notes}`}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Slide 2: Full Preparation */}
            {currentSlide === 1 && (
              <div className="space-y-4">
                <p className="text-base leading-relaxed whitespace-pre-line">
                  {recipe.preparation_full}
                </p>
              </div>
            )}

            {/* Slide 3: Step by Step */}
            {currentSlide === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">
                    Passo {currentStep + 1}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {recipe.preparation_steps[currentStep].time_minutes} min
                  </span>
                </div>
                <h4 className="text-lg font-semibold">
                  {recipe.preparation_steps[currentStep].title}
                </h4>
                <p className="text-base leading-relaxed">
                  {recipe.preparation_steps[currentStep].description}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handlePrev}
              disabled={currentSlide === 0 && currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            {isLastStep ? (
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleComplete}
              >
                Concluir
              </Button>
            ) : (
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleNext}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
