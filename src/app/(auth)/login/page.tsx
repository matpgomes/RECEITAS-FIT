import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Receitas Fit 🥗
          </h1>
          <p className="text-lg text-gray-600">
            Bem-vindo de volta!
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Fazer Login
          </h2>

          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ainda não tem uma conta?{' '}
              <Link
                href="/signup"
                className="font-semibold text-green-600 hover:text-green-700"
              >
                Começar trial grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
