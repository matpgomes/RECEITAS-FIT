import Link from 'next/link'
import { SignupForm } from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Receitas Fite 🥗
          </h1>
          <p className="text-lg text-gray-600">
            Transforme sua saúde com receitas deliciosas
          </p>
          <div className="mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
            ✨ 7 dias grátis • Cancele quando quiser
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Criar Conta
          </h2>

          <SignupForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="font-semibold text-green-600 hover:text-green-700"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Ao criar sua conta, você concorda com nossos</p>
          <p>
            <Link href="/terms" className="underline hover:text-gray-700">
              Termos de Serviço
            </Link>
            {' e '}
            <Link href="/privacy" className="underline hover:text-gray-700">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
