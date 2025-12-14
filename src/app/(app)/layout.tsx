import { Menubar } from '@/components/shared/Menubar'
import { ScrollToTop } from '@/components/shared/ScrollToTop'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen pb-20">
      <ScrollToTop />
      <main>{children}</main>
      <Menubar />
    </div>
  )
}
