'use client'

import { useState, memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Clock, Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/star-rating'
import { cn } from '@/lib/utils'
import type { Recipe } from '@/types/recipe'

interface RecipeCardProps {
  recipe: Recipe
  isFavorite?: boolean
  onToggleFavorite?: (recipeId: string, isFavorited: boolean) => void
  averageRating?: number
  totalReviews?: number
  className?: string
}

export const RecipeCard = memo(function RecipeCard({
  recipe,
  isFavorite = false,
  onToggleFavorite,
  averageRating = 0,
  totalReviews = 0,
  className,
}: RecipeCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault() // Prevent link navigation
    e.stopPropagation()

    if (!onToggleFavorite || isLoading) return

    setIsLoading(true)

    try {
      await onToggleFavorite(recipe.id, isFavorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Link href={`/recipe/${recipe.id}`}>
      <Card className={cn(
        'overflow-hidden cursor-pointer p-0',
        'shadow-sm hover:shadow-md border border-neutral-200 dark:border-neutral-700',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1',
        className
      )}>
        <div className="relative w-full h-56 -m-0">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            style={{ objectPosition: 'center center' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={75}
            loading="lazy"
          />

          {/* Favorite Button */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-2 right-2 rounded-full bg-white/90 hover:bg-white',
                'transition-colors duration-200',
                isFavorite && 'text-red-500'
              )}
              onClick={handleToggleFavorite}
              disabled={isLoading}
            >
              <Heart
                key={isFavorite ? 'liked' : 'not-liked'}
                className={cn(
                  'h-5 w-5',
                  isFavorite && 'fill-current animate-heart-beat'
                )}
              />
            </Button>
          )}

          {/* Category Badge */}
          {recipe.category && (
            <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm">
              {recipe.category}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
            {recipe.title}
          </h3>

          {/* Rating */}
          {totalReviews > 0 && (
            <div className="mb-3">
              <StarRating
                rating={averageRating}
                totalReviews={totalReviews}
                size="sm"
                showCount={true}
              />
            </div>
          )}

          {recipe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {recipe.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.prep_time_minutes} min</span>
            </div>

            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-foreground">
                {recipe.calories_fit} cal
              </span>
              {recipe.calories_saved > 0 && (
                <span className="text-green-600 text-xs">
                  (-{recipe.calories_saved})
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{recipe.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
})
