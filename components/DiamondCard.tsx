'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, animate } from 'framer-motion'
import { RARITY_COLORS, type CardRow } from '@/lib/types'

/**
 * A real, freely-spinnable 3D card -- click and drag anywhere on it to spin
 * it a full 360° on either axis (not a hover-tilt clamp), release and it
 * keeps spinning with its own momentum before settling (Framer Motion's
 * `type: 'inertia'` animation, driven by real drag velocity). Two actual
 * faces (front = art + stats baked into the frame like a real trading
 * card, back = a card-back emblem), built with the classic CSS
 * `backface-visibility: hidden` two-plane trick under one
 * `transform-style: preserve-3d` parent -- spin it past 90° and the back
 * face is genuinely what's showing, not a fake illusion.
 *
 * Kept smooth on purpose: only `transform` (rotateX/rotateY, GPU-composited,
 * never triggers layout/paint) changes per pointer-move frame -- no other
 * style recalculation happens during a drag.
 */
export default function DiamondCard({ card }: { card: CardRow }) {
  const rotateX = useMotionValue(8)
  const rotateY = useMotionValue(-12)
  const [imgError, setImgError] = useState(false)
  const color = RARITY_COLORS[card.rarity] ?? RARITY_COLORS.Common
  const art = imgError || !card.image_url ? null : card.image_url

  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0, t: 0 })
  const velocity = useRef({ x: 0, y: 0 })

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    last.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    velocity.current = { x: 0, y: 0 }
    rotateX.stop()
    rotateY.stop()
  }

  const onPointerMove = (e: React.PointerEvent) => {
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
    // Keep spinning with real momentum, decaying to a stop -- a card you
    // actually threw, not one that just stops dead when you let go.
    animate(rotateY, rotateY.get() + velocity.current.x * 4, {
      type: 'inertia',
      power: 0.35,
      timeConstant: 300,
      restDelta: 0.5,
    })
    animate(rotateX, rotateX.get() - velocity.current.y * 4, {
      type: 'inertia',
      power: 0.35,
      timeConstant: 300,
      restDelta: 0.5,
    })
  }

  const faceStyle: React.CSSProperties = {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  }

  return (
    <div className="relative mx-auto w-full max-w-[360px] select-none">
      <div
        className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-50 drift-glow"
        style={{ background: color }}
      />

      <div style={{ perspective: 1400 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 130 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative aspect-[3/4] cursor-grab active:cursor-grabbing touch-none"
          style={{ transformStyle: 'preserve-3d', rotateX, rotateY }}
        >
          {/* FRONT FACE -- real trading-card layout: art, name banner,
              rarity/elixir crest, and a stat strip baked right into the
              frame, like real card text/stats printed on the card. */}
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
                <Image src={art} alt={card.name} fill sizes="360px" className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/70 text-sm px-4 text-center">
                  {card.name}
                </div>
              )}
            </div>

            <div className="absolute inset-0 holo-sheen mix-blend-overlay pointer-events-none" />

            {/* Rarity crest, top corner */}
            <div
              className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={{ background: `${color}e6`, color: '#0B0A14' }}
            >
              {card.rarity}
            </div>
            {/* Elixir droplet, top corner */}
            {card.elixir_cost != null && (
              <div
                className="absolute top-2 left-2 w-7 h-7 rounded-[50%_50%_50%_0] rotate-45 shadow flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 35% 30%, #C77DFF, #7B2FBE 60%, #5A1F94)' }}
              >
                <span className="-rotate-45 text-white text-xs font-bold">{card.elixir_cost}</span>
              </div>
            )}

            {/* Name + real stat strip -- "with its data on it" */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-sm px-3 pt-2 pb-2.5">
              <div className="font-display text-sm text-center break-words leading-snug mb-1.5">{card.name}</div>
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

          {/* BACK FACE -- a real card-back design, not a mirror of the front */}
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
            <div
              className="w-24 h-24 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: `${color}90` }}
            >
              <div className="w-16 h-16 rotate-45 border-2" style={{ borderColor: `${color}90` }} />
            </div>
            <span className="absolute bottom-6 font-display text-xs tracking-[0.3em] text-white/40">
              CARD SELECT
            </span>
          </div>
        </motion.div>
      </div>
      <p className="text-center text-white/25 text-[10px] mt-3">Drag to spin — it keeps going</p>
    </div>
  )
}
