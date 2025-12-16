'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRecipes,
  getRecipesPaginated,
  getRecipeById,
  getRecipeOfTheDay,
  getRecipesByDateRange,
  getUserFavoriteRecipes,
  getUserSelectedRecipes,
  addFavoriteRecipe,
  removeFavoriteRecipe,
  selectRecipeForDate,
  removeSelectedRecipe,
  getMultipleRecipeRatingStats,
} from '@/lib/supabase/queries/recipes'
import type { Recipe, RecipeFilters } from '@/types/recipe'
import { toast } from 'sonner'

// Query Keys centralizadas
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (filters?: RecipeFilters) => [...recipeKeys.lists(), filters] as const,
  infinite: (filters?: RecipeFilters) => [...recipeKeys.all, 'infinite', filters] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  ofTheDay: () => [...recipeKeys.all, 'ofTheDay'] as const,
  byDateRange: (start: string, end: string) => [...recipeKeys.all, 'dateRange', start, end] as const,
  favorites: () => [...recipeKeys.all, 'favorites'] as const,
  selected: (start: string, end: string) => [...recipeKeys.all, 'selected', start, end] as const,
  ratings: (ids: string[]) => [...recipeKeys.all, 'ratings', ids] as const,
}

/**
 * Hook para buscar receitas PAGINADAS (10 por vez) - ideal para lista principal
 */
export function useInfiniteRecipes(filters?: RecipeFilters) {
  const {
    data,
    isLoading: loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: recipeKeys.infinite(filters),
    queryFn: ({ pageParam = 0 }) => getRecipesPaginated(pageParam, filters),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  })

  // Flatten todas as páginas em um único array
  const recipes = data?.pages.flatMap((page) => page.recipes) ?? []

  return {
    recipes,
    loading,
    error,
    loadMore: fetchNextPage,
    hasMore: hasNextPage ?? false,
    isLoadingMore: isFetchingNextPage,
  }
}

/**
 * Hook para buscar todas as receitas (com cache) - uso interno
 */
export function useRecipes(filters?: RecipeFilters) {
  const { data: recipes = [], isLoading: loading, error } = useQuery({
    queryKey: recipeKeys.list(filters),
    queryFn: () => getRecipes(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return { recipes, loading, error }
}

/**
 * Hook para buscar uma receita por ID (com cache)
 */
export function useRecipe(id: string) {
  const { data: recipe = null, isLoading: loading, error } = useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => getRecipeById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos - receitas mudam pouco
  })

  return { recipe, loading, error }
}

/**
 * Hook para receita do dia (com cache)
 */
export function useRecipeOfTheDay() {
  const { data: recipe = null, isLoading: loading, error } = useQuery({
    queryKey: recipeKeys.ofTheDay(),
    queryFn: getRecipeOfTheDay,
    staleTime: 60 * 60 * 1000, // 1 hora - receita do dia não muda
  })

  return { recipe, loading, error }
}

/**
 * Hook para receitas por range de data (com cache)
 */
export function useRecipesByDateRange(startDate: string, endDate: string) {
  const { data: recipes = [], isLoading: loading, error } = useQuery({
    queryKey: recipeKeys.byDateRange(startDate, endDate),
    queryFn: () => getRecipesByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return { recipes, loading, error }
}

/**
 * Hook para receitas favoritas (com cache)
 */
export function useFavoriteRecipes() {
  const queryClient = useQueryClient()

  const { data: recipes = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: recipeKeys.favorites(),
    queryFn: getUserFavoriteRecipes,
    staleTime: 5 * 60 * 1000,
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ recipeId, isFavorited }: { recipeId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        await removeFavoriteRecipe(recipeId)
      } else {
        await addFavoriteRecipe(recipeId)
      }
    },
    onMutate: async ({ recipeId, isFavorited }) => {
      await queryClient.cancelQueries({ queryKey: recipeKeys.favorites() })

      const previousFavorites = queryClient.getQueryData<Recipe[]>(recipeKeys.favorites())

      queryClient.setQueryData(recipeKeys.favorites(), (old: Recipe[] | undefined) => {
        if (!old) return isFavorited ? [] : []

        if (isFavorited) {
          return old.filter(r => r.id !== recipeId)
        }
        // Nota: Adicionar otimisticamente é difícil sem o objeto da receita completo.
        // A UI confiará no botão de coração do card atualizar instantaneamente 
        // e a lista atualizará no background.
        return old
      })

      return { previousFavorites }
    },
    onError: (err, newTodo, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(recipeKeys.favorites(), context.previousFavorites)
      }
      toast.error('Erro ao atualizar favoritos')
      console.error(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.favorites() })
      // Invalidate all to refresh heart icons everywhere
      queryClient.invalidateQueries({ queryKey: recipeKeys.all })
    },
  })

  const toggleFavorite = (recipeId: string, isFavorited: boolean) => {
    toggleMutation.mutate({ recipeId, isFavorited })
  }

  return { recipes, loading, error, toggleFavorite, refetch }
}

/**
 * Hook para receitas selecionadas pelo usuário (com cache)
 */
export function useSelectedRecipes(startDate: string, endDate: string) {
  const queryClient = useQueryClient()

  const { data: selectedData = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: recipeKeys.selected(startDate, endDate),
    queryFn: () => getUserSelectedRecipes(startDate, endDate).catch(() => []),
    enabled: !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000,
  })

  // Convert array to Map for easy lookup by date
  const selectedRecipes = new Map<string, Recipe>()
  selectedData.forEach((item: any) => {
    selectedRecipes.set(item.selected_date, item.recipes)
  })

  const selectMutation = useMutation({
    mutationFn: async ({ recipeId, date }: { recipeId: string; date: string }) => {
      await selectRecipeForDate(recipeId, date)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.selected(startDate, endDate) })
      toast.success('Receita adicionada ao calendário')
    },
    onError: () => {
      toast.error('Erro ao selecionar receita')
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (date: string) => {
      await removeSelectedRecipe(date)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.selected(startDate, endDate) })
      toast.success('Receita removida do calendário')
    },
    onError: () => {
      toast.error('Erro ao remover receita')
    },
  })

  return {
    selectedRecipes,
    loading,
    error,
    selectRecipe: (recipeId: string, date: string) => selectMutation.mutateAsync({ recipeId, date }),
    removeRecipe: (date: string) => removeMutation.mutateAsync(date),
    refetch,
  }
}

/**
 * Hook unificado: receitas + favoritos + ratings (com cache)
 */
export function useRecipesWithMetadata(filters?: RecipeFilters) {
  const queryClient = useQueryClient()

  // Buscar receitas
  const { data: recipes = [], isLoading: loadingRecipes } = useQuery({
    queryKey: recipeKeys.list(filters),
    queryFn: () => getRecipes(filters),
    staleTime: 5 * 60 * 1000,
  })

  // Buscar favoritos
  const { data: favoritesData = [], isLoading: loadingFavorites } = useQuery({
    queryKey: recipeKeys.favorites(),
    queryFn: () => getUserFavoriteRecipes().catch(() => []),
    staleTime: 2 * 60 * 1000,
  })

  // Buscar ratings (só quando temos receitas)
  const recipeIds = recipes.map((r) => r.id)
  const { data: ratingStats = {} } = useQuery({
    queryKey: recipeKeys.ratings(recipeIds),
    queryFn: () => getMultipleRecipeRatingStats(recipeIds),
    enabled: recipeIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutos - ratings mudam pouco
  })

  // Set de IDs favoritos para O(1) lookup
  const favoriteIds = new Set(favoritesData.map((r) => r.id))

  const loading = loadingRecipes || loadingFavorites

  const toggleMutation = useMutation({
    mutationFn: async ({ recipeId, isFavorited }: { recipeId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        await removeFavoriteRecipe(recipeId)
      } else {
        await addFavoriteRecipe(recipeId)
      }
    },
    onMutate: async ({ recipeId, isFavorited }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: recipeKeys.favorites() })
      const previousFavorites = queryClient.getQueryData(recipeKeys.favorites())

      queryClient.setQueryData(recipeKeys.favorites(), (old: Recipe[] | undefined) => {
        if (!old) return old
        if (isFavorited) {
          return old.filter((r) => r.id !== recipeId)
        } else {
          const recipe = recipes.find((r) => r.id === recipeId)
          return recipe ? [recipe, ...old] : old
        }
      })

      return { previousFavorites }
    },
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(recipeKeys.favorites(), context.previousFavorites)
      }
      toast.error('Erro ao atualizar favoritos')
    },
    onSuccess: (_, { isFavorited }) => {
      toast.success(isFavorited ? 'Removida dos favoritos' : 'Adicionada aos favoritos')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.favorites() })
    },
  })

  const toggleFavorite = (recipeId: string, isFavorited: boolean) => {
    toggleMutation.mutate({ recipeId, isFavorited })
  }

  const isFavorite = (recipeId: string) => favoriteIds.has(recipeId)

  const getRecipeStats = (recipeId: string) =>
    ratingStats[recipeId] || { averageRating: 0, totalReviews: 0 }

  return {
    recipes,
    loading,
    error: null,
    toggleFavorite,
    isFavorite,
    getRecipeStats,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.all })
    },
  }
}
