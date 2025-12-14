'use client'

import { useState, useEffect } from 'react'
import {
  getRecipes,
  getRecipeById,
  getRecipeOfTheDay,
  getRecipesByDateRange,
  getUserFavoriteRecipes,
  getUserSelectedRecipes,
  addFavoriteRecipe,
  removeFavoriteRecipe,
  selectRecipeForDate,
  removeSelectedRecipe,
} from '@/lib/supabase/queries/recipes'
import type { Recipe, RecipeFilters } from '@/types/recipe'
import { toast } from 'sonner'

export function useRecipes(filters?: RecipeFilters) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true)
        const data = await getRecipes(filters)
        setRecipes(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
        toast.error('Erro ao carregar receitas')
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [filters])

  return { recipes, loading, error }
}

export function useRecipe(id: string) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true)
        const data = await getRecipeById(id)
        setRecipe(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
        toast.error('Erro ao carregar receita')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRecipe()
    }
  }, [id])

  return { recipe, loading, error }
}

export function useRecipeOfTheDay() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true)
        const data = await getRecipeOfTheDay()
        setRecipe(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
        toast.error('Erro ao carregar receita do dia')
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [])

  return { recipe, loading, error }
}

export function useRecipesByDateRange(startDate: string, endDate: string) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true)
        const data = await getRecipesByDateRange(startDate, endDate)
        setRecipes(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
        toast.error('Erro ao carregar receitas')
      } finally {
        setLoading(false)
      }
    }

    if (startDate && endDate) {
      fetchRecipes()
    }
  }, [startDate, endDate])

  return { recipes, loading, error }
}

export function useFavoriteRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const data = await getUserFavoriteRecipes()
      setRecipes(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
      toast.error('Erro ao carregar favoritos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  const toggleFavorite = async (recipeId: string, isFavorited: boolean) => {
    try {
      if (isFavorited) {
        // Optimistically remove from favorites
        setRecipes(prev => prev.filter(r => r.id !== recipeId))
        await removeFavoriteRecipe(recipeId)
        toast.success('Receita removida dos favoritos')
      } else {
        // Optimistically add to favorites - fetch the recipe data
        const { getRecipeById } = await import('@/lib/supabase/queries/recipes')
        const recipe = await getRecipeById(recipeId)
        setRecipes(prev => [recipe, ...prev])
        await addFavoriteRecipe(recipeId)
        toast.success('Receita adicionada aos favoritos')
      }
    } catch (err) {
      toast.error('Erro ao atualizar favoritos')
      // Revert by fetching fresh data
      await fetchFavorites()
      throw err
    }
  }

  return { recipes, loading, error, toggleFavorite, refetch: fetchFavorites }
}

export function useSelectedRecipes(startDate: string, endDate: string) {
  const [selectedRecipes, setSelectedRecipes] = useState<Map<string, Recipe>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSelectedRecipes = async () => {
    try {
      setLoading(true)
      const data = await getUserSelectedRecipes(startDate, endDate)

      // Convert array to Map for easy lookup by date
      const recipesMap = new Map<string, Recipe>()
      data.forEach((item) => {
        recipesMap.set(item.selected_date, item.recipes)
      })

      setSelectedRecipes(recipesMap)
      setError(null)
    } catch (err) {
      setError(err as Error)
      toast.error('Erro ao carregar receitas selecionadas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (startDate && endDate) {
      fetchSelectedRecipes()
    }
  }, [startDate, endDate])

  const selectRecipe = async (recipeId: string, date: string) => {
    try {
      await selectRecipeForDate(recipeId, date)
      toast.success('Receita adicionada ao calendário')
      await fetchSelectedRecipes()
    } catch (err) {
      toast.error('Erro ao selecionar receita')
    }
  }

  const removeRecipe = async (date: string) => {
    try {
      await removeSelectedRecipe(date)
      toast.success('Receita removida do calendário')
      await fetchSelectedRecipes()
    } catch (err) {
      toast.error('Erro ao remover receita')
    }
  }

  return {
    selectedRecipes,
    loading,
    error,
    selectRecipe,
    removeRecipe,
    refetch: fetchSelectedRecipes,
  }
}

/**
 * Unified hook that fetches recipes with metadata (favorites + ratings)
 * Optimized to reduce from 3 separate calls to 1 parallel batch call
 */
export function useRecipesWithMetadata(filters?: RecipeFilters) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [ratingStats, setRatingStats] = useState<Record<string, { averageRating: number; totalReviews: number }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Parallel fetch: recipes + favorites
      const [recipesData, favoritesData] = await Promise.all([
        getRecipes(filters),
        getUserFavoriteRecipes().catch(() => []), // Graceful fallback if not authenticated
      ])

      // Extract recipe IDs for rating stats
      const recipeIds = recipesData.map((r) => r.id)

      // Fetch ratings for all recipes
      const { getMultipleRecipeRatingStats } = await import('@/lib/supabase/queries/recipes')
      const ratingsData = await getMultipleRecipeRatingStats(recipeIds)

      // Create set of favorite IDs for O(1) lookup
      const favIds = new Set(favoritesData.map((r) => r.id))

      setRecipes(recipesData)
      setFavoriteIds(favIds)
      setRatingStats(ratingsData)
      setError(null)
    } catch (err) {
      setError(err as Error)
      toast.error('Erro ao carregar receitas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [filters])

  const toggleFavorite = async (recipeId: string, isFavorited: boolean) => {
    try {
      if (isFavorited) {
        // Optimistically remove
        setFavoriteIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(recipeId)
          return newSet
        })
        await removeFavoriteRecipe(recipeId)
        toast.success('Receita removida dos favoritos')
      } else {
        // Optimistically add
        setFavoriteIds((prev) => {
          const newSet = new Set(prev)
          newSet.add(recipeId)
          return newSet
        })
        await addFavoriteRecipe(recipeId)
        toast.success('Receita adicionada aos favoritos')
      }
    } catch (err) {
      toast.error('Erro ao atualizar favoritos')
      // Revert on error
      await fetchAllData()
      throw err
    }
  }

  const isFavorite = (recipeId: string) => favoriteIds.has(recipeId)

  const getRecipeStats = (recipeId: string) =>
    ratingStats[recipeId] || { averageRating: 0, totalReviews: 0 }

  return {
    recipes,
    loading,
    error,
    toggleFavorite,
    isFavorite,
    getRecipeStats,
    refetch: fetchAllData,
  }
}
