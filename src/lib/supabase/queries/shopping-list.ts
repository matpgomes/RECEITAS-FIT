import { createClient } from '@/lib/supabase/client'

export interface Ingredient {
  id: string
  name: string
  category: string
  base_unit: string
  is_weight: boolean
  emoji?: string
}

export interface IngredientPackage {
  id: string
  ingredient_id: string
  package_name: string
  quantity: number
  unit: string
  is_default: boolean
  display_order: number
}

export interface UnitConversion {
  id: string
  from_unit: string
  to_unit: string
  ingredient_type?: string
  conversion_factor: number
}

export interface ShoppingList {
  id: string
  user_id: string
  recipe_id?: string
  name: string
  week_number?: number
  servings: number
  status: 'draft' | 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
  items?: ShoppingListItem[]  // Opcional, incluído quando fazer join
}

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  ingredient_name: string
  category: string
  quantity: string
  unity: string
  is_checked: boolean
  display_order: number
  created_at: string
  // Campos opcionais para compatibilidade
  emoji?: string
  notes?: string
}

/**
 * Buscar todos os ingredientes cadastrados
 */
export async function getAllIngredients() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching ingredients:', error)
    throw error
  }

  return data as Ingredient[]
}

/**
 * Buscar embalagens de um ingrediente
 */
export async function getIngredientPackages(ingredientId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ingredient_packages')
    .select('*')
    .eq('ingredient_id', ingredientId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching packages:', error)
    throw error
  }

  return data as IngredientPackage[]
}

/**
 * Buscar conversão de unidade
 */
export async function getUnitConversion(fromUnit: string, toUnit: string, ingredientType?: string) {
  const supabase = createClient()

  let query = supabase
    .from('unit_conversions')
    .select('*')
    .eq('from_unit', fromUnit)
    .eq('to_unit', toUnit)

  if (ingredientType) {
    query = query.eq('ingredient_type', ingredientType)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error('Error fetching conversion:', error)
    return null
  }

  return data as UnitConversion | null
}

/**
 * Criar uma nova lista de compras
 */
export async function createShoppingList(recipeId?: string, servings: number = 1) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Calcular número da semana
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)

  const { data, error } = await supabase
    .from('shopping_lists')
    .insert({
      user_id: user.id,
      recipe_id: recipeId,
      name: `Lista de Compras - Semana ${weekNumber}`,
      week_number: weekNumber,
      servings,
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating shopping list:', error)
    throw error
  }

  return data as ShoppingList
}

/**
 * Buscar listas de compras do usuário
 */
export async function getUserShoppingLists(status: 'active' | 'completed' | 'archived' = 'active') {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('shopping_lists')
    .select(`
      *,
      items:shopping_list_items(*)
    `)
    .eq('user_id', user.id)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching shopping lists:', error)
    throw error
  }

  return data as ShoppingList[]
}

/**
 * Buscar lista de compras por ID
 */
export async function getShoppingListById(listId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('id', listId)
    .single()

  if (error) {
    console.error('Error fetching shopping list:', error)
    throw error
  }

  return data as ShoppingList
}

/**
 * Buscar itens de uma lista de compras
 */
export async function getShoppingListItems(listId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('shopping_list_items')
    .select('*')
    .eq('shopping_list_id', listId)
    .order('category', { ascending: true })
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching list items:', error)
    throw error
  }

  return data as ShoppingListItem[]
}

/**
 * Adicionar item à lista de compras
 */
export async function addShoppingListItem(
  listId: string,
  item: {
    ingredient_name: string
    category: string
    emoji?: string
    recipe_quantity?: number
    recipe_unit?: string
    buy_quantity?: number
    buy_unit?: string
    buy_package?: string
  }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('shopping_list_items')
    .insert({
      shopping_list_id: listId,
      ...item,
      is_checked: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding list item:', error)
    throw error
  }

  return data as ShoppingListItem
}

/**
 * Atualizar item da lista (marcar como comprado, adicionar notas, etc)
 */
export async function updateShoppingListItem(itemId: string, updates: Partial<ShoppingListItem>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('shopping_list_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    console.error('Error updating list item:', error)
    throw error
  }

  return data as ShoppingListItem
}

/**
 * Deletar item da lista
 */
export async function deleteShoppingListItem(itemId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('shopping_list_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    console.error('Error deleting list item:', error)
    throw error
  }

  return true
}

/**
 * Marcar todos os itens como comprados
 */
export async function markAllItemsAsChecked(listId: string, checked: boolean = true) {
  const supabase = createClient()

  const { error } = await supabase
    .from('shopping_list_items')
    .update({ is_checked: checked })
    .eq('shopping_list_id', listId)

  if (error) {
    console.error('Error updating all items:', error)
    throw error
  }

  return true
}

/**
 * Atualizar status da lista
 */
export async function updateShoppingListStatus(listId: string, status: 'active' | 'completed' | 'archived') {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('shopping_lists')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', listId)
    .select()
    .single()

  if (error) {
    console.error('Error updating list status:', error)
    throw error
  }

  return data as ShoppingList
}

/**
 * Deletar lista de compras
 */
export async function deleteShoppingList(listId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('shopping_lists')
    .delete()
    .eq('id', listId)

  if (error) {
    console.error('Error deleting shopping list:', error)
    throw error
  }

  return true
}

/**
 * Interface para itens do draft
 */
export interface DraftItem {
  id: string
  user_id: string
  ingredient_name: string
  quantity: string
  unit: string
  recipe_id?: string
  recipe_name?: string
  display_order: number
  created_at: string
  updated_at: string
}

/**
 * Buscar itens do draft do usuário
 * Retorna array de itens (pode estar vazio)
 */
export async function getDraftItems(): Promise<DraftItem[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('draft_shopping_list_items')
    .select('*')
    .eq('user_id', user.id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching draft items:', error)
    throw error
  }

  return data as DraftItem[]
}

/**
 * Adicionar ingredientes de uma receita ao draft
 * Soma automaticamente ingredientes iguais
 */
export async function addRecipeToDraft(recipeId: string, servings: number = 4) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Buscar receita
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single()

  if (recipeError || !recipe) {
    throw new Error('Recipe not found')
  }

  // Calcular multiplicador de porções
  const multiplier = servings / recipe.serves_people

  // Buscar itens existentes no draft
  const existingItems = await getDraftItems()

  // Processar cada ingrediente
  for (const ingredient of recipe.ingredients) {
    // Extrair quantidade e unidade
    const qtyMatch = ingredient.quantity.match(/^([\d.,\/]+)\s*(.*)/)
    if (!qtyMatch) continue

    let qty = qtyMatch[1]
    const unit = qtyMatch[2] || 'unidade'

    // Ajustar para porções
    if (multiplier !== 1) {
      const originalQty = parseFloat(qty.replace(',', '.'))
      const newQty = originalQty * multiplier
      qty = newQty.toString()
    }

    // Verificar se ingrediente já existe
    const existingItem = existingItems.find(item =>
      item.ingredient_name.toLowerCase() === ingredient.item.toLowerCase() &&
      item.unit.toLowerCase() === unit.toLowerCase()
    )

    if (existingItem) {
      // Somar quantidades
      const existingQty = parseFloat(existingItem.quantity.replace(',', '.'))
      const newQty = parseFloat(qty.replace(',', '.'))
      const totalQty = existingQty + newQty

      await supabase
        .from('draft_shopping_list_items')
        .update({
          quantity: totalQty.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
    } else {
      // Adicionar novo item
      await supabase
        .from('draft_shopping_list_items')
        .insert({
          user_id: user.id,
          ingredient_name: ingredient.item,
          quantity: qty,
          unit: unit,
          recipe_id: recipeId,
          recipe_name: recipe.title,
          display_order: existingItems.length
        })
    }
  }

  return await getDraftItems()
}

/**
 * Limpar todos os itens do draft
 */
export async function clearDraftList() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('draft_shopping_list_items')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('Error clearing draft list:', error)
    throw error
  }

  return true
}

/**
 * Remover item individual do draft
 */
export async function removeDraftItem(itemId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('draft_shopping_list_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    console.error('Error removing draft item:', error)
    throw error
  }

  return true
}

/**
 * Adicionar item manual ao draft
 */
export async function addManualItemToDraft(item: {
  ingredient_name: string
  quantity: string
  unit?: string
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Extrair quantidade e unidade
  const qtyMatch = item.quantity.match(/^([\d.,\/]+)\s*(.*)/)
  const qty = qtyMatch ? qtyMatch[1] : item.quantity
  const unit = item.unit || (qtyMatch ? qtyMatch[2] : '') || 'unidade'

  const existingItems = await getDraftItems()

  const { data, error } = await supabase
    .from('draft_shopping_list_items')
    .insert({
      user_id: user.id,
      ingredient_name: item.ingredient_name,
      quantity: qty,
      unit: unit,
      display_order: existingItems.length
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding manual item to draft:', error)
    throw error
  }

  return data as DraftItem
}

/**
 * Atualizar item do draft
 */
export async function updateDraftItem(itemId: string, updates: {
  ingredient_name?: string
  quantity?: string
  unit?: string
}) {
  const supabase = createClient()

  const updateData: any = { updated_at: new Date().toISOString() }

  if (updates.ingredient_name !== undefined) {
    updateData.ingredient_name = updates.ingredient_name
  }
  if (updates.quantity !== undefined) {
    updateData.quantity = updates.quantity
  }
  if (updates.unit !== undefined) {
    updateData.unit = updates.unit
  }

  const { data, error } = await supabase
    .from('draft_shopping_list_items')
    .update(updateData)
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    console.error('Error updating draft item:', error)
    throw error
  }

  return data as DraftItem
}
