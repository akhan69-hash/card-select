'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { RARITY_COLORS, type CardRow } from '@/lib/types'

/**
 * One tile in the fighter-select-style grid -- a real card portrait glowing
 * in its own rarity color, lifting on hover. Clicking navigates to the big
 * "diamond" reveal at /card/[name].
 */
export default function CardTile({ card }: { card: CardRow }) {
  const [imgError, setImgError] = useState(false)
  const color = RARITY_COLORS[card.rarity] ?? RARITY_COLORS.Common

  return (
    <Link
      href={`/card/${encodeURIComponent(card.name)}`}
      className="group relative flex flex-col items-center gap-1.5 rounded-xl p-2 transition-transform duration-200 hover:-translate-y-1.5"
    >
      <div
        className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-black/40 transition-shadow duration-200"
        style={{
          border: `1.5px solid ${color}80`,
          boxShadow: `0 0 0 rgba(0,0,0,0)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ boxShadow: `0 0 22px 3px ${color}99` }}
        />
        {imgError || !card.image_url ? (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-white/60 text-center px-1">
            {card.name}
          </div>
        ) : (
          <Image
            src={card.image_url}
            alt={card.name}
            fill
            sizes="(max-width: 768px) 25vw, 12vw"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <span className="text-[11px] text-center leading-tight text-white/80 group-hover:text-white truncate w-full">
        {card.name}
      </span>
    </Link>
  )
}
