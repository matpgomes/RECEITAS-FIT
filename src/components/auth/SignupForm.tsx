'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true)

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Tratar erro de email duplicado especificamente
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          toast.error('Este email já está cadastrado. Faça login ou use outro email.')
        } else {
          toast.error(error.message)
        }
        return
      }

      // Verificar se o usuário já existe (Supabase retorna user mesmo se já existir)
      if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        toast.error('Este email já está cadastrado. Por favor, faça login.')
        return
      }

      if (authData.user) {
        toast.success('Conta criada com sucesso! 🎉')
        toast.info('Verifique seu email para confirmar a conta')
        toast.info('Você ganhou 7 dias de trial grátis!')

        // Redirecionar para onboarding
        router.push('/onboarding/step-1')
      }
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.')
      console.error('Signup error:', error)
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
        <Label htmlFor="password">Senha</Label>
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
        <p className="text-xs text-gray-500">
          Mínimo 6 caracteres, com letra maiúscula e número
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Criando conta...' : 'Começar Trial Grátis 🎉'}
      </Button>

      <p className="text-xs text-center text-gray-500">
        Ao criar sua conta, você ganha 7 dias grátis para testar!
      </p>
    </form>
  )
}
