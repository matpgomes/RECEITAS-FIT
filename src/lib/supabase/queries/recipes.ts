import { createClient } from '@/lib/supabase/client'
import type { Recipe, RecipeFilters, UserSelectedRecipe } from '@/types/recipe'

const RECIPES_PER_PAGE = 10

/**
 * Get all active recipes (only released recipes - featured_date <= today)
 */
export async function getRecipes(filters?: RecipeFilters) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('recipes')
    .select('*')
    .eq('is_active', true)
    .lte('featured_date', today) // Only show recipes that have been released
    .order('featured_date', { ascending: false }) // Mais recentes primeiro

  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  if (filters?.maxPrepTime) {
    query = query.lte('prep_time_minutes', filters.maxPrepTime)
  }

  if (filters?.maxCalories) {
    query = query.lte('calories_fit', filters.maxCalories)
  }

  if (filters?.excludeAllergens && filters.excludeAllergens.length > 0) {
    filters.excludeAllergens.forEach((allergen) => {
      query = query.not('allergens', 'cs', `{${allergen}}`)
    })
  }

  if (filters?.searchQuery) {
    query = query.ilike('title', `%${filters.searchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching recipes:', error)
    throw error
  }

  return data as Recipe[]
}

/**
 * Get recipes paginated (10 per page, most recent first)
 */
export async function getRecipesPaginated(
  page: number = 0,
  filters?: RecipeFilters
): Promise<{ recipes: Recipe[]; hasMore: boolean }> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const from = page * RECIPES_PER_PAGE
  const to = from + RECIPES_PER_PAGE - 1

  let query = supabase
    .from('recipes')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .lte('featured_date', today)
    .order('featured_date', { ascending: false }) // Mais recentes primeiro
    .range(from, to)

  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  if (filters?.maxPrepTime) {
    query = query.lte('prep_time_minutes', filters.maxPrepTime)
  }

  if (filters?.maxCalories) {
    query = query.lte('calories_fit', filters.maxCalories)
  }

  if (filters?.excludeAllergens && filters.excludeAllergens.length > 0) {
    filters.excludeAllergens.forEach((allergen) => {
      query = query.not('allergens', 'cs', `{${allergen}}`)
    })
  }

  if (filters?.searchQuery) {
    query = query.ilike('title', `%${filters.searchQuery}%`)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching paginated recipes:', error)
    throw error
  }

  const recipes = data as Recipe[]
  const totalFetched = (page + 1) * RECIPES_PER_PAGE
  const hasMore = count ? totalFetched < count : false

  return { recipes, hasMore }
}

/**
 * Get recipe by ID
 */
export async function getRecipeById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching recipe:', error)
    throw error
  }

  return data as Recipe
}

/**
 * Get recipe of the day (today's featured date)
 */
export async function getRecipeOfTheDay() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('featured_date', today)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching recipe of the day:', error)
    // If no recipe for today, return null instead of throwing
    return null
  }

  return data as Recipe
}

/**
 * Get recipes for a date range (for calendar view)
 */
export async function getRecipesByDateRange(startDate: string, endDate: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .gte('featured_date', startDate)
    .lte('featured_date', endDate)
    .eq('is_active', true)
    .order('featured_date', { ascending: true })

  if (error) {
    console.error('Error fetching recipes by date range:', error)
    throw error
  }

  return data as Recipe[]
}

/**
 * Check if user has favorited a recipe
 */
export async function isRecipeFavorited(recipeId: string, userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_favorite_recipes')
    .select('id')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error checking favorite:', error)
    return false
  }

  return !!data
}

/**
 * Add recipe to favorites
 */
export async function addFavoriteRecipe(recipeId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('user_favorite_recipes')
    .upsert(
      {
        user_id: user.id,
        recipe_id: recipeId,
      },
      { onConflict: 'user_id, recipe_id', ignoreDuplicates: true }
    )

  if (error) {
    console.error('Error adding favorite:', error)
    throw error // Agora lança o erro real se não for duplicidade
  }

  return true
}

/**
 * Remove recipe from favorites
 */
export async function removeFavoriteRecipe(recipeId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('user_favorite_recipes')
    .delete()
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)

  if (error) {
    console.error('Error removing favorite:', error)
    throw error
  }

  return true
}

/**
 * Get user's favorite recipes
 */
export async function getUserFavoriteRecipes() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_favorite_recipes')
    .select(`
      created_at,
      recipes (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorite recipes:', error)
    throw error
  }

  return (data?.map((item: any) => item.recipes) || []) as Recipe[]
}

/**
 * Select a recipe for a specific date
 */
export async function selectRecipeForDate(recipeId: string, date: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Use upsert to replace if a recipe is already selected for this date
  const { error } = await supabase
    .from('user_selected_recipes')
    .upsert({
      user_id: user.id,
      recipe_id: recipeId,
      selected_date: date,
    }, {
      onConflict: 'user_id,selected_date'
    })

  if (error) {
    console.error('Error selecting recipe:', error)
    throw error
  }

  return true
}

/**
 * Get user's selected recipes for a date range
 */
export async function getUserSelectedRecipes(startDate: string, endDate: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_selected_recipes')
    .select(`
      id,
      selected_date,
      recipes (*)
    `)
    .eq('user_id', user.id)
    .gte('selected_date', startDate)
    .lte('selected_date', endDate)
    .order('selected_date', { ascending: true })

  if (error) {
    console.error('Error fetching selected recipes:', error)
    throw error
  }

  return (data || []) as any[]
}

/**
 * Remove selected recipe for a date
 */
export async function removeSelectedRecipe(date: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('user_selected_recipes')
    .delete()
    .eq('user_id', user.id)
    .eq('selected_date', date)

  if (error) {
    console.error('Error removing selected recipe:', error)
    throw error
  }

  return true
}

/**
 * Get recipe rating statistics (average and count)
 */
export async function getRecipeRatingStats(recipeId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('check_ins')
    .select('rating')
    .eq('recipe_id', recipeId)
    .eq('moderation_status', 'approved')
    .not('rating', 'is', null)

  if (error) {
    console.error('Error fetching recipe rating stats:', error)
    return { averageRating: 0, totalReviews: 0 }
  }

  if (!data || data.length === 0) {
    return { averageRating: 0, totalReviews: 0 }
  }

  const ratings = data.map((item) => item.rating as number)
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  const averageRating = sum / ratings.length

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: ratings.length,
  }
}

/**
 * Get rating stats for multiple recipes
 */
export async function getMultipleRecipeRatingStats(recipeIds: string[]) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('check_ins')
    .select('recipe_id, rating')
    .in('recipe_id', recipeIds)
    .eq('moderation_status', 'approved')
    .not('rating', 'is', null)

  if (error) {
    console.error('Error fetching multiple recipe rating stats:', error)
    return {}
  }

  // Group by recipe_id and calculate stats
  const statsByRecipe: Record<string, { averageRating: number; totalReviews: number }> = {}

  recipeIds.forEach((recipeId) => {
    const recipeRatings = data?.filter((item) => item.recipe_id === recipeId) || []

    if (recipeRatings.length === 0) {
      statsByRecipe[recipeId] = { averageRating: 0, totalReviews: 0 }
    } else {
      const ratings = recipeRatings.map((item) => item.rating as number)
      const sum = ratings.reduce((acc, rating) => acc + rating, 0)
      const averageRating = sum / ratings.length

      statsByRecipe[recipeId] = {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: ratings.length,
      }
    }
  })

  return statsByRecipe
}
