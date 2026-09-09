import { getAllCards } from '@/lib/cards'
import CardGrid from '@/components/CardGrid'
import SiteFooter from '@/components/SiteFooter'
import NavBar from '@/components/NavBar'

export const revalidate = 3600 // real data changes slowly -- an hour is plenty fresh

export default async function Home() {
  const cards = await getAllCards()

  return (
    <main className="flex-1 flex flex-col px-4 py-10 max-w-6xl mx-auto w-full">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-5xl tracking-normal sm:tracking-wide break-words px-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          CARD SELECT
        </h1>
        <p className="text-white/50 text-sm mt-2 max-w-md mx-auto">
          Pick a card. Drag it, spin it, watch it reveal as a real 3D card with its own data on
          it — pulled from real, live-collected Clash Royale battles.
        </p>
      </div>

      <NavBar />
      <CardGrid cards={cards} />
      <SiteFooter />
    </main>
  )
}
