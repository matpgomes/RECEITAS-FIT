'use client'

import { useState, useEffect } from 'react'
import { User, Settings, LogOut, Heart, ShoppingCart, ChefHat, Award, Edit, Lock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { EditProfileDialog } from '@/components/profile/EditProfileDialog'
import { PreferencesDialog } from '@/components/profile/PreferencesDialog'
import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog'

interface UserProfile {
  email: string
  name?: string
  created_at: string
}

interface UserStats {
  totalLists: number
  totalFavorites: number
  totalCheckIns: number
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    totalLists: 0,
    totalFavorites: 0,
    totalCheckIns: 0
  })
  const [loading, setLoading] = useState(true)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user }, error } = await supabase.auth.getUser()

      if (!user || error) {
        // Fazer logout completo para limpar tokens inválidos
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      setUserProfile({
        email: user.email || '',
        name: user.user_metadata?.name,
        created_at: user.created_at
      })

      // Get user stats
      const [listsResult, favoritesResult, checkInsResult] = await Promise.all([
        supabase
          .from('shopping_lists')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('user_favorite_recipes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('check_ins')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
      ])

      setUserStats({
        totalLists: listsResult.count || 0,
        totalFavorites: favoritesResult.count || 0,
        totalCheckIns: checkInsResult.count || 0
      })

    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      toast.error('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logout realizado com sucesso')
      // Usar replace ao invés de push e redirecionar diretamente para login
      window.location.href = '/login'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações e preferências</p>
      </div>

      {/* User Info Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold truncate">
              {userProfile?.name || 'Usuário'}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {userProfile?.email}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Membro desde {new Date(userProfile?.created_at || '').toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mx-auto">
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{userStats.totalFavorites}</div>
          <div className="text-xs text-muted-foreground">Favoritas</div>
        </Card>

        <Card className="p-4 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto">
            <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{userStats.totalLists}</div>
          <div className="text-xs text-muted-foreground">Listas</div>
        </Card>

        <Card className="p-4 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
            <ChefHat className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{userStats.totalCheckIns}</div>
          <div className="text-xs text-muted-foreground">Feitas</div>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Conquistas</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Continue preparando receitas para desbloquear conquistas!</p>
          <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <p className="font-medium text-foreground mb-2">🎯 Próxima conquista:</p>
            <p className="text-xs">Prepare {Math.max(5 - userStats.totalCheckIns, 0)} receitas para desbloquear "Chef Iniciante"</p>
          </div>
        </div>
      </Card>

      {/* Settings Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Configurações</h3>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setIsPreferencesOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Preferências
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setIsChangePasswordOpen(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Alterar Senha
          </Button>
        </div>
      </Card>

      {/* Logout Button */}
      <Button
        variant="outline"
        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sair da conta
      </Button>

      {/* Modals */}
      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        currentName={userProfile?.name || ''}
        currentEmail={userProfile?.email || ''}
        onProfileUpdated={loadUserData}
      />

      <PreferencesDialog
        isOpen={isPreferencesOpen}
        onOpenChange={setIsPreferencesOpen}
        onPreferencesUpdated={loadUserData}
      />

      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </div>
  )
}
