'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Slider } from '@/components/ui/slider'
import { RARITY_COLORS, type CardRow } from '@/lib/types'
import { rarityBreakdown, elixirBreakdown, topByWinRate, topByUsage, scatterData } from '@/lib/insights'

const cardCls = 'bg-white/5 border-white/10 backdrop-blur-sm'
// Real fix (2026-09-09): "hovering over it does not show the stats it just
// shows black bubble" -- contentStyle only ever set the tooltip BOX
// (background/border), never the TEXT color. Recharts' default tooltip
// text defaults dark, which on this near-black background made it
// invisible -- a literal black box with invisible text, exactly what got
// reported. labelStyle/itemStyle set the actual text colors.
const tooltipStyle = { background: '#0B0A14', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 12 }
const tooltipLabelStyle = { color: '#fff', fontWeight: 600, marginBottom: 4 }
const tooltipItemStyle = { color: 'rgba(255,255,255,0.85)' }
const axisTick = { fontSize: 11, fill: 'rgba(255,255,255,0.5)' }

const cardIn = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1 },
}

const RARITIES = ['Common', 'Rare', 'Epic', 'Legendary', 'Champion']

/** Real interactive data page (2026-09-09 feedback: "something user can
 * tweak and discover and play around with"): a rarity toggle strip and an
 * elixir-range slider actually filter every chart on the page at once, not
 * just decorate it -- this is the "tweak" the feedback asked for, not more
 * static charts. Tooltip text-color bug fixed (see tooltipLabelStyle/
 * tooltipItemStyle above). Bars/bubbles still click straight through to
 * that card's own 3D reveal. */
export default function InsightsCharts({ cards }: { cards: CardRow[] }) {
  const router = useRouter()
  const [activeRarities, setActiveRarities] = useState<string[]>(RARITIES)
  const [elixirRange, setElixirRange] = useState<[number, number]>([0, 9])

  const filtered = useMemo(
    () =>
      cards.filter(
        (c) =>
          activeRarities.includes(c.rarity) &&
          (c.elixir_cost == null || (c.elixir_cost >= elixirRange[0] && c.elixir_cost <= elixirRange[1]))
      ),
    [cards, activeRarities, elixirRange]
  )

  const rarity = rarityBreakdown(filtered)
  const elixir = elixirBreakdown(filtered)
  const winners = topByWinRate(filtered)
  const usage = topByUsage(filtered)
  const scatter = scatterData(filtered)

  const goToCard = (name: string) => router.push(`/card/${encodeURIComponent(name)}`)

  return (
    <div>
      {/* Real, live filter controls -- every chart below reacts instantly */}
      <Card className={`${cardCls} mb-5`}>
        <CardContent className="pt-5 space-y-4">
          <div>
            <div className="text-white/50 text-[11px] uppercase tracking-wide mb-2">Rarity</div>
            <ToggleGroup
              multiple
              value={activeRarities}
              onValueChange={(v) => setActiveRarities(v.length ? v : RARITIES)}
              className="flex-wrap justify-start gap-1.5"
            >
              {RARITIES.map((r) => (
                <ToggleGroupItem
                  key={r}
                  value={r}
                  className="rounded-full border text-xs px-3 h-7 data-[state=on]:text-black"
                  style={
                    activeRarities.includes(r)
                      ? { background: RARITY_COLORS[r], borderColor: RARITY_COLORS[r] }
                      : { borderColor: 'rgba(255,255,255,0.15)' }
                  }
                >
                  {r}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div>
            <div className="text-white/50 text-[11px] uppercase tracking-wide mb-3">
              Elixir Cost — {elixirRange[0]} to {elixirRange[1]}
            </div>
            <Slider
              value={elixirRange}
              onValueChange={(v) => {
                const arr = v as number[]
                setElixirRange([arr[0], arr[1]])
              }}
              min={0}
              max={9}
              step={1}
              className="max-w-md"
            />
          </div>
          <p className="text-white/30 text-[11px]">
            Showing {filtered.length} of {cards.length} real cards
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Rarity distribution */}
        <motion.div variants={cardIn} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} transition={{ type: 'spring', damping: 18, stiffness: 140 }}>
          <Card className={cardCls}>
            <CardHeader>
              <CardTitle className="text-white text-base">Cards by Rarity</CardTitle>
              <CardDescription>How the filtered roster breaks down</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {rarity.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={rarity} dataKey="count" nameKey="rarity" innerRadius={55} outerRadius={90} paddingAngle={3} animationDuration={800}>
                        {rarity.map((r) => (
                          <Cell key={r.rarity} fill={RARITY_COLORS[r.rarity] ?? '#8B7355'} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 -mt-2">
                    {rarity.map((r) => (
                      <span key={r.rarity} className="flex items-center gap-1.5 text-[11px] text-white/60">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: RARITY_COLORS[r.rarity] ?? '#8B7355' }} />
                        {r.rarity} ({r.count})
                      </span>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Elixir cost distribution */}
        <motion.div variants={cardIn} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} transition={{ type: 'spring', damping: 18, stiffness: 140, delay: 0.05 }}>
          <Card className={cardCls}>
            <CardHeader>
              <CardTitle className="text-white text-base">Elixir Cost Spread</CardTitle>
              <CardDescription>How many filtered cards sit at each elixir cost</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {elixir.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={elixir}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="elixir" tick={axisTick} />
                    <YAxis tick={axisTick} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="count" fill="#22D3EE" radius={[4, 4, 0, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top win rate -- click a bar to go see that card */}
        <motion.div variants={cardIn} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} transition={{ type: 'spring', damping: 18, stiffness: 140, delay: 0.1 }}>
          <Card className={cardCls}>
            <CardHeader>
              <CardTitle className="text-white text-base">Highest Real Win Rate</CardTitle>
              <CardDescription>Top 10 in the filtered set — click a bar to see the card</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {winners.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={winners} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={axisTick} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ ...axisTick, fill: 'rgba(255,255,255,0.75)' }} width={90} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="win_rate" radius={[0, 4, 4, 0]} animationDuration={800} cursor="pointer" onClick={(d: any) => goToCard(d.name)}>
                      {winners.map((c) => (
                        <Cell key={c.name} fill={RARITY_COLORS[c.rarity] ?? '#8B7355'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top usage -- also click-through */}
        <motion.div variants={cardIn} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} transition={{ type: 'spring', damping: 18, stiffness: 140, delay: 0.15 }}>
          <Card className={cardCls}>
            <CardHeader>
              <CardTitle className="text-white text-base">Most Used</CardTitle>
              <CardDescription>Top 10 in the filtered set — click a bar to see the card</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {usage.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usage} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                    <XAxis type="number" tick={axisTick} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ ...axisTick, fill: 'rgba(255,255,255,0.75)' }} width={90} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="usage_rate" radius={[0, 4, 4, 0]} animationDuration={800} cursor="pointer" onClick={(d: any) => goToCard(d.name)}>
                      {usage.map((c) => (
                        <Cell key={c.name} fill={RARITY_COLORS[c.rarity] ?? '#8B7355'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bubble chart -- the fun centerpiece, also click-through */}
        <motion.div variants={cardIn} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} transition={{ type: 'spring', damping: 18, stiffness: 140, delay: 0.2 }} className="lg:col-span-2">
          <Card className={cardCls}>
            <CardHeader>
              <CardTitle className="text-white text-base">Elixir vs. Win Rate</CardTitle>
              <CardDescription>
                Filtered cards, bubble size = how often it&apos;s actually used, color = rarity — click a bubble to see the card
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {scatter.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis type="number" dataKey="elixir" name="Elixir" tick={axisTick} domain={[0, 10]} />
                    <YAxis type="number" dataKey="winRate" name="Win Rate" tick={axisTick} unit="%" domain={[35, 65]} />
                    <ZAxis type="number" dataKey="usage" range={[40, 400]} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={((value: unknown, name: unknown) => [
                        name === 'Win Rate' ? `${value}%` : String(value),
                        String(name),
                      ]) as any}
                      labelFormatter={() => ''}
                    />
                    <Scatter data={scatter} fillOpacity={0.75} cursor="pointer" onClick={(d: any) => goToCard(d.name)} animationDuration={800}>
                      {scatter.map((d) => (
                        <Cell key={d.name} fill={RARITY_COLORS[d.rarity] ?? '#8B7355'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center text-white/30 text-sm text-center px-4">
      No cards match this filter — try widening the elixir range or rarity selection.
    </div>
  )
}
