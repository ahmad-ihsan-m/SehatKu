'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Heart,
  LayoutDashboard,
  Pill,
  ShoppingCart,
  ClipboardList,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useCartCount } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import type { AuthUser } from '@/types/database'

interface MobileNavProps {
  user: AuthUser
  initialUnreadNotifications?: number
}

const bottomNavItems = [
  { label: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Obat', href: '/medicines', icon: Pill },
  { label: 'Keranjang', href: '/cart', icon: ShoppingCart },
  { label: 'Pesanan', href: '/orders', icon: ClipboardList },
  { label: 'Profil', href: '/profile', icon: User },
]

export default function MobileNav({ user, initialUnreadNotifications = 0 }: MobileNavProps) {
  const pathname = usePathname()
  const cartCount = useCartCount()
  const { isMobileDrawerOpen, setMobileDrawerOpen } = useUIStore()
  
  // TODO: Implement notification store
  const unreadNotifications = initialUnreadNotifications

  const displayName = user.profile.full_name ?? user.email ?? 'Pengguna'

  return (
    <>
      {/* Drawer overlay */}
      {isMobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-sm font-black border border-primary/10">
                   {user.profile.avatar_url ? (
                    <img src={user.profile.avatar_url} alt={displayName} className="w-full h-full rounded-2xl object-cover" />
                  ) : displayName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">{displayName}</p>
                  <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest mt-1">
                    {user.profile.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
                aria-label="Tutup menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {[
                { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                { label: 'Katalog Obat', href: '/medicines', icon: Pill },
                { label: 'Keranjang', href: '/cart', icon: ShoppingCart, badge: cartCount },
                { label: 'Pesanan Saya', href: '/orders', icon: ClipboardList },
                { label: 'Resep Saya', href: '/prescriptions', icon: FileText },
                { label: 'Notifikasi', href: '/notifications', icon: Bell, badge: unreadNotifications },
                { label: 'Profil Saya', href: '/profile', icon: User },
              ].map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <Badge variant={isActive ? "secondary" : "default"} className="h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold">
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar Sesi
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border px-4 pb-safe-area-inset-bottom">
        <div className="grid grid-cols-5 py-2">
          {bottomNavItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-1 px-1 rounded-xl text-[10px] font-bold transition-all relative',
                  isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.href === '/cart' && cartCount > 0 && (
                  <span className="absolute top-0 right-2 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
                <span className="text-[9px] tracking-tighter">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
