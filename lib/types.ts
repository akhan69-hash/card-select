export interface CardRow {
  id: number
  name: string
  type: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Champion'
  elixir_cost: number | null
  image_url: string | null
  has_evolution: boolean
  evolution_image_url: string | null
  evolution_ability_description: string | null
  has_hero: boolean
  hero_image_url: string | null
  hero_ability_description: string | null
  win_rate: number | null
  usage_rate: number | null
  times_used: number | null
}

export const RARITY_COLORS: Record<string, string> = {
  Common: '#8B7355',
  Rare: '#5B87C2',
  Epic: '#9B59B6',
  Legendary: '#F39C12',
  Champion: '#E74C3C',
}
