import { useState, useEffect } from 'react'
import {
  getUserShoppingLists,
  getShoppingListById,
  getShoppingListItems,
  createShoppingList,
  addShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  markAllItemsAsChecked,
  updateShoppingListStatus,
  deleteShoppingList,
  getDraftItems,
  addRecipeToDraft,
  clearDraftList,
  removeDraftItem,
  addManualItemToDraft,
  updateDraftItem,
  type ShoppingList,
  type ShoppingListItem
} from '@/lib/supabase/queries/shopping-list'
import { convertRecipeToShoppingList } from '@/lib/shopping-list/smart-converter'
import type { Recipe } from '@/types/recipe'

export function useShoppingLists(status: 'active' | 'completed' | 'archived' = 'active') {
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)

  const loadLists = async () => {
    try {
      setLoading(true)
      const data = await getUserShoppingLists(status)
      setLists(data)
    } catch (error) {
      console.error('Error loading shopping lists:', error)
      setLists([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLists()
  }, [status])

  const createList = async (recipeId?: string, servings: number = 1) => {
    const newList = await createShoppingList(recipeId, servings)
    setLists(prev => [newList, ...prev])
    return newList
  }

  const removeList = async (listId: string) => {
    await deleteShoppingList(listId)
    setLists(prev => prev.filter(list => list.id !== listId))
  }

  const updateStatus = async (listId: string, newStatus: 'active' | 'completed' | 'archived') => {
    const updated = await updateShoppingListStatus(listId, newStatus)
    setLists(prev => prev.map(list => list.id === listId ? updated : list))
    return updated
  }

  return {
    lists,
    loading,
    createList,
    removeList,
    updateStatus,
    refresh: loadLists
  }
}

export function useShoppingList(listId: string) {
  const [list, setList] = useState<ShoppingList | null>(null)
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadList = async () => {
    try {
      setLoading(true)
      const [listData, itemsData] = await Promise.all([
        getShoppingListById(listId),
        getShoppingListItems(listId)
      ])
      setList(listData)
      setItems(itemsData)
    } catch (error) {
      console.error('Error loading shopping list:', error)
      setList(null)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (listId) {
      loadList()
    }
  }, [listId])

  const addItem = async (item: {
    ingredient_name: string
    category: string
    emoji?: string
    recipe_quantity?: number
    recipe_unit?: string
    buy_quantity?: number
    buy_unit?: string
    buy_package?: string
  }) => {
    const newItem = await addShoppingListItem(listId, item)
    setItems(prev => [...prev, newItem])
    return newItem
  }

  const updateItem = async (itemId: string, updates: Partial<ShoppingListItem>) => {
    const updated = await updateShoppingListItem(itemId, updates)
    setItems(prev => prev.map(item => item.id === itemId ? updated : item))
    return updated
  }

  const toggleItemChecked = async (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    return updateItem(itemId, { is_checked: !item.is_checked })
  }

  const removeItem = async (itemId: string) => {
    await deleteShoppingListItem(itemId)
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  const markAllChecked = async (checked: boolean = true) => {
    await markAllItemsAsChecked(listId, checked)
    setItems(prev => prev.map(item => ({ ...item, is_checked: checked })))
  }

  const updateListStatus = async (status: 'active' | 'completed' | 'archived') => {
    const updated = await updateShoppingListStatus(listId, status)
    setList(updated)
    return updated
  }

  // Calcular progresso
  const totalItems = items.length
  const checkedItems = items.filter(item => item.is_checked).length
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

  // Agrupar por categoria
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ShoppingListItem[]>)

  return {
    list,
    items,
    loading,
    progress,
    totalItems,
    checkedItems,
    itemsByCategory,
    addItem,
    updateItem,
    toggleItemChecked,
    removeItem,
    markAllChecked,
    updateListStatus,
    refresh: loadList
  }
}

/**
 * Gerar lista de compras a partir de uma receita
 */
export async function generateShoppingListFromRecipe(recipe: Recipe, servings?: number) {
  // Ajustar ingredientes para o número de porções
  const multiplier = servings ? servings / recipe.serves_people : 1

  const adjustedIngredients = recipe.ingredients.map(ing => {
    if (multiplier === 1) return ing

    // Ajustar quantidade
    const qtyMatch = ing.quantity.match(/^([\d.,\/]+)/)
    if (qtyMatch) {
      const originalQty = parseFloat(qtyMatch[1].replace(',', '.'))
      const newQty = originalQty * multiplier
      const adjustedQuantity = ing.quantity.replace(qtyMatch[1], newQty.toString())

      return {
        ...ing,
        quantity: adjustedQuantity
      }
    }

    return ing
  }).map(ing => ({
    ...ing,
    notes: ing.notes ?? undefined  // Convert null to undefined
  }))

  // Converter para itens de compra
  const shoppingItems = await convertRecipeToShoppingList(adjustedIngredients)

  // Buscar ou criar lista ativa
  const existingLists = await getUserShoppingLists('active')
  let list: ShoppingList

  if (existingLists.length > 0) {
    // Usar a primeira lista ativa existente
    list = existingLists[0]
  } else {
    // Criar nova lista
    list = await createShoppingList(recipe.id, servings || recipe.serves_people)
  }

  // Buscar itens já existentes na lista
  const existingItems = await getShoppingListItems(list.id)

  // Adicionar ou somar itens
  for (const newItem of shoppingItems) {
    // Procurar item existente com mesmo nome (case insensitive)
    const existingItem = existingItems.find(item =>
      item.ingredient_name.toLowerCase() === newItem.ingredient_name.toLowerCase()
    )

    // Type assertion: existingItem pode ter campos adicionais do banco
    const existingItemAny = existingItem as any

    if (existingItem && existingItemAny.recipe_unit === newItem.recipe_unit) {
      // Item já existe - somar quantidades
      const totalRecipeQty = (existingItemAny.recipe_quantity || 0) + newItem.recipe_quantity

      // Recalcular melhor embalagem para a quantidade total
      // Usar o smart converter para recalcular
      const { convertIngredientToShoppingItem } = await import('@/lib/shopping-list/smart-converter')
      const recalculated = await convertIngredientToShoppingItem({
        item: newItem.ingredient_name,
        quantity: `${totalRecipeQty} ${newItem.recipe_unit}`,
        notes: existingItemAny.notes
      })

      // Atualizar item existente (using any for extended fields)
      await updateShoppingListItem(existingItem.id, {
        quantity: `${recalculated.buy_quantity} ${recalculated.buy_unit}`
      } as any)
    } else {
      // Item novo - adicionar à lista
      await addShoppingListItem(list.id, newItem)
    }
  }

  return list
}

/**
 * Hook para gerenciar lista draft (rascunho)
 */
export function useDraftList() {
  const [draftItems, setDraftItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadDraft = async () => {
    try {
      setLoading(true)
      const items = await getDraftItems()
      setDraftItems(items)
    } catch (error) {
      console.error('Error loading draft items:', error)
      setDraftItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDraft()
  }, [])

  const addRecipe = async (recipeId: string, servings: number) => {
    await addRecipeToDraft(recipeId, servings)
    await loadDraft() // Recarregar para mostrar itens atualizados
  }

  const clearDraft = async () => {
    await clearDraftList()
    await loadDraft()
  }

  const removeItem = async (itemId: string) => {
    await removeDraftItem(itemId)
    await loadDraft()
  }

  const addManualItem = async (item: {
    ingredient_name: string
    quantity: string
    unit?: string
  }) => {
    await addManualItemToDraft(item)
    await loadDraft()
  }

  const updateItem = async (itemId: string, updates: {
    ingredient_name?: string
    quantity?: string
    unit?: string
  }) => {
    await updateDraftItem(itemId, updates)
    await loadDraft()
  }

  const totalItems = draftItems.length

  return {
    draftItems,
    loading,
    totalItems,
    addRecipe,
    clearDraft,
    removeItem,
    addManualItem,
    updateItem,
    refresh: loadDraft
  }
}
