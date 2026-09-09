/** Two large, softly-blurred drifting glow orbs behind everything -- pure
 * CSS (radial-gradient + the drift-glow keyframe already defined in
 * globals.css), so this costs nothing performance-wise. Gives every page a
 * sense of depth/atmosphere instead of a flat black background, without a
 * canvas/particle library. */
export default function AmbientBackdrop() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute -top-32 -left-24 w-[36rem] h-[36rem] rounded-full blur-[110px] opacity-20 drift-glow"
        style={{ background: 'radial-gradient(circle, #9B59B6, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -right-24 w-[36rem] h-[36rem] rounded-full blur-[110px] opacity-[0.15] drift-glow"
        style={{ background: 'radial-gradient(circle, #22D3EE, transparent 70%)', animationDelay: '-6s' }}
      />
    </div>
  )
}
