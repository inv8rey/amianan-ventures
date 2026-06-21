export function DecorativeSkyline() {
  return (
    <svg
      viewBox="0 0 600 220"
      className="absolute bottom-0 left-0 w-full h-auto pointer-events-none opacity-90"
      preserveAspectRatio="xMidYMax slice"
    >
      <path d="M0 220 L60 130 L110 170 L170 90 L230 160 L290 110 L340 170 L400 70 L460 150 L520 120 L600 220 Z" fill="none" stroke="#00cc6a" strokeOpacity="0.25" strokeWidth="2" />
      <rect x="40" y="160" width="18" height="60" fill="#00cc6a" opacity="0.12" />
      <rect x="65" y="180" width="14" height="40" fill="#00cc6a" opacity="0.12" />
      <rect x="86" y="150" width="20" height="70" fill="#00cc6a" opacity="0.12" />
      <rect x="113" y="190" width="12" height="30" fill="#00cc6a" opacity="0.12" />
      <rect x="500" y="170" width="16" height="50" fill="#00cc6a" opacity="0.12" />
      <rect x="522" y="150" width="20" height="70" fill="#00cc6a" opacity="0.12" />
      <rect x="548" y="185" width="14" height="35" fill="#00cc6a" opacity="0.12" />
      <line x1="0" y1="210" x2="600" y2="210" stroke="#00cc6a" strokeOpacity="0.3" strokeWidth="1" />
      <line x1="0" y1="218" x2="600" y2="218" stroke="#00cc6a" strokeOpacity="0.6" strokeWidth="2" />
    </svg>
  )
}
