'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function GuruBKNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/guru-bk', label: 'Dashboard' },
    { href: '/guru-bk/categories', label: 'Kategori' },
  ]

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        // Fix active state: exact match for /guru-bk, or starts with for /guru-bk/categories
        const isActive =
          item.href === '/guru-bk'
            ? pathname === '/guru-bk'
            : pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

