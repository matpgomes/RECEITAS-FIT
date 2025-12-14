'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Star, User, ImageIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useCheckIns, type CheckIn } from '@/hooks/useCheckIns'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RecipeCheckInsProps {
  recipeId: string
}

export function RecipeCheckIns({ recipeId }: RecipeCheckInsProps) {
  const { getRecipeCheckIns } = useCheckIns()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadCheckIns = async () => {
      setLoading(true)
      const data = await getRecipeCheckIns(recipeId)
      setCheckIns(data)
      setLoading(false)
    }

    loadCheckIns()
  }, [recipeId])

  const handleImageError = (checkInId: string) => {
    setImageErrors(prev => new Set(prev).add(checkInId))
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Avaliações da Comunidade</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (checkIns.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Avaliações da Comunidade</h3>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Seja o primeiro a fazer check-in desta receita! 🎉
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">
        Avaliações da Comunidade ({checkIns.length})
      </h3>
      <div className="space-y-3">
        {checkIns.map((checkIn) => (
          <Card key={checkIn.id}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                {/* Photo */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  {imageErrors.has(checkIn.id) ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <Image
                      src={checkIn.photo_url}
                      alt="Foto do check-in"
                      fill
                      className="object-cover"
                      onError={() => handleImageError(checkIn.id)}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* User and Date */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>Usuário</span>
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(checkIn.created_at), "dd 'de' MMM", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  {/* Rating */}
                  {checkIn.rating && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-4 w-4',
                            star <= checkIn.rating!
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Comment */}
                  {checkIn.comment && (
                    <p className="text-sm text-foreground line-clamp-3">
                      {checkIn.comment}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
