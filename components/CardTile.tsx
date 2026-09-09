'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { RARITY_COLORS, type CardRow } from '@/lib/types'

/**
 * One tile in the fighter-select-style grid -- a real card portrait glowing
 * in its own rarity color, with the same lightweight mouse-tracked tilt as
 * the big DiamondCard reveal (just a gentler max angle, since these tiles
 * are small and packed into a dense grid). Clicking navigates to the big
 * reveal at /card/[name].
 */
export default function CardTile({ card }: { card: CardRow }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [imgError, setImgError] = useState(false)
  const color = RARITY_COLORS[card.rarity] ?? RARITY_COLORS.Common

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: py * -12, ry: px * 12 })
  }
  const onLeave = () => setTilt({ rx: 0, ry: 0 })

  return (
    <Link
      href={`/card/${encodeURIComponent(card.name)}`}
      className="group flex flex-col items-center gap-1.5 rounded-xl p-2"
      style={{ perspective: 600 }}
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-black/40 transition-transform duration-150"
        style={{
          border: `1.5px solid ${color}80`,
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.rx || tilt.ry ? 1.08 : 1})`,
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
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
