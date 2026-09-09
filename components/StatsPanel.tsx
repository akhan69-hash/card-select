import { Separator } from '@/components/ui/separator'
import type { CardRow } from '@/lib/types'

/** Real win rate/usage/elixir/rarity/type all live on the card's own face
 * now (see DiamondCard), and Evolution/Hero have real clickable toggle
 * buttons right under the card -- this panel only holds what genuinely
 * can't fit anywhere else: the longer-form real ability text. */
export default function StatsPanel({ card }: { card: CardRow }) {
  if (!card.evolution_ability_description && !card.hero_ability_description && card.times_used == null) {
    return null
  }

  return (
    <div className="w-full max-w-[440px] mx-auto mt-6">
      {(card.evolution_ability_description || card.hero_ability_description) && (
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
      )}

      {card.times_used != null && (
        <>
          {(card.evolution_ability_description || card.hero_ability_description) && (
            <Separator className="my-4 bg-white/10" />
          )}
          <p className="text-center text-white/30 text-[10px]">
            From {card.times_used.toLocaleString()} real collected battles
          </p>
        </>
      )}
    </div>
  )
}
