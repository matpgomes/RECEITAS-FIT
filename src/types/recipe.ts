// Recipe Types

export interface RecipeIngredient {
  item: string
  quantity: string
  notes?: string | null
}

export interface RecipeStep {
  step: number
  title: string
  description: string
  time_minutes: number
}

export interface Recipe {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string | null
  image_url: string
  prep_time_minutes: number
  serves_people: number
  calories_normal: number
  calories_fit: number
  calories_saved: number
  ingredients: RecipeIngredient[]
  preparation_full: string
  preparation_steps: RecipeStep[]
  category: string | null
  tags: string[]
  allergens: string[]
  is_active: boolean
  featured_date: string | null
}

export interface RecipeWithFavorite extends Recipe {
  is_favorite: boolean
}

export interface RecipeWithSelected extends Recipe {
  is_selected: boolean
  selected_date?: string
}

export interface UserFavoriteRecipe {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
}

export interface UserSelectedRecipe {
  id: string
  user_id: string
  recipe_id: string
  selected_date: string
  created_at: string
}

// Helper types for API responses
export interface RecipesResponse {
  recipes: Recipe[]
  total: number
}

export interface RecipeFilters {
  category?: string
  tags?: string[]
  maxPrepTime?: number
  maxCalories?: number
  excludeAllergens?: string[]
  searchQuery?: string
}
