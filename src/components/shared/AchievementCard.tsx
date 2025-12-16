'use client'

import { Trophy, Lock, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useUserAchievements } from '@/hooks/useAchievements'

export function AchievementCard() {
  const { checkins, nextMilestone, loading } = useUserAchievements()
  const progress = (checkins / nextMilestone) * 100

  return (
    <Card className="border border-primary/20 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {loading ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <Trophy className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold">Seu Progresso</h3>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Carregando...' : `${checkins} check-ins realizados`}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Próxima conquista
            </span>
            <span className="font-medium">
              {loading ? '-/-' : `${checkins}/${nextMilestone}`}
            </span>
          </div>
          <Progress value={loading ? 0 : progress} className="h-1.5" />
        </div>

        {/* Milestone Indicators */}
        <div className="flex justify-between mt-1.5 gap-1">
          {[5, 10, 25, 50, 100].map((milestone, i) => {
            const isUnlocked = checkins >= milestone

            return (
              <div
                key={i}
                className={`
                  flex-1 h-1.5 rounded-full transition-colors
                  ${isUnlocked ? 'bg-primary' : 'bg-gray-200'}
                `}
                title={`${milestone} check-ins`}
              />
            )
          })}
        </div>

        {/* Future Feature Notice */}
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded">
          <Lock className="w-3 h-3 flex-shrink-0" />
          <span>Sistema de conquistas será ativado em breve</span>
        </div>
      </CardContent>
    </Card>
  )
}
