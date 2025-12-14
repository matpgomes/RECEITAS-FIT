'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signinSchema, type SigninInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninInput>({
    resolver: zodResolver(signinSchema),
  })

  const onSubmit = async (data: SigninInput) => {
    setIsLoading(true)

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast.error('Email ou senha incorretos')
        return
      }

      if (authData.user) {
        toast.success('Login realizado com sucesso! 🎉')

        // Verificar se completou onboarding
        const { data: userData } = await supabase
          .from('users')
          .select('profile_completed')
          .eq('id', authData.user.id)
          .single()

        // Verificar se tem perfil completo
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', authData.user.id)
          .single()

        if (profileData && userData?.profile_completed) {
          // Usuário já completou onboarding, ir para home
          router.push('/home')
        } else {
          // Usuário precisa completar onboarding
          router.push('/onboarding/step-1')
        }
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <a
            href="/reset-password"
            className="text-xs text-green-600 hover:text-green-700"
          >
            Esqueceu?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
