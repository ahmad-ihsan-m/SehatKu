'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ShoppingBag, Pill, Users, FileText } from 'lucide-react'

const iconMap = {
  LayoutDashboard,
  ShoppingBag,
  Pill,
  Users,
  FileText
}

interface NavItem {
  label: string
  href: string
  icon: string
}

interface AdminNavProps {
  items: NavItem[]
}

export function AdminNav({ items }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
        const Icon = iconMap[item.icon as keyof typeof iconMap]
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            )}
          >
            {Icon && (
              <Icon className={cn(
                "w-4 h-4 transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
            )}
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
