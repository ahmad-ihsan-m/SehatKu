'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Heart,
  LayoutDashboard,
  Pill,
  ShoppingCart,
  ClipboardList,
  FileText,
  Bell,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/features/auth/actions'
import type { AuthUser } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { useCartCount } from '@/store/cart'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

const customerNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Katalog Obat', href: '/medicines', icon: Pill },
  { label: 'Keranjang', href: '/cart', icon: ShoppingCart },
  { label: 'Pesanan Saya', href: '/orders', icon: ClipboardList },
  { label: 'Resep Saya', href: '/prescriptions', icon: FileText },
  { label: 'Notifikasi', href: '/notifications', icon: Bell },
]

interface SidebarProps {
  user: AuthUser
  // cartCount and unreadNotifications are now handled via store/hooks for reactivity
  initialUnreadNotifications?: number
}

export default function Sidebar({ user, initialUnreadNotifications = 0 }: SidebarProps) {
  const pathname = usePathname()
  const cartCount = useCartCount()
  
  // TODO: Implement notification store for real-time unread count
  const unreadNotifications = initialUnreadNotifications

  const navItems = customerNav.map((item) => {
    if (item.href === '/cart') return { ...item, badge: cartCount }
    if (item.href === '/notifications') return { ...item, badge: unreadNotifications }
    return item
  })

  const displayName = user.profile.full_name ?? user.email ?? 'Pengguna'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0 shadow-sm z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border bg-sidebar-header">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
          <Heart className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-sidebar-foreground">SehatKu</span>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mt-1">Pharmacy</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-3 pb-3">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-primary hover:translate-x-1'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <Badge
                  variant="default"
                  className={cn(
                    'h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold',
                    isActive
                      ? 'bg-primary-foreground text-primary border-none'
                      : 'bg-primary text-primary-foreground shadow-sm'
                  )}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Profile & Logout */}
      <div className="border-t border-sidebar-border p-4 bg-muted/20">
        <Link
          href="/profile"
          className={cn(
            'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-all duration-200',
            pathname.startsWith('/profile')
              ? 'bg-primary/10 text-primary'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          )}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-black shrink-0 border border-primary/10">
            {user.profile.avatar_url ? (
              <img src={user.profile.avatar_url} alt={displayName} className="w-full h-full rounded-full object-cover" />
            ) : initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate leading-none">{displayName}</p>
            <p className="text-[9px] font-black text-primary/70 uppercase tracking-tighter mt-1">
              {user.profile.role}
            </p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>

        <form action={logoutAction} className="mt-2">
          <button
            type="submit"
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar Sesi</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
