'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, animate } from 'framer-motion'
import { RARITY_COLORS, type CardRow } from '@/lib/types'

type Variant = 'base' | 'evolution' | 'hero'

/**
 * A real, freely-spinnable 3D card -- click and drag anywhere on it to spin
 * it a full 360° on either axis, release and it keeps spinning with real
 * momentum (Framer Motion's `type: 'inertia'`, driven by real drag
 * velocity) before settling. Two actual faces via the classic
 * `backface-visibility: hidden` two-plane trick under one
 * `transform-style: preserve-3d` parent.
 *
 * Real holographic foil (2026-09-09, "make the cards more realistic...
 * find better images" -- researched actual holo-card CSS technique
 * references first: no legitimately higher-res Clash Royale art exists
 * anywhere, official or fan-run, so "more realistic" comes from rendering,
 * not a bigger source image). A conic-gradient rainbow layer + a
 * mouse-tracked radial glare, both under `mix-blend-mode: color-dodge` --
 * the actual physical behavior of a foil card: it shows color/shine
 * relative to where the light (cursor) is, not a fixed diagonal sweep.
 *
 * Evo/Hero toggle: click a variant pill to swap the art shown on the SAME
 * card object (not a new card) -- click the active one again to return to
 * base. Evolution/Hero art already carries its own real frame baked into
 * the image (confirmed elsewhere in this project), so it renders
 * object-contain instead of object-cover, uncropped.
 *
 * Kept smooth on purpose: rotation is `transform` only (GPU-composited);
 * the foil/glare layers update via plain React state on pointer-move,
 * which Next/React batches fine at this scale (one card, a few divs).
 */
export default function DiamondCard({ card }: { card: CardRow }) {
  const rotateX = useMotionValue(8)
  const rotateY = useMotionValue(-12)
  const [imgError, setImgError] = useState(false)
  const [variant, setVariant] = useState<Variant>('base')
  const [glare, setGlare] = useState({ x: 50, y: 50, active: false })
  const color = RARITY_COLORS[card.rarity] ?? RARITY_COLORS.Common

  const variantUrl =
    variant === 'evolution' ? card.evolution_image_url : variant === 'hero' ? card.hero_image_url : card.image_url
  const art = imgError || !variantUrl ? null : variantUrl
  const usingRealFrame = variant !== 'base' && !!art

  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0, t: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const toggleVariant = (v: Variant) => setVariant((cur) => (cur === v ? 'base' : v))

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    last.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    velocity.current = { x: 0, y: 0 }
    rotateX.stop()
    rotateY.stop()
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (rect) {
      setGlare({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
        active: true,
      })
    }
    if (!dragging.current) return
    const now = performance.now()
    const dt = Math.max(now - last.current.t, 1)
    const dx = e.clientX - last.current.x
    const dy = e.clientY - last.current.y
    rotateY.set(rotateY.get() + dx * 0.5)
    rotateX.set(rotateX.get() - dy * 0.5)
    velocity.current = { x: (dx / dt) * 500, y: (dy / dt) * 500 }
    last.current = { x: e.clientX, y: e.clientY, t: now }
  }

  const onPointerUp = () => {
    if (!dragging.current) return
    dragging.current = false
    animate(rotateY, rotateY.get() + velocity.current.x * 4, {
      type: 'inertia', power: 0.35, timeConstant: 300, restDelta: 0.5,
    })
    animate(rotateX, rotateX.get() - velocity.current.y * 4, {
      type: 'inertia', power: 0.35, timeConstant: 300, restDelta: 0.5,
    })
  }

  const onPointerLeave = () => setGlare((g) => ({ ...g, active: false }))

  const faceStyle: React.CSSProperties = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }

  return (
    <div className="relative mx-auto w-full max-w-[360px] select-none">
      <div className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-50 drift-glow" style={{ background: color }} />

      <div style={{ perspective: 1400 }}>
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 130 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
          className="relative aspect-[3/4] cursor-grab active:cursor-grabbing touch-none"
          style={{ transformStyle: 'preserve-3d', rotateX, rotateY }}
        >
          {/* FRONT FACE */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              ...faceStyle,
              border: `2.5px solid ${color}`,
              boxShadow: `0 0 60px 4px ${color}55, 0 20px 45px -10px rgba(0,0,0,0.7)`,
              background: `linear-gradient(160deg, ${color}33, #0B0A14 65%)`,
            }}
          >
            <div className="absolute inset-0" style={{ transform: 'translateZ(1px)' }}>
              {art ? (
                <Image
                  key={art}
                  src={art}
                  alt={card.name}
                  fill
                  sizes="360px"
                  className={usingRealFrame ? 'object-contain' : 'object-cover'}
                  priority
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/70 text-sm px-4 text-center">
                  {card.name}
                </div>
              )}
            </div>

            {/* Real holo foil: rainbow conic-gradient anchored to the
                cursor position, color-dodge blended -- shifts hue as you
                move over it, the actual physical cue a foil card gives. */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                opacity: glare.active ? 0.55 : 0.28,
                mixBlendMode: 'color-dodge',
                background: `conic-gradient(from ${glare.x * 3.6}deg at ${glare.x}% ${glare.y}%, #ff2ecb, #ffdd2e, #2eff8f, #2ec8ff, #a12eff, #ff2ecb)`,
              }}
            />
            {/* Sharp mouse-tracked glare -- the bright specular highlight. */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-200"
              style={{
                opacity: glare.active ? 1 : 0,
                background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.55), transparent 40%)`,
              }}
            />
            {/* Fine glitter texture -- small repeating specular dots, like
                real foil grain, brighter near the glare point. */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay"
              style={{
                opacity: glare.active ? 0.35 : 0.12,
                backgroundImage:
                  'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1.5px), radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1.5px)',
                backgroundSize: '6px 6px, 9px 9px',
                backgroundPosition: `0 0, ${glare.x / 10}px ${glare.y / 10}px`,
              }}
            />

            {/* Rarity crest */}
            <div
              className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={{ background: `${color}e6`, color: '#0B0A14' }}
            >
              {card.rarity}
            </div>
            {/* Elixir droplet */}
            {card.elixir_cost != null && (
              <div
                className="absolute top-2 left-2 w-7 h-7 rounded-[50%_50%_50%_0] rotate-45 shadow flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 35% 30%, #C77DFF, #7B2FBE 60%, #5A1F94)' }}
              >
                <span className="-rotate-45 text-white text-xs font-bold">{card.elixir_cost}</span>
              </div>
            )}

            {/* Name + real stat strip + card TYPE (no separate badge/border
                anywhere else now -- lives right here on the card). */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-sm px-3 pt-2 pb-2.5">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="font-display text-sm text-center break-words leading-snug">{card.name}</span>
                <span className="text-white/40 text-[9px] uppercase tracking-wide">· {card.type}</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-[10px]">
                <span className="text-cyan-300 font-bold">
                  {card.win_rate != null ? `${card.win_rate}%` : '—'}
                  <span className="text-white/40 font-normal ml-0.5">WR</span>
                </span>
                <span className="text-amber-300 font-bold">
                  {card.usage_rate != null ? `${card.usage_rate}%` : '—'}
                  <span className="text-white/40 font-normal ml-0.5">USE</span>
                </span>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              ...faceStyle,
              transform: 'rotateY(180deg)',
              border: `2.5px solid ${color}`,
              background: `radial-gradient(circle at 50% 40%, ${color}25, #0B0A14 75%)`,
              boxShadow: `0 0 60px 4px ${color}55, 0 20px 45px -10px rgba(0,0,0,0.7)`,
            }}
          >
            <div className="w-24 h-24 rounded-full border-2 flex items-center justify-center" style={{ borderColor: `${color}90` }}>
              <div className="w-16 h-16 rotate-45 border-2" style={{ borderColor: `${color}90` }} />
            </div>
            <span className="absolute bottom-6 font-display text-xs tracking-[0.3em] text-white/40">CARD SELECT</span>
          </div>
        </motion.div>
      </div>

      <p className="text-center text-white/25 text-[10px] mt-3">Drag to spin — it keeps going</p>

      {/* Evo/Hero toggle -- only shown for variants this card actually
          has. Click again to un-click back to base. */}
      {(card.has_evolution || card.has_hero) && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {card.has_evolution && (
            <button
              onClick={() => toggleVariant('evolution')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                variant === 'evolution'
                  ? 'bg-purple-500/25 border-purple-400/60 text-purple-200'
                  : 'bg-white/5 border-white/15 text-white/50 hover:text-white/80'
              }`}
            >
              ⬆ Evolution
            </button>
          )}
          {card.has_hero && (
            <button
              onClick={() => toggleVariant('hero')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                variant === 'hero'
                  ? 'bg-amber-500/25 border-amber-400/60 text-amber-200'
                  : 'bg-white/5 border-white/15 text-white/50 hover:text-white/80'
              }`}
            >
              ★ Hero
            </button>
          )}
        </div>
      )}
    </div>
  )
}
