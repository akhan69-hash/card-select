'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Select' },
  { href: '/insights', label: 'Insights' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="flex justify-center gap-2 mb-8">
      {TABS.map((t) => {
        const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href)
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
