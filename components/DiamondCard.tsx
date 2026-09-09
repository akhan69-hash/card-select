'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { RARITY_COLORS, type CardRow } from '@/lib/types'

/**
 * The "diamond quality" card reveal -- a real, large card portrait that
 * tilts toward the cursor (mouse-tracked rotateX/rotateY, the same cheap
 * CSS-transform technique Royale IQ itself uses, no 3D engine needed) with
 * a diagonal holographic sheen sweeping across it and a glow in the card's
 * own rarity color. Entrance is a quick scale-up-from-small "unboxing"
 * flash, not just a static fade-in.
 */
export default function DiamondCard({ card }: { card: CardRow }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [active, setActive] = useState(false)
  const [imgError, setImgError] = useState(false)
  const color = RARITY_COLORS[card.rarity] ?? RARITY_COLORS.Common

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: py * -16, ry: px * 16 })
  }
  const onLeave = () => {
    setTilt({ rx: 0, ry: 0 })
    setActive(false)
  }

  return (
    <div style={{ perspective: 1000 }} className="mx-auto w-full max-w-[280px]">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={onLeave}
        initial={{ opacity: 0, scale: 0.5, rotateY: -25 }}
        animate={{ opacity: 1, scale: active ? 1.04 : 1, rotateY: 0 }}
        transition={{ type: 'spring', damping: 16, stiffness: 140 }}
        className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: 'preserve-3d',
          border: `2px solid ${color}`,
          boxShadow: `0 0 50px 6px ${color}70, 0 20px 40px rgba(0,0,0,0.6)`,
          background: `linear-gradient(160deg, ${color}33, #0B0A14 65%)`,
        }}
      >
        {imgError || !card.image_url ? (
          <div className="w-full h-full flex items-center justify-center text-white/70 text-sm px-4 text-center">
            {card.name}
          </div>
        ) : (
          <Image
            src={card.image_url}
            alt={card.name}
            fill
            sizes="280px"
            className="object-cover"
            priority
            onError={() => setImgError(true)}
          />
        )}
        {/* Holographic foil sheen -- the "diamond quality" premium-card sell */}
        <div className="absolute inset-0 holo-sheen mix-blend-overlay pointer-events-none" />
        {/* Rarity crest */}
        <div
          className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
          style={{ background: `${color}cc`, color: '#0B0A14' }}
        >
          {card.rarity}
        </div>
      </motion.div>
    </div>
  )
}
