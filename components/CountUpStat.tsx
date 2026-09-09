'use client'

import { useEffect, useState } from 'react'
import { animate } from 'framer-motion'

/** A number that counts up from 0 on mount -- a small, real "alive" touch
 * (2026-09-09 feedback: "more animated and playful") instead of a number
 * that just appears. */
export default function CountUpStat({
  value,
  suffix = '',
  decimals = 0,
}: {
  value: number
  suffix?: string
  decimals?: number
}) {
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()),
    })
    return controls.stop
  }, [value, decimals])

  return (
    <span>
      {display}
      {suffix}
    </span>
  )
}
