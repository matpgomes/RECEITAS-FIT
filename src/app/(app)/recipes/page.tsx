'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { useRecipesWithMetadata } from '@/hooks/useRecipes'
import type { Recipe } from '@/types/recipe'

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)

  // Unified hook: recipes + favorites + ratings in one call
  const {
    recipes,
    loading,
    toggleFavorite,
    isFavorite,
    getRecipeStats,
  } = useRecipesWithMetadata()

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

  // Filter recipes based on search and category
  const filteredRecipes = useMemo(() => {
    let filtered = recipes

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((r) => r.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [recipes, selectedCategory, searchQuery])

  // Get favorite recipes for display
  const favoriteRecipes = useMemo(() => {
    return recipes.filter((r) => isFavorite(r.id))
  }, [recipes, isFavorite])

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
        <Button variant="outline" size="icon" className="shrink-0 border-primary text-primary hover:bg-primary/5">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

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
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma receita encontrada
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => {
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
          )}
      </div>

      {/* Favorites Section */}
      {favoriteRecipes.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Minhas Favoritas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRecipes.slice(0, 3).map((recipe) => {
              const stats = getRecipeStats(recipe.id)
              return (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  averageRating={stats.averageRating}
                  totalReviews={stats.totalReviews}
                />
              )
            })}
          </div>
          {favoriteRecipes.length > 3 && (
            <div className="text-center mt-6">
              <Button variant="outline" asChild>
                <a href="/favorites">Ver Todas as Favoritas</a>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
