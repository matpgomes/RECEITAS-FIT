'use client'

import { useState, useEffect } from 'react'
import { User, Settings, LogOut, Edit, Lock } from 'lucide-react'
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
  avatar_url?: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
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
        avatar_url: user.user_metadata?.avatar_url,
        created_at: user.created_at
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
    <div className="container max-w-lg mx-auto px-4 py-3 pb-2 space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-primary">Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações e preferências</p>
      </div>

      {/* User Info Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt={userProfile.name || 'Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
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

      {/* Logout Button - Fixed to bottom */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-gradient-to-t from-background via-background to-transparent pt-4">
        <div className="container max-w-lg mx-auto">
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>

      {/* Modals */}
      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        currentName={userProfile?.name || ''}
        currentEmail={userProfile?.email || ''}
        currentAvatarUrl={userProfile?.avatar_url}
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
