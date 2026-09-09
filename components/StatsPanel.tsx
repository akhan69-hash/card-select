import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RARITY_COLORS, type CardRow } from '@/lib/types'

/** Real win rate/usage/elixir now live baked onto the card's own face (see
 * DiamondCard) -- this panel only holds what genuinely can't fit there:
 * the type/evolution/hero badges and the longer-form real ability text. */
export default function StatsPanel({ card }: { card: CardRow }) {
  const color = RARITY_COLORS[card.rarity] ?? RARITY_COLORS.Common

  return (
    <div className="w-full max-w-[360px] mx-auto mt-6">
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
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
