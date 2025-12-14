'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number // 0 to 5, can be decimal (e.g., 3.5)
  totalReviews?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

export function StarRating({
  rating,
  totalReviews = 0,
  size = 'sm',
  showCount = true,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const starSize = sizeClasses[size]
  const textSize = textSizeClasses[size]

  // Ensure rating is between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating))

  const renderStar = (index: number) => {
    const starValue = index + 1
    const fillPercentage = Math.max(0, Math.min(100, (clampedRating - index) * 100))

    if (fillPercentage === 0) {
      // Empty star
      return (
        <Star
          key={index}
          className={cn(starSize, 'text-gray-300')}
        />
      )
    } else if (fillPercentage === 100) {
      // Full star
      return (
        <Star
          key={index}
          className={cn(starSize, 'text-yellow-500 fill-current')}
        />
      )
    } else {
      // Partial star
      return (
        <div key={index} className="relative inline-block">
          {/* Background empty star */}
          <Star className={cn(starSize, 'text-gray-300')} />
          {/* Foreground filled star with clip */}
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${fillPercentage}%` }}
          >
            <Star className={cn(starSize, 'text-yellow-500 fill-current')} />
          </div>
        </div>
      )
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
      </div>
      {showCount && (
        <span className={cn('text-muted-foreground', textSize)}>
          ({totalReviews})
        </span>
      )}
    </div>
  )
}
