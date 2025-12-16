'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, ChevronDown, ChevronUp, Clock, Heart, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { useInfiniteRecipes, useFavoriteRecipes } from '@/hooks/useRecipes'
import { getMultipleRecipeRatingStats } from '@/lib/supabase/queries/recipes'
import { useQuery } from '@tanstack/react-query'
import type { Recipe } from '@/types/recipe'

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [maxPrepTime, setMaxPrepTime] = useState<number | null>(null)
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

  // Filtros ativos para a query otimizada
  const activeFilters = useMemo(() => ({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    maxPrepTime: maxPrepTime || undefined,
    searchQuery: searchQuery || undefined,
  }), [selectedCategory, maxPrepTime, searchQuery])

  // Paginação de receitas - 10 por vez, filtradas no server
  const {
    recipes,
    loading,
    loadMore,
    hasMore,
    isLoadingMore,
  } = useInfiniteRecipes(activeFilters)

  // Favoritos separado
  const { recipes: favoriteRecipes, toggleFavorite } = useFavoriteRecipes()
  const favoriteIds = new Set(favoriteRecipes.map(r => r.id))
  const isFavorite = (id: string) => favoriteIds.has(id)

  // Ratings para receitas carregadas
  const recipeIds = recipes.map((r) => r.id)
  const { data: ratingStats = {} } = useQuery({
    queryKey: ['ratings', recipeIds],
    queryFn: () => getMultipleRecipeRatingStats(recipeIds),
    enabled: recipeIds.length > 0,
    staleTime: 10 * 60 * 1000,
  })
  const getRecipeStats = (id: string) => ratingStats[id] || { averageRating: 0, totalReviews: 0 }

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    recipes.forEach((recipe) => {
      if (recipe.category) {
        cats.add(recipe.category)
      }
    })
    return ['all', ...Array.from(cats)]
  }, [recipes])

  // Se mostrar apenas favoritos, filtra localmente a lista de favoritos
  // Se não, usa as receitas paginadas vindas do servidor (já filtradas) - removendo lógica duplicada client-side
  const displayedRecipes = useMemo(() => {
    if (showOnlyFavorites) {
      let filtered = favoriteRecipes

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(r => r.category === selectedCategory)
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(r =>
          r.title.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query))
        )
      }

      if (maxPrepTime) {
        filtered = filtered.filter(r => r.prep_time_minutes <= maxPrepTime)
      }

      return filtered
    }

    return recipes
  }, [showOnlyFavorites, favoriteRecipes, recipes, selectedCategory, searchQuery, maxPrepTime])

  // Count active filters
  const activeFiltersCount = [
    selectedCategory !== 'all',
    maxPrepTime !== null,
    showOnlyFavorites
  ].filter(Boolean).length

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('all')
    setMaxPrepTime(null)
    setShowOnlyFavorites(false)
    setSearchQuery('')
  }



  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-primary">
          Receitas Fit
        </h1>
        <p className="text-muted-foreground">
          Descubra receitas deliciosas e saudáveis
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar receitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={filtersExpanded || (activeFiltersCount - (showOnlyFavorites ? 1 : 0) > 0) ? "default" : "outline"}
          size="icon"
          className={`shrink-0 relative ${(filtersExpanded || (activeFiltersCount - (showOnlyFavorites ? 1 : 0) > 0)) ? 'bg-primary text-white' : 'border-primary text-primary hover:bg-primary/5'}`}
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <Filter className="h-4 w-4" />
          {/* Subtrai 1 se favoritos estiver ativo, pois agora é controle separado */}
          {(activeFiltersCount - (showOnlyFavorites ? 1 : 0)) > 0 && (
            <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {activeFiltersCount - (showOnlyFavorites ? 1 : 0)}
            </span>
          )}
        </Button>

        <Button
          variant={showOnlyFavorites ? "default" : "outline"}
          size="icon"
          className={`shrink-0 ${showOnlyFavorites ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : 'border-primary text-primary hover:bg-primary/5'}`}
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          title={showOnlyFavorites ? "Ver Todas" : "Ver Favoritas"}
        >
          <Heart className={`h-4 w-4 ${showOnlyFavorites ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {filtersExpanded && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Filtros Avançados</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
                <X className="h-3 w-3 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Tempo Máximo */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Tempo máximo
              </label>
              <div className="flex gap-1 flex-wrap">
                {[15, 30, 45, 60].map((time) => (
                  <Button
                    key={time}
                    variant={maxPrepTime === time ? "default" : "outline"}
                    size="sm"
                    className={`text-xs h-7 px-2 ${maxPrepTime === time ? 'bg-primary' : ''}`}
                    onClick={() => setMaxPrepTime(maxPrepTime === time ? null : time)}
                  >
                    {time}min
                  </Button>
                ))}
              </div>
            </div>

            {/* Favoritos removido daqui em favor do botão na toolbar */}
          </div>
        </Card>
      )}

      {/* Category Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 justify-between max-w-xs"
            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
          >
            <span>{selectedCategory === 'all' ? 'Todas' : selectedCategory}</span>
            {categoriesExpanded ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
        </div>

        {categoriesExpanded && categories.length > 1 && (
          <Card className="p-2 max-w-xs">
            <div className="flex flex-col gap-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  className={selectedCategory === category ? "justify-start bg-primary hover:bg-primary/90 text-white" : "justify-start"}
                  onClick={() => {
                    setSelectedCategory(category)
                    setCategoriesExpanded(false)
                  }}
                >
                  {category === 'all' ? 'Todas' : category}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Recipes Content */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 animate-pulse bg-muted" />
            ))}
          </div>
        ) : displayedRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhuma receita encontrada
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRecipes.map((recipe) => {
                const stats = getRecipeStats(recipe.id)
                return (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isFavorite={isFavorite(recipe.id)}
                    onToggleFavorite={toggleFavorite}
                    averageRating={stats.averageRating}
                    totalReviews={stats.totalReviews}
                  />
                )
              })}
            </div>

            {/* Botão Ver Mais Receitas (Apenas se não estiver no modo favoritos e tiver mais) */}
            {hasMore && !showOnlyFavorites && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => loadMore()}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px] border-primary text-primary hover:bg-primary hover:text-white"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    'Ver Mais Receitas'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  )
}
