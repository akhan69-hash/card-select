'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import CardTile from '@/components/CardTile'
import type { CardRow } from '@/lib/types'

const RARITIES = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Champion']

export default function CardGrid({ cards }: { cards: CardRow[] }) {
  const [query, setQuery] = useState('')
  const [rarity, setRarity] = useState('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cards.filter((c) => {
      if (rarity !== 'All' && c.rarity !== rarity) return false
      if (q && !c.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [cards, query, rarity])

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a card..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Select value={rarity} onValueChange={(v) => setRarity(v ?? 'All')}>
          <SelectTrigger className="w-full sm:w-[160px] bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RARITIES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-white/40 text-sm py-12">No cards match that search.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {filtered.map((card) => (
            <CardTile key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  )
}
