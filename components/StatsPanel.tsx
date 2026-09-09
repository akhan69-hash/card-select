import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RARITY_COLORS, type CardRow } from '@/lib/types'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-xl px-3 py-2.5 text-center border border-white/10">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-white/40 text-[10px] uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  )
}

export default function StatsPanel({ card }: { card: CardRow }) {
  const color = RARITY_COLORS[card.rarity] ?? RARITY_COLORS.Common

  return (
    <div className="w-full max-w-[280px] mx-auto mt-5">
      <h2 className="font-display text-2xl text-center tracking-wide">{card.name}</h2>
      <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
        <Badge style={{ backgroundColor: `${color}30`, color, borderColor: `${color}60` }} variant="outline">
          {card.rarity}
        </Badge>
        <Badge variant="outline" className="border-white/20 text-white/70">
          {card.type}
        </Badge>
        {card.has_evolution && (
          <Badge variant="outline" className="border-purple-400/40 text-purple-300">
            ⬆ Evolution
          </Badge>
        )}
        {card.has_hero && (
          <Badge variant="outline" className="border-amber-400/40 text-amber-300">
            ★ Hero
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Stat label="Win Rate" value={card.win_rate != null ? `${card.win_rate}%` : '—'} />
        <Stat label="Usage Rate" value={card.usage_rate != null ? `${card.usage_rate}%` : '—'} />
        <Stat label="Elixir" value={card.elixir_cost != null ? `${card.elixir_cost}` : 'Varies'} />
      </div>

      {(card.evolution_ability_description || card.hero_ability_description) && (
        <>
          <Separator className="my-4 bg-white/10" />
          <div className="space-y-2 text-xs text-white/60 leading-relaxed">
            {card.evolution_ability_description && (
              <p>
                <span className="text-purple-300 font-semibold">Evolution — </span>
                {card.evolution_ability_description}
              </p>
            )}
            {card.hero_ability_description && (
              <p>
                <span className="text-amber-300 font-semibold">Hero — </span>
                {card.hero_ability_description}
              </p>
            )}
          </div>
        </>
      )}

      {card.times_used != null && (
        <p className="text-center text-white/30 text-[10px] mt-4">
          From {card.times_used.toLocaleString()} real collected battles
        </p>
      )}
    </div>
  )
}
