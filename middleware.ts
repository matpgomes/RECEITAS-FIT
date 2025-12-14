import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Verificar autenticação
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Se houver erro de autenticação (token inválido), tratar como não autenticado
  const isAuthenticated = user && !authError

  // Rotas públicas (não requerem autenticação)
  const publicRoutes = ['/login', '/signup', '/auth/callback', '/']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Se não está autenticado e tenta acessar rota protegida
  if (!isAuthenticated && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se não está autenticado e está na raiz, redirecionar para login
  if (!isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se está autenticado e tenta acessar login/signup ou raiz, redirecionar para home
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Verificar se o usuário completou o onboarding
  if (isAuthenticated && !isPublicRoute && !pathname.startsWith('/onboarding')) {
    const { data: userData } = await supabase
      .from('users')
      .select('profile_completed')
      .eq('id', user.id)
      .single()

    // Se perfil não está completo, redirecionar para onboarding
    if (userData && !userData.profile_completed) {
      if (!pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/onboarding/step-1', request.url))
      }
    }
  }

  // Verificar trial expirado (apenas em rotas protegidas do app)
  if (
    isAuthenticated &&
    !isPublicRoute &&
    !pathname.startsWith('/onboarding') &&
    !pathname.startsWith('/paywall')
  ) {
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_status, trial_end_date, subscription_end_date')
      .eq('id', user.id)
      .single()

    if (userData) {
      const now = new Date()
      let isAccessAllowed = false

      // Verificar status da assinatura
      if (userData.subscription_status === 'active') {
        // Assinatura ativa - verificar se não expirou
        if (userData.subscription_end_date) {
          const subEndDate = new Date(userData.subscription_end_date)
          isAccessAllowed = subEndDate > now
        } else {
          // Assinatura ativa sem data de fim (erro de dados)
          isAccessAllowed = true
        }
      } else if (userData.subscription_status === 'trial') {
        // Trial - verificar se não expirou
        if (userData.trial_end_date) {
          const trialEndDate = new Date(userData.trial_end_date)
          isAccessAllowed = trialEndDate > now
        } else {
          // Trial sem data de fim (erro de dados)
          isAccessAllowed = true
        }
      }
      // subscription_status === 'expired' ou 'canceled' -> isAccessAllowed = false

      // Se acesso não permitido, redirecionar para paywall
      if (!isAccessAllowed) {
        return NextResponse.redirect(new URL('/paywall', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
