import { getAllCards } from '@/lib/cards'
import InsightsCharts from '@/components/InsightsCharts'
import NavBar from '@/components/NavBar'
import SiteFooter from '@/components/SiteFooter'
import CountUpStat from '@/components/CountUpStat'

export const revalidate = 3600

export default async function InsightsPage() {
  const cards = await getAllCards()
  const totalBattles = cards.reduce((sum, c) => sum + (c.times_used ?? 0), 0)
  const avgWinRate =
    cards.filter((c) => c.win_rate != null).reduce((sum, c) => sum + (c.win_rate ?? 0), 0) /
    (cards.filter((c) => c.win_rate != null).length || 1)

  return (
    <main className="flex-1 flex flex-col px-4 py-10 max-w-6xl mx-auto w-full">
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl sm:text-4xl tracking-normal break-words px-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          INSIGHTS
        </h1>
        <p className="text-white/50 text-sm mt-2 max-w-md mx-auto">
          The real data behind every card — rarity spread, elixir curve, and who&apos;s actually
          winning right now.
        </p>
      </div>

      <div className="flex items-center justify-center gap-8 mb-8">
        <div className="text-center">
          <div className="font-display text-2xl text-cyan-300">
            <CountUpStat value={cards.length} />
          </div>
          <div className="text-white/40 text-[10px] uppercase tracking-wide">Real Cards</div>
        </div>
        <div className="text-center">
          <div className="font-display text-2xl text-amber-300">
            <CountUpStat value={Math.round(totalBattles)} />
          </div>
          <div className="text-white/40 text-[10px] uppercase tracking-wide">Real Card-Appearances</div>
        </div>
        <div className="text-center">
          <div className="font-display text-2xl text-purple-300">
            <CountUpStat value={avgWinRate} suffix="%" decimals={1} />
          </div>
          <div className="text-white/40 text-[10px] uppercase tracking-wide">Avg Win Rate</div>
        </div>
      </div>

      <NavBar />
      <InsightsCharts cards={cards} />
      <SiteFooter />
    </main>
  )
}
