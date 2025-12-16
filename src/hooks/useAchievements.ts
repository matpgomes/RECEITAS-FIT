'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserAchievements {
    checkins: number
    nextMilestone: number
    loading: boolean
}

// Milestones do sistema
const MILESTONES = [5, 10, 25, 50, 100]

export function useUserAchievements(): UserAchievements {
    const [checkins, setCheckins] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCheckinsCount() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    setLoading(false)
                    return
                }

                const { count, error } = await supabase
                    .from('check_ins')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('moderation_status', 'approved')

                if (error) {
                    console.error('Error fetching checkins count:', error)
                    setLoading(false)
                    return
                }

                setCheckins(count || 0)
            } catch (err) {
                console.error('Error in useUserAchievements:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchCheckinsCount()
    }, [])

    // Calcular próximo milestone
    const nextMilestone = MILESTONES.find(m => m > checkins) || MILESTONES[MILESTONES.length - 1]

    return {
        checkins,
        nextMilestone,
        loading
    }
}
