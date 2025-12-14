'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Download, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ShoppingListItemComponent } from '@/components/shopping-list/ShoppingListItem'
import { useShoppingList } from '@/hooks/useShoppingList'

export default function ShoppingListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params.id as string

  const {
    list,
    items,
    loading,
    progress,
    totalItems,
    checkedItems,
    itemsByCategory,
    toggleItemChecked,
    removeItem,
    markAllChecked,
    updateListStatus
  } = useShoppingList(listId)

  // Nomes em português para categorias com emojis
  const categoryNames: Record<string, string> = {
    'Frutas': '🍎 Frutas',
    'Vegetais': '🥦 Vegetais',
    'Carnes': '🍗 Carnes',
    'Proteínas': '🥚 Proteínas',
    'Laticínios': '🥛 Laticínios',
    'Grãos': '🍚 Grãos',
    'Temperos': '🧂 Temperos',
    'Mercearia': '🛒 Mercearia',
    'Padaria': '🥖 Padaria',
    'Bebidas': '🥤 Bebidas',
    'Congelados': '❄️ Congelados',
    'Higiene': '🧼 Higiene',
    'Limpeza': '🧹 Limpeza',
    'outros': '🛒 Outros'
  }

  // Pegar todas as categorias únicas dos itens
  const allCategories = Object.keys(itemsByCategory)
  const sortedCategories = allCategories.sort()

  const handleMarkAllChecked = async () => {
    const allChecked = checkedItems === totalItems
    await markAllChecked(!allChecked)
  }

  const handleDeleteList = async () => {
    if (confirm('Tem certeza que deseja arquivar esta lista?')) {
      await updateListStatus('archived')
      router.push('/shopping-list')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="container max-w-4xl mx-auto p-4 text-center">
        <div className="mt-12 space-y-4">
          <div className="text-6xl">🛒</div>
          <h2 className="text-2xl font-bold text-primary">Lista não encontrada</h2>
          <Button onClick={() => router.push('/shopping-list')}>
            Ver Minhas Listas
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container max-w-4xl mx-auto p-4">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/shopping-list')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              {list.name}
            </h1>
          </div>

          {/* Empty State */}
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">📝</div>
            <h2 className="text-2xl font-bold text-primary">Lista vazia</h2>
            <p className="text-muted-foreground">
              Esta lista ainda não tem itens. Aguarde o processamento pela IA.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/shopping-list')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              {list.name}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
              Itens necessários para suas receitas
            </p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {checkedItems} de {totalItems} itens comprados
            </span>
            <span className="text-primary font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress
            value={progress}
            className="h-3 bg-gray-200 dark:bg-gray-800"
            indicatorClassName="bg-gradient-to-r from-secondary to-primary"
          />
        </div>

        {/* Lista de Itens por Categoria */}
        <div className="space-y-6 mb-8">
          {sortedCategories.map(category => (
            <div key={category} className="space-y-3">
              <h2 className="text-lg font-semibold text-primary px-2">
                {categoryNames[category] || category}
              </h2>
              <div className="space-y-2">
                {itemsByCategory[category].map(item => (
                  <ShoppingListItemComponent
                    key={item.id}
                    item={item}
                    onToggle={toggleItemChecked}
                    onDelete={removeItem}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="sticky bottom-4 space-y-3 pb-4">
          <Button
            size="lg"
            className="w-full bg-secondary hover:bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            onClick={handleMarkAllChecked}
          >
            {checkedItems === totalItems ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Desmarcar Todos
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Marcar Todos como Comprados
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="border-secondary text-secondary hover:bg-secondary/5 rounded-xl"
              onClick={handleDeleteList}
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Arquivar
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-secondary text-secondary hover:bg-secondary/5 rounded-xl"
              onClick={() => {
                alert('Exportação em PDF será implementada em breve!')
              }}
            >
              <Download className="h-5 w-5 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
