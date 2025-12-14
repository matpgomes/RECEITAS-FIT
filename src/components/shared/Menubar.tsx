'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, ShoppingCart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/home', icon: Home, label: 'Início' },
  { href: '/recipes', icon: BookOpen, label: 'Receitas' },
  { href: '/shopping-list', icon: ShoppingCart, label: 'Lista' },
  { href: '/profile', icon: User, label: 'Perfil' },
]

export function Menubar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#2A2236] border-t border-neutral-200 dark:border-neutral-700 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-around h-16">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/home' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
