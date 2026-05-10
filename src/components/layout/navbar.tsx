'use client'

import Link from 'next/link'
import { Search, Bell, ShoppingCart, User, Heart, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useCartCount } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import type { AuthUser } from '@/types/database'

interface NavbarProps {
  user?: AuthUser | null
}

export default function Navbar({ user }: NavbarProps) {
  const cartCount = useCartCount()
  const toggleDrawer = useUIStore((s) => s.toggleMobileDrawer)
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all duration-200">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-12 mx-auto">
        {/* Logo - Always visible on auth/landing, mobile only on dashboard (since sidebar exists) */}
        <Link href="/" className={cn(
          "flex items-center gap-2 transition-transform hover:scale-105",
          !isAuthPage && "md:hidden"
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <span className="font-black text-lg tracking-tight text-foreground">SehatKu</span>
        </Link>

        {/* Search Bar - Hidden on Auth Pages */}
        {!isAuthPage ? (
          <div className="relative hidden flex-1 max-w-md md:flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input 
              type="search" 
              placeholder="Cari obat atau kategori..." 
              className="pl-9 h-11 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-1" /> // Spacer for auth pages
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notification */}
              <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
              </Button>

              {/* Cart */}
              <Link href="/cart" className="hidden sm:inline-flex">
                <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] font-bold border-2 border-background">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Profile Shortcut */}
              <div className="hidden md:flex ml-2 pl-4 border-l border-border h-8 items-center gap-3">
                <Link href="/profile">
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="text-right">
                      <p className="text-xs font-bold leading-none group-hover:text-primary transition-colors">{user.profile.full_name || 'Pengguna'}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Akun Saya</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <User className="h-4.5 w-4.5" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Mobile Menu Toggle (Visible on dashboard for mobile) */}
              {!isAuthPage && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                  onClick={toggleDrawer}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-bold">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="font-bold rounded-xl shadow-lg shadow-primary/20">Daftar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
