import { Toaster } from '@/components/ui/sonner'
import { ScrollToTop } from '@/components/shared/ScrollToTop'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ScrollToTop />
      {children}
      <Toaster />
    </>
  )
}
