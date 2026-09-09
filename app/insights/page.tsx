import { getAllCards } from '@/lib/cards'
import InsightsCharts from '@/components/InsightsCharts'
import NavBar from '@/components/NavBar'
import SiteFooter from '@/components/SiteFooter'

export const revalidate = 3600

export default async function InsightsPage() {
  const cards = await getAllCards()

  return (
    <main className="flex-1 flex flex-col px-4 py-10 max-w-6xl mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl tracking-normal break-words px-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          INSIGHTS
        </h1>
        <p className="text-white/50 text-sm mt-2 max-w-md mx-auto">
          The real data behind every card — rarity spread, elixir curve, and who&apos;s actually
          winning right now.
        </p>
      </div>

      <NavBar />
      <InsightsCharts cards={cards} />
      <SiteFooter />
    </main>
  )
}
