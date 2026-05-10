import { LayoutDashboard, ShoppingBag, Pill, Users, FileText, ArrowLeft, Heart, LogOut } from 'lucide-react'
import Link from 'next/link'
import { logoutAction } from '@/features/auth/actions'
import { requireAdmin } from '@/lib/auth/guards'
import { AdminNav } from '@/features/admin/components/admin-nav'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { label: 'Pesanan', href: '/admin/orders', icon: 'ShoppingBag' },
    { label: 'Validasi Resep', href: '/pharmacist/prescriptions', icon: 'FileText' },
    { label: 'Katalog Obat', href: '/admin/medicines', icon: 'Pill' },
    { label: 'Pengguna', href: '/admin/users', icon: 'Users' },
  ]

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar Admin */}
      <aside className="w-72 border-r border-muted/30 bg-white flex flex-col shadow-sm">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-foreground">SehatKu</span>
            <div className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full w-fit">
              Admin Panel
            </div>
          </div>
        </div>

        <AdminNav items={navItems} />

        <div className="p-6 space-y-3 mt-auto">
          
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl h-10">
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Keluar Panel
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-muted/5">
        <div className="min-h-full p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  )
}
