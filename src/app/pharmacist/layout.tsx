import { requireRole } from '@/lib/supabase/auth-helpers'
import { LayoutDashboard, FileText, ArrowLeft, Heart, LogOut } from 'lucide-react'
import Link from 'next/link'
import { logoutAction } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'

export default async function PharmacistLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(['pharmacist', 'admin'])

  const navItems = [
    { label: 'Dashboard', href: '/pharmacist', icon: LayoutDashboard },
    { label: 'Validasi Resep', href: '/pharmacist/prescriptions', icon: FileText },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Pharmacist */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg">SehatKu <span className="text-[10px] text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded">Apoteker</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          {user.profile.role === 'admin' && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs font-bold border-primary/20 text-primary hover:bg-primary/5 rounded-xl h-10 mb-2">
                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                Kembali ke Admin
              </Button>
            </Link>
          )}
          
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl h-10">
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Keluar Panel
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
