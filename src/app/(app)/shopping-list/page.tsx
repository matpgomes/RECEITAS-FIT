'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, Plus, Clock, CheckCircle2, Sparkles, Trash2, ChevronDown, ChevronUp, X, Edit, ArrowLeft, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useShoppingLists, useDraftList } from '@/hooks/useShoppingList'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function ShoppingListsPage() {
  const router = useRouter()
  const { lists, loading: loadingLists, removeList } = useShoppingLists('active')
  const { draftItems, loading: loadingDraft, totalItems: draftTotalItems, clearDraft, removeItem, addManualItem } = useDraftList()

  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] = useState(false)
  const [isDeleteListDialogOpen, setIsDeleteListDialogOpen] = useState(false)
  const [isDeleteDraftDialogOpen, setIsDeleteDraftDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null)
  const [listToDelete, setListToDelete] = useState<{ id: string; name: string } | null>(null)
  const [listName, setListName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [generatedListId, setGeneratedListId] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  const loading = loadingLists || loadingDraft

  const handleOpenGenerateDialog = () => {
    // Sugerir nome baseado na data
    const today = new Date()
    const weekNumber = Math.ceil(((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(today.getFullYear(), 0, 1).getDay() + 1) / 7)
    setListName(`Lista de Compras - Semana ${weekNumber}`)
    setIsGenerateDialogOpen(true)
  }

  // Polling com backoff exponencial para verificar se a lista foi criada
  useEffect(() => {
    if (!isPolling || !generatedListId) return

    let pollCount = 0
    const MAX_ATTEMPTS = 10

    // Incrementar progresso gradualmente
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev
        return prev + 5
      })
    }, 500)

    // Função de polling com backoff exponencial: 1s, 2s, 4s, 8s, 16s...
    const pollList = async () => {
      try {
        const response = await fetch(`/api/shopping-list/${generatedListId}`)
        const data = await response.json()

        if (data.list && data.list.items && data.list.items.length > 0) {
          // Lista foi processada com sucesso!
          setProgress(100)
          setIsPolling(false)
          setIsGenerating(false)
          setIsGenerateDialogOpen(false)
          setIsSuccessDialogOpen(true)
          clearInterval(progressInterval)
          return
        }

        pollCount++

        if (pollCount >= MAX_ATTEMPTS) {
          // Máximo de tentativas alcançado
          setIsPolling(false)
          setIsGenerating(false)
          setProgress(0)
          clearInterval(progressInterval)
          toast.error('Tempo esgotado. Verifique a lista manualmente.')
          return
        }

        // Backoff exponencial: 1s, 2s, 4s, 8s... (max 16s)
        const delay = Math.min(1000 * Math.pow(2, pollCount - 1), 16000)
        setTimeout(pollList, delay)
      } catch (error) {
        // Em caso de erro, tentar novamente com backoff
        pollCount++
        if (pollCount < MAX_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, pollCount - 1), 16000)
          setTimeout(pollList, delay)
        }
      }
    }

    // Iniciar primeiro poll após 1s
    const initialTimeout = setTimeout(pollList, 1000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(initialTimeout)
    }
  }, [isPolling, generatedListId])

  const handleGenerateList = async () => {
    if (!listName.trim()) {
      toast.error('Por favor, dê um nome para a lista')
      return
    }

    if (!draftItems || draftItems.length === 0) {
      toast.error('Adicione pelo menos uma receita antes de gerar a lista')
      return
    }

    try {
      setIsGenerating(true)
      setProgress(0)

      // Preparar ingredientes para enviar ao webhook
      const ingredients = draftItems.map(item => ({
        ingredient_name: item.ingredient_name,
        quantity: `${item.quantity} ${item.unit}`,
        unit: item.unit
      }))

      // Chamar API que envia para N8N
      const response = await fetch('/api/shopping-list/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe_ids: [], // Draft não tem recipe_ids específicos
          list_name: listName,
          ingredients // Enviar ingredientes já somados
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar lista')
      }

      toast.loading('🤖 IA processando sua lista...', { duration: Infinity })

      // Limpar draft
      await clearDraft()

      // Iniciar polling
      if (data.list_id) {
        setGeneratedListId(data.list_id)
        setIsPolling(true)
      } else {
        setIsGenerating(false)
        toast.error('Erro: lista não foi criada')
      }
    } catch (error) {
      console.error('Error generating list:', error)
      toast.error('Erro ao processar lista. Tente novamente.')
      setIsGenerating(false)
    }
  }

  const handleClearDraft = () => {
    setIsDeleteDraftDialogOpen(true)
  }

  const confirmClearDraft = async () => {
    try {
      await clearDraft()
      toast.success('Lista limpa!')
      setIsDeleteDraftDialogOpen(false)
    } catch (error) {
      console.error('Error clearing draft:', error)
      toast.error('Erro ao limpar lista')
    }
  }

  const handleRemoveItem = (itemId: string, itemName: string) => {
    setItemToDelete({ id: itemId, name: itemName })
    setIsDeleteItemDialogOpen(true)
  }

  const confirmRemoveItem = async () => {
    if (!itemToDelete) return

    try {
      await removeItem(itemToDelete.id)
      toast.success('Item removido!')
      setIsDeleteItemDialogOpen(false)
      setItemToDelete(null)
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Erro ao remover item')
    }
  }

  const handleAddManualItem = async () => {
    if (!newItemName.trim() || !newItemQuantity.trim()) {
      toast.error('Preencha nome e quantidade do ingrediente')
      return
    }

    try {
      await addManualItem({
        ingredient_name: newItemName,
        quantity: newItemQuantity
      })

      setNewItemName('')
      setNewItemQuantity('')
      setIsAddItemDialogOpen(false)
      toast.success('Ingrediente adicionado!')
    } catch (error) {
      console.error('Error adding manual item:', error)
      toast.error('Erro ao adicionar ingrediente')
    }
  }

  const handleDeleteList = (listId: string, listName: string, event: React.MouseEvent) => {
    event.stopPropagation() // Previne navegação ao clicar no botão
    setListToDelete({ id: listId, name: listName })
    setIsDeleteListDialogOpen(true)
  }

  const confirmDeleteList = async () => {
    if (!listToDelete) return

    try {
      await removeList(listToDelete.id)
      toast.success('Lista excluída!')
      setIsDeleteListDialogOpen(false)
      setListToDelete(null)
    } catch (error) {
      console.error('Error deleting list:', error)
      toast.error('Erro ao excluir lista')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-2/3" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header Fixo */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-pink-50/95 to-white/95 dark:from-gray-900/95 dark:to-gray-950/95 backdrop-blur-sm border-b border-pink-100 dark:border-gray-800">
        <div className="container max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/home')}
              className="flex-shrink-0 hover:bg-pink-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary truncate">
                Minhas Listas
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                Suas listas de compras organizadas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-4 space-y-6 pt-6">

        {/* Lista Draft (Stand-by) */}
        {draftItems && draftTotalItems > 0 && (
          <Card className="border-2 border-dashed border-secondary bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-900/10 dark:to-purple-900/10">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-secondary flex-shrink-0" />
                    <h3 className="text-lg sm:text-xl font-semibold text-primary truncate">
                      Lista em Preparação
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {draftTotalItems} {draftTotalItems === 1 ? 'ingrediente' : 'ingredientes'}
                  </p>
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="border-secondary text-secondary hover:bg-secondary/10 hover:text-primary font-medium text-xs sm:text-sm px-2 sm:px-3"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Fechar</span>
                      </>
                    ) : (
                      <>
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearDraft}
                    className="text-gray-400 hover:text-red-500 h-8 w-8 sm:h-10 sm:w-10"
                    title="Limpar toda a lista"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              {/* Lista de Itens - Preview ou Expandida */}
              {isExpanded ? (
                // Lista completa editável
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {draftItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {item.ingredient_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} {item.unit}
                          {item.recipe_name && (
                            <span className="ml-2 text-xs text-gray-400">({item.recipe_name})</span>
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id, item.ingredient_name)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                // Preview dos primeiros itens
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {draftItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="text-gray-400">•</span>
                      <span className="font-medium">{item.ingredient_name}</span>
                      <span className="text-gray-500">- {item.quantity} {item.unit}</span>
                    </div>
                  ))}
                  {draftTotalItems > 5 && (
                    <p className="text-xs text-gray-500 italic">+ {draftTotalItems - 5} itens...</p>
                  )}
                </div>
              )}

              {/* Botões de Ação */}
              <div className="space-y-2">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  onClick={handleOpenGenerateDialog}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Processando com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Gerar Lista de Compras com IA
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-secondary text-secondary hover:bg-secondary/5 rounded-xl"
                    onClick={() => setIsAddItemDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-secondary text-secondary hover:bg-secondary/5 rounded-xl"
                    onClick={() => router.push('/recipes')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Mais Receitas
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Mensagem se não tem draft nem listas */}
        {(!draftItems || draftTotalItems === 0) && lists.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="flex justify-center">
              <Image
                src="/shopping-cart-empty.svg"
                alt="Carrinho vazio"
                width={120}
                height={120}
                className="opacity-80"
              />
            </div>
            <h2 className="text-2xl font-bold text-primary">Nenhuma lista de compras</h2>
            <p className="text-muted-foreground">
              Adicione receitas para começar sua lista
            </p>
            <Button
              onClick={() => router.push('/recipes')}
              className="mt-4 bg-secondary hover:bg-primary text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ver Receitas
            </Button>
          </div>
        )}

        {/* Listas Finalizadas */}
        {lists.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-primary">
              Listas Finalizadas
            </h2>
            {lists.map((list) => {
              const totalItems = list.items?.length || 0
              const checkedItems = list.items?.filter(item => item.is_checked)?.length || 0
              const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0
              const isCompleted = progress === 100

              return (
                <Card
                  key={list.id}
                  className={cn(
                    'overflow-hidden transition-all duration-300 cursor-pointer relative',
                    'shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
                    'p-0',
                    isCompleted && 'opacity-75'
                  )}
                  onClick={() => router.push(`/shopping-list/${list.id}`)}
                >
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-primary truncate pr-2">
                          {list.name}
                        </h3>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 text-xs sm:text-sm text-gray-500">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(list.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {isCompleted ? (
                          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs sm:text-sm font-medium">
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Completa</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-pink-100 dark:bg-pink-900/20 text-secondary rounded-full text-xs sm:text-sm font-medium">
                            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Ativa</span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteList(list.id, list.name, e)}
                          className="text-gray-400 hover:text-red-500 h-8 w-8"
                          title="Excluir lista"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span className="truncate">
                        {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                        {totalItems > 0 && ` • ${checkedItems} comprado${checkedItems !== 1 ? 's' : ''}`}
                      </span>
                      <span className="font-semibold text-primary ml-2 flex-shrink-0">
                        {Math.round(progress)}%
                      </span>
                    </div>

                    <Progress
                      value={progress}
                      className="h-2 bg-gray-200 dark:bg-gray-800"
                      indicatorClassName={cn(
                        isCompleted
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : 'bg-gradient-to-r from-secondary to-primary'
                      )}
                    />
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Gerar Lista */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Lista de Compras</DialogTitle>
            <DialogDescription>
              Dê um nome para sua lista. A IA vai processar os ingredientes e organizar tudo para você!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="listName">Nome da Lista</Label>
              <Input
                id="listName"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Ex: Lista de Compras - Semana 48"
                disabled={isGenerating}
              />
            </div>

            <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <Sparkles className="h-4 w-4 inline mr-1 text-secondary" />
                A IA vai analisar e organizar {draftTotalItems} ingrediente{draftTotalItems !== 1 ? 's' : ''} da sua lista em preparação.
              </p>
            </div>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Processando com IA...</span>
                  <span className="font-semibold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  {progress < 30 && 'Analisando ingredientes...'}
                  {progress >= 30 && progress < 60 && 'Convertendo unidades...'}
                  {progress >= 60 && progress < 90 && 'Organizando por categorias...'}
                  {progress >= 90 && 'Finalizando sua lista...'}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(false)}
              disabled={isGenerating}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateList}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Lista
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Item Manual */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Ingrediente</DialogTitle>
            <DialogDescription>
              Adicione um ingrediente manualmente à sua lista em preparação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Nome do Ingrediente</Label>
              <Input
                id="itemName"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Ex: Tomate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemQuantity">Quantidade</Label>
              <Input
                id="itemQuantity"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                placeholder="Ex: 3 unidades"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddItemDialogOpen(false)
                setNewItemName('')
                setNewItemQuantity('')
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddManualItem}
              className="flex-1 bg-secondary hover:bg-primary text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteItemDialogOpen} onOpenChange={setIsDeleteItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Ingrediente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este ingrediente da lista?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {itemToDelete?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteItemDialogOpen(false)
                setItemToDelete(null)
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmRemoveItem}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão de Lista */}
      <Dialog open={isDeleteListDialogOpen} onOpenChange={setIsDeleteListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Lista</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta lista de compras?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {listToDelete?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Todos os itens serão removidos. Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteListDialogOpen(false)
                setListToDelete(null)
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDeleteList}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Sucesso */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsSuccessDialogOpen(false)
          setGeneratedListId(null)
          setProgress(0)
          window.location.reload()
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                <PartyPopper className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-primary">
                Parabéns!
              </DialogTitle>
              <DialogDescription className="text-base">
                Sua lista de compras está pronta e organizada para você começar suas compras!
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span>Lista processada com inteligência artificial</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={() => {
                if (generatedListId) {
                  router.push(`/shopping-list/${generatedListId}`)
                }
              }}
              className="w-full bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Acessar Lista Pronta
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccessDialogOpen(false)
                setGeneratedListId(null)
                setProgress(0)
                window.location.reload()
              }}
              className="w-full"
            >
              Ver Todas as Listas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog - Limpar Draft List */}
      <ConfirmDialog
        open={isDeleteDraftDialogOpen}
        onOpenChange={setIsDeleteDraftDialogOpen}
        title="Limpar Lista em Preparação"
        description="Tem certeza que deseja limpar todos os ingredientes da lista em preparação?"
        confirmLabel="Sim, Limpar"
        cancelLabel="Cancelar"
        onConfirm={confirmClearDraft}
        variant="destructive"
      >
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {draftTotalItems} {draftTotalItems === 1 ? 'ingrediente será removido' : 'ingredientes serão removidos'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Esta ação não pode ser desfeita.
          </p>
        </div>
      </ConfirmDialog>
    </div>
  )
}
