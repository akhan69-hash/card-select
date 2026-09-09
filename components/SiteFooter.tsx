export default function SiteFooter() {
  return (
    <footer className="mt-16 pt-6 border-t border-white/10 text-center">
      <p className="text-white/40 text-xs">
        Real win rate and usage data sourced from{' '}
        <a
          href="https://royaleiq.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 font-medium"
        >
          Royale IQ
        </a>{' '}
        — live Clash Royale stats, deck coaching, and meta tracking.
      </p>
    </footer>
  )
}
