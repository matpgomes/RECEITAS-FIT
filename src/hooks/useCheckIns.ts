import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface CheckIn {
  id: string
  user_id: string
  recipe_id: string
  photo_url: string
  rating: number | null
  comment: string | null
  moderation_status: 'pending' | 'approved' | 'rejected'
  points_earned: number
  created_at: string
  updated_at: string
}

export function useCheckIns(userId?: string, recipeId?: string) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchCheckIns = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('check_ins')
        .select('*')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (recipeId) {
        query = query.eq('recipe_id', recipeId)
      }

      const { data, error } = await query

      if (error) throw error

      setCheckIns(data || [])
    } catch (err: any) {
      console.error('Error fetching check-ins:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCheckIns()
  }, [userId, recipeId])

  const createCheckIn = async (
    recipeId: string,
    photoUrl: string,
    rating: number | null = null,
    comment: string | null = null
  ): Promise<CheckIn | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Você precisa estar logado para fazer check-in')
        return null
      }

      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          user_id: user.id,
          recipe_id: recipeId,
          photo_url: photoUrl,
          rating,
          comment,
          moderation_status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Check-in realizado com sucesso! 🎉', {
        description: 'Sua publicação está em análise e você ganhará 10 pontos quando for aprovada.',
      })

      // Refresh check-ins
      await fetchCheckIns()

      return data
    } catch (err: any) {
      console.error('Error creating check-in:', err)
      toast.error('Erro ao fazer check-in: ' + err.message)
      return null
    }
  }

  const deleteCheckIn = async (checkInId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('check_ins').delete().eq('id', checkInId)

      if (error) throw error

      toast.success('Check-in removido com sucesso')

      // Refresh check-ins
      await fetchCheckIns()

      return true
    } catch (err: any) {
      console.error('Error deleting check-in:', err)
      toast.error('Erro ao remover check-in: ' + err.message)
      return false
    }
  }

  const getUserCheckInsCount = async (userId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) throw error

      return count || 0
    } catch (err: any) {
      console.error('Error getting check-ins count:', err)
      return 0
    }
  }

  const getRecipeCheckIns = async (recipeId: string): Promise<CheckIn[]> => {
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (err: any) {
      console.error('Error getting recipe check-ins:', err)
      return []
    }
  }

  const hasUserCheckedIn = async (recipeId: string): Promise<boolean> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      const { data, error } = await supabase
        .from('check_ins')
        .select('id')
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error

      return !!data
    } catch (err: any) {
      console.error('Error checking user check-in:', err)
      return false
    }
  }

  return {
    checkIns,
    loading,
    error,
    createCheckIn,
    deleteCheckIn,
    getUserCheckInsCount,
    getRecipeCheckIns,
    hasUserCheckedIn,
    refetch: fetchCheckIns,
  }
}
