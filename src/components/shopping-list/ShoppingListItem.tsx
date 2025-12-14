'use client'

import { useState } from 'react'
import { Check, ChevronRight, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ShoppingListItem } from '@/lib/supabase/queries/shopping-list'

interface ShoppingListItemProps {
  item: ShoppingListItem
  onToggle: (itemId: string) => void
  onDelete?: (itemId: string) => void
  showActions?: boolean
}

export function ShoppingListItemComponent({
  item,
  onToggle,
  onDelete,
  showActions = true
}: ShoppingListItemProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)
    onToggle(item.id)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id)
    }
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 ease-out p-0 cursor-pointer',
        'shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
        item.is_checked && 'bg-gradient-to-r from-green-50/30 to-green-100/30 dark:from-green-900/10 dark:to-green-800/10',
        isAnimating && 'scale-[0.98]'
      )}
      onClick={handleToggle}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Checkbox/Check Button */}
        <div
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 ease-out',
            'flex items-center justify-center',
            item.is_checked
              ? 'bg-[#6AA66C] border-[#6AA66C] scale-110'
              : 'border-secondary hover:border-primary hover:bg-secondary/5'
          )}
        >
          {item.is_checked && (
            <Check
              className={cn(
                'h-4 w-4 text-white',
                isAnimating && 'animate-heart-beat'
              )}
            />
          )}
        </div>

        {/* Emoji Icon */}
        {item.emoji && (
          <div className="flex-shrink-0 text-2xl">
            {item.emoji}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            'font-medium text-base transition-all duration-200',
            item.is_checked
              ? 'text-gray-500 dark:text-gray-400 line-through'
              : 'text-primary'
          )}>
            {item.ingredient_name}
          </div>
          <div className={cn(
            'text-sm transition-all duration-200',
            item.is_checked
              ? 'text-gray-400 dark:text-gray-500'
              : 'text-gray-600 dark:text-gray-400'
          )}>
            {item.quantity} {item.unity}
          </div>
          {item.notes && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
              {item.notes}
            </div>
          )}
        </div>

        {/* Action Icons */}
        {showActions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {!item.is_checked && (
              <ChevronRight className={cn(
                'h-5 w-5 transition-colors',
                'text-secondary'
              )} />
            )}
          </div>
        )}
      </div>

      {/* Subtle bottom border for completed items */}
      {item.is_checked && (
        <div className="h-1 bg-gradient-to-r from-green-400/20 via-green-500/20 to-green-400/20" />
      )}
    </Card>
  )
}
