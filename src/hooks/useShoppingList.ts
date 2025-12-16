'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  type ShoppingListItem,
  type DraftItem
} from '@/lib/supabase/queries/shopping-list'
import { toast } from 'sonner'

// Query Keys centralizadas
export const shoppingListKeys = {
  all: ['shoppingLists'] as const,
  lists: (status: string) => [...shoppingListKeys.all, 'list', status] as const,
  detail: (id: string) => [...shoppingListKeys.all, 'detail', id] as const,
  items: (id: string) => [...shoppingListKeys.all, 'items', id] as const,
  draft: () => [...shoppingListKeys.all, 'draft'] as const,
}

/**
 * Hook para listas de compras do usuário (com cache)
 */
export function useShoppingLists(status: 'active' | 'completed' | 'archived' = 'active') {
  const queryClient = useQueryClient()

  const { data: lists = [], isLoading: loading, refetch } = useQuery({
    queryKey: shoppingListKeys.lists(status),
    queryFn: () => getUserShoppingLists(status).catch(() => []),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  const createMutation = useMutation({
    mutationFn: async ({ recipeId, servings }: { recipeId?: string; servings?: number }) => {
      return createShoppingList(recipeId, servings)
    },
    onSuccess: (newList) => {
      queryClient.setQueryData(shoppingListKeys.lists(status), (old: ShoppingList[] | undefined) =>
        old ? [newList, ...old] : [newList]
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShoppingList,
    onMutate: async (listId) => {
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.lists(status) })
      const previous = queryClient.getQueryData(shoppingListKeys.lists(status))
      queryClient.setQueryData(shoppingListKeys.lists(status), (old: ShoppingList[] | undefined) =>
        old?.filter((list) => list.id !== listId)
      )
      return { previous }
    },
    onError: (err, listId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(shoppingListKeys.lists(status), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.lists(status) })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ listId, newStatus }: { listId: string; newStatus: 'active' | 'completed' | 'archived' }) => {
      return updateShoppingListStatus(listId, newStatus)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.all })
    },
  })

  return {
    lists,
    loading,
    createList: (recipeId?: string, servings: number = 1) =>
      createMutation.mutateAsync({ recipeId, servings }),
    removeList: (listId: string) => deleteMutation.mutateAsync(listId),
    updateStatus: (listId: string, newStatus: 'active' | 'completed' | 'archived') =>
      updateStatusMutation.mutateAsync({ listId, newStatus }),
    refresh: refetch,
  }
}

/**
 * Hook para uma lista de compras específica (com cache)
 */
export function useShoppingList(listId: string) {
  const queryClient = useQueryClient()

  const { data: list = null, isLoading: loadingList } = useQuery({
    queryKey: shoppingListKeys.detail(listId),
    queryFn: () => getShoppingListById(listId),
    enabled: !!listId,
    staleTime: 2 * 60 * 1000,
  })

  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: shoppingListKeys.items(listId),
    queryFn: () => getShoppingListItems(listId),
    enabled: !!listId,
    staleTime: 1 * 60 * 1000, // 1 minuto - itens mudam mais frequentemente
  })

  const loading = loadingList || loadingItems

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: Partial<ShoppingListItem> }) => {
      return updateShoppingListItem(itemId, updates)
    },
    onMutate: async ({ itemId, updates }) => {
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.items(listId) })
      const previous = queryClient.getQueryData(shoppingListKeys.items(listId))
      queryClient.setQueryData(shoppingListKeys.items(listId), (old: ShoppingListItem[] | undefined) =>
        old?.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
      )
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(shoppingListKeys.items(listId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.items(listId) })
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: deleteShoppingListItem,
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.items(listId) })
      const previous = queryClient.getQueryData(shoppingListKeys.items(listId))
      queryClient.setQueryData(shoppingListKeys.items(listId), (old: ShoppingListItem[] | undefined) =>
        old?.filter((item) => item.id !== itemId)
      )
      return { previous }
    },
    onError: (err, itemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(shoppingListKeys.items(listId), context.previous)
      }
    },
  })

  const markAllMutation = useMutation({
    mutationFn: async (checked: boolean) => {
      await markAllItemsAsChecked(listId, checked)
    },
    onMutate: async (checked) => {
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.items(listId) })
      const previous = queryClient.getQueryData(shoppingListKeys.items(listId))
      queryClient.setQueryData(shoppingListKeys.items(listId), (old: ShoppingListItem[] | undefined) =>
        old?.map((item) => ({ ...item, is_checked: checked }))
      )
      return { previous }
    },
    onError: (err, checked, context) => {
      if (context?.previous) {
        queryClient.setQueryData(shoppingListKeys.items(listId), context.previous)
      }
    },
  })

  // Calcular progresso
  const totalItems = items.length
  const checkedItems = items.filter((item) => item.is_checked).length
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
    updateItem: (itemId: string, updates: Partial<ShoppingListItem>) =>
      updateItemMutation.mutateAsync({ itemId, updates }),
    toggleItemChecked: (itemId: string) => {
      const item = items.find((i) => i.id === itemId)
      if (item) {
        updateItemMutation.mutate({ itemId, updates: { is_checked: !item.is_checked } })
      }
    },
    removeItem: (itemId: string) => deleteItemMutation.mutateAsync(itemId),
    markAllChecked: (checked: boolean = true) => markAllMutation.mutateAsync(checked),
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.detail(listId) })
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.items(listId) })
    },
  }
}

/**
 * Hook para lista draft / rascunho (com cache)
 */
export function useDraftList() {
  const queryClient = useQueryClient()

  const { data: draftItems = [], isLoading: loading, refetch } = useQuery({
    queryKey: shoppingListKeys.draft(),
    queryFn: () => getDraftItems().catch(() => []),
    staleTime: 1 * 60 * 1000, // 1 minuto
  })

  const addRecipeMutation = useMutation({
    mutationFn: async ({ recipeId, servings }: { recipeId: string; servings: number }) => {
      return addRecipeToDraft(recipeId, servings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.draft() })
      toast.success('Ingredientes adicionados à lista!')
    },
    onError: () => {
      toast.error('Erro ao adicionar ingredientes')
    },
  })

  const clearMutation = useMutation({
    mutationFn: clearDraftList,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.draft() })
      const previous = queryClient.getQueryData(shoppingListKeys.draft())
      queryClient.setQueryData(shoppingListKeys.draft(), [])
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(shoppingListKeys.draft(), context.previous)
      }
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: removeDraftItem,
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.draft() })
      const previous = queryClient.getQueryData(shoppingListKeys.draft())
      queryClient.setQueryData(shoppingListKeys.draft(), (old: DraftItem[] | undefined) =>
        old?.filter((item) => item.id !== itemId)
      )
      return { previous }
    },
    onError: (err, itemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(shoppingListKeys.draft(), context.previous)
      }
    },
  })

  const addManualMutation = useMutation({
    mutationFn: addManualItemToDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.draft() })
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: { ingredient_name?: string; quantity?: string; unit?: string } }) => {
      return updateDraftItem(itemId, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.draft() })
    },
  })

  const totalItems = draftItems.length

  return {
    draftItems,
    loading,
    totalItems,
    addRecipe: (recipeId: string, servings: number) =>
      addRecipeMutation.mutateAsync({ recipeId, servings }),
    clearDraft: () => clearMutation.mutateAsync(),
    removeItem: (itemId: string) => removeItemMutation.mutateAsync(itemId),
    addManualItem: (item: { ingredient_name: string; quantity: string; unit?: string }) =>
      addManualMutation.mutateAsync(item),
    updateItem: (itemId: string, updates: { ingredient_name?: string; quantity?: string; unit?: string }) =>
      updateItemMutation.mutateAsync({ itemId, updates }),
    refresh: refetch,
  }
}
