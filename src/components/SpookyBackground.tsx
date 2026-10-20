const BATS = [
  { top: '12%', delay: '0s', duration: '18s', size: '1.6rem' },
  { top: '28%', delay: '6s', duration: '23s', size: '1.1rem' },
  { top: '8%', delay: '11s', duration: '27s', size: '0.9rem' },
  { top: '45%', delay: '3s', duration: '31s', size: '1.3rem' },
]

export default function SpookyBackground() {
  return (
    <div className="spooky-bg" aria-hidden="true">
      <div className="moon" />
      {BATS.map((bat, i) => (
        <span
          key={i}
          className="bat"
          style={{ top: bat.top, animationDelay: bat.delay, animationDuration: bat.duration, fontSize: bat.size }}
        >
          🦇
        </span>
      ))}
      <div className="fog fog-1" />
      <div className="fog fog-2" />
      <svg className="cobweb cobweb-left" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 M0 0 L0 100 M0 0 L90 45 M0 0 L45 90 M0 0 L75 75" />
        <path d="M25 0 Q20 12 22 11 Q12 20 0 25 M50 0 Q40 22 45 22 Q22 40 0 50 M75 0 Q62 32 68 34 Q34 62 0 75" />
      </svg>
      <svg className="cobweb cobweb-right" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 M0 0 L0 100 M0 0 L90 45 M0 0 L45 90 M0 0 L75 75" />
        <path d="M25 0 Q20 12 22 11 Q12 20 0 25 M50 0 Q40 22 45 22 Q22 40 0 50 M75 0 Q62 32 68 34 Q34 62 0 75" />
      </svg>
    </div>
  )
}
