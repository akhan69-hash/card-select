import type { CardRow } from './types'

export function rarityBreakdown(cards: CardRow[]) {
  const counts: Record<string, number> = {}
  for (const c of cards) counts[c.rarity] = (counts[c.rarity] ?? 0) + 1
  return Object.entries(counts).map(([rarity, count]) => ({ rarity, count }))
}

export function elixirBreakdown(cards: CardRow[]) {
  const counts: Record<number, number> = {}
  for (const c of cards) {
    if (c.elixir_cost == null) continue
    counts[c.elixir_cost] = (counts[c.elixir_cost] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([elixir, count]) => ({ elixir: Number(elixir), count }))
    .sort((a, b) => a.elixir - b.elixir)
}

export function topByWinRate(cards: CardRow[], n = 10) {
  return [...cards]
    .filter((c) => c.win_rate != null)
    .sort((a, b) => (b.win_rate ?? 0) - (a.win_rate ?? 0))
    .slice(0, n)
}

export function topByUsage(cards: CardRow[], n = 10) {
  return [...cards]
    .filter((c) => c.usage_rate != null)
    .sort((a, b) => (b.usage_rate ?? 0) - (a.usage_rate ?? 0))
    .slice(0, n)
}

export function scatterData(cards: CardRow[]) {
  return cards
    .filter((c) => c.win_rate != null && c.usage_rate != null && c.elixir_cost != null)
    .map((c) => ({
      name: c.name,
      elixir: c.elixir_cost,
      winRate: c.win_rate,
      usage: c.usage_rate,
      rarity: c.rarity,
    }))
}
