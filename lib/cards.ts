import { supabase } from './supabaseClient'
import type { CardRow } from './types'

export async function getAllCards(): Promise<CardRow[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getCardByName(name: string): Promise<CardRow | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('name', name)
    .maybeSingle()
  if (error) throw error
  return data
}
