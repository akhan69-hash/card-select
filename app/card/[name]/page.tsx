import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getCardByName } from '@/lib/cards'
import DiamondCard from '@/components/DiamondCard'
import StatsPanel from '@/components/StatsPanel'
import SiteFooter from '@/components/SiteFooter'

export const revalidate = 3600

export default async function CardPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const card = await getCardByName(decodeURIComponent(name))
  if (!card) notFound()

  return (
    <main className="flex-1 flex flex-col px-4 py-10 max-w-2xl mx-auto w-full">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Select
      </Link>

      <DiamondCard card={card} />
      <StatsPanel card={card} />
      <SiteFooter />
    </main>
  )
}
