'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { RARITY_COLORS, type CardRow } from '@/lib/types'

/**
 * The "diamond quality" card reveal. Real 3D depth (not just a flat tilt) --
 * `transformStyle: preserve-3d` on the tilting card means child layers with
 * their own `translateZ` genuinely parallax against each other as the card
 * rotates: the art sits at one depth, the holo sheen and mouse-reactive
 * glare float above it, the rarity crest floats highest. A dynamic shadow
 * shifts opposite the tilt to simulate one fixed light source reacting to
 * the card's angle (a real physical card would do exactly this), a soft
 * ambient glow drifts behind it, and a fading mirror-image reflection sits
 * underneath -- like a card in a lit display case, not a flat image with a
 * border. All CSS transforms -- no 3D engine, still effectively free.
 */
export default function DiamondCard({ card }: { card: CardRow }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 0.5, py: 0.5 })
  const [active, setActive] = useState(false)
  const [imgError, setImgError] = useState(false)
  const color = RARITY_COLORS[card.rarity] ?? RARITY_COLORS.Common

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setTilt({ rx: (py - 0.5) * -22, ry: (px - 0.5) * 22, px, py })
  }
  const onLeave = () => {
    setTilt({ rx: 0, ry: 0, px: 0.5, py: 0.5 })
    setActive(false)
  }

  // Shadow shifts opposite the tilt -- as if one light source is fixed
  // above the card and the card itself is rotating under it.
  const shadowX = tilt.ry * -1.4
  const shadowY = 24 - tilt.rx * 1.2

  const art = imgError || !card.image_url ? null : card.image_url

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      {/* Ambient glow -- a large, soft, drifting blob in the card's own
          rarity color, sitting behind everything. */}
      <div
        className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-50 drift-glow"
        style={{ background: color }}
      />

      <div style={{ perspective: 1200 }}>
        <motion.div
          ref={ref}
          onMouseMove={onMove}
          onMouseEnter={() => setActive(true)}
          onMouseLeave={onLeave}
          initial={{ opacity: 0, scale: 0.4, rotateY: -35 }}
          animate={{ opacity: 1, scale: active ? 1.06 : 1, rotateY: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 130 }}
          className="relative aspect-[3/4] rounded-2xl cursor-pointer"
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transformStyle: 'preserve-3d',
            boxShadow: `${shadowX}px ${shadowY}px 45px -8px rgba(0,0,0,0.7), 0 0 60px 4px ${color}55`,
          }}
        >
          {/* Base plate -- sits at the "floor" depth, gives the card frame
              itself real thickness rather than looking paper-flat. */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              transform: 'translateZ(0px)',
              border: `2px solid ${color}`,
              background: `linear-gradient(160deg, ${color}33, #0B0A14 65%)`,
            }}
          >
            {art ? (
              <Image
                src={art}
                alt={card.name}
                fill
                sizes="340px"
                className="object-cover"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/70 text-sm px-4 text-center">
                {card.name}
              </div>
            )}
          </div>

          {/* Holo foil sheen -- floats above the art layer (real parallax
              via translateZ under preserve-3d), sweeping on its own loop. */}
          <div
            className="absolute inset-0 rounded-2xl holo-sheen mix-blend-overlay pointer-events-none"
            style={{ transform: 'translateZ(18px)' }}
          />

          {/* Mouse-reactive glare -- a bright soft highlight that follows the
              cursor, the actual "glossy" reflectivity cue a flat sheen alone
              can't give (a real photo of a foil card catches light exactly
              like this as you tilt it). */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-200"
            style={{
              transform: 'translateZ(28px)',
              opacity: active ? 1 : 0,
              background: `radial-gradient(circle at ${tilt.px * 100}% ${tilt.py * 100}%, rgba(255,255,255,0.45), transparent 45%)`,
            }}
          />

          {/* Rarity crest -- floats highest, closest to the viewer. */}
          <div
            className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{ background: `${color}e6`, color: '#0B0A14', transform: 'translateZ(40px)' }}
          >
            {card.rarity}
          </div>
        </motion.div>
      </div>

      {/* Reflection -- a faded, mirrored echo beneath the card, like a
          trophy sitting in a lit display case. Purely decorative, hidden
          from screen readers. */}
      {art && (
        <div
          aria-hidden
          className="relative mt-1 h-16 overflow-hidden rounded-2xl opacity-25 pointer-events-none"
          style={{ maskImage: 'linear-gradient(to bottom, black, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)' }}
        >
          <Image src={art} alt="" fill sizes="340px" className="object-cover scale-y-[-1]" />
        </div>
      )}
    </div>
  )
}
