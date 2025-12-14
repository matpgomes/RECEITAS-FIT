'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Crown, Sparkles } from 'lucide-react'

export default function PaywallPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string>('')
  const [trialEnded, setTrialEnded] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUserEmail(user.email || '')

      // Verificar status do trial
      const { data } = await supabase
        .from('users')
        .select('trial_end_date, subscription_status')
        .eq('id', user.id)
        .single()

      if (data) {
        const now = new Date()
        const trialEnd = data.trial_end_date ? new Date(data.trial_end_date) : null

        setTrialEnded(
          data.subscription_status === 'trial' && trialEnd ? trialEnd < now : false
        )
      }
    }
  }

  const handleSubscribe = () => {
    // TODO: Integrar com Stripe Checkout
    // Por enquanto, apenas mostra mensagem
    alert('Integração com Stripe será implementada em breve!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {trialEnded ? 'Seu Trial Acabou! 😢' : 'Desbloqueie Todo o Potencial'}
          </h1>
          <p className="text-lg text-gray-600">
            {trialEnded
              ? 'Continue sua jornada saudável com uma assinatura premium'
              : 'Acesso ilimitado a todas as funcionalidades'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Mensal */}
          <Card className="p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Mensal</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">R$ 29,90</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <Button onClick={handleSubscribe} className="w-full mb-6" size="lg">
                Assinar Agora
              </Button>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Receitas ilimitadas personalizadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Lista de compras com IA</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Check-ins e gamificação</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Dashboard de evolução</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* Anual - Destacado */}
          <Card className="p-8 relative overflow-hidden border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Economize 33%
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano Anual</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">R$ 19,90</span>
                <span className="text-gray-600">/mês</span>
                <div className="text-sm text-gray-500 mt-1">
                  Cobrado anualmente: R$ 238,80
                </div>
              </div>
              <Button
                onClick={handleSubscribe}
                className="w-full mb-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                Assinar Anual
              </Button>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Tudo do plano mensal</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Economize R$ 120/ano</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Acesso antecipado a novos recursos</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Garantia */}
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-center gap-3 text-green-800">
            <Check className="h-6 w-6" />
            <p className="font-semibold">
              Garantia de 7 dias - Cancele quando quiser, sem perguntas
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Pagamento seguro processado pelo Stripe
            <br />
            Seus dados estão protegidos com criptografia de ponta a ponta
          </p>
        </div>
      </div>
    </div>
  )
}
