import type { Project } from '../data/content'

/** Illustrated, lightly animated previews used until real screenshots are added. */
export function ProjectVisual({ kind }: { kind: Project['visual'] }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-2">
      <div className="bg-grid absolute inset-0 opacity-70" />
      {kind === 'map' && <MapVisual />}
      {kind === 'street' && <StreetVisual />}
      {kind === 'rag' && <RagVisual />}
      {kind === 'sign' && <SignVisual />}
      {kind === 'review' && <ReviewVisual />}
    </div>
  )
}

function Roads() {
  return (
    <g stroke="rgb(255 255 255 / 0.07)" strokeWidth="10" fill="none" strokeLinecap="round">
      <path d="M-20 90 C 120 60, 220 140, 420 110" />
      <path d="M-20 200 C 140 230, 260 170, 420 210" />
      <path d="M120 -20 C 100 120, 160 180, 140 320" />
      <path d="M290 -20 C 270 100, 320 200, 300 320" />
      <path d="M-20 270 L 420 250" strokeWidth="5" />
      <path d="M200 -20 L 215 320" strokeWidth="5" />
    </g>
  )
}

function MapVisual() {
  const pins = [
    { x: 150, y: 95, d: '0s' },
    { x: 250, y: 120, d: '0.6s' },
    { x: 240, y: 190, d: '1.2s' },
    { x: 155, y: 185, d: '1.8s' },
    { x: 330, y: 70, d: '2.4s', far: true },
    { x: 70, y: 250, d: '3s', far: true },
  ]
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <Roads />
      <circle cx="200" cy="145" r="85" fill="rgb(255 138 31 / 0.06)" stroke="rgb(255 138 31 / 0.5)" strokeDasharray="4 6" className="origin-center animate-spin-slow" style={{ transformBox: 'fill-box' }} />
      <text x="200" y="52" textAnchor="middle" fill="#ff8a1f" fontSize="9" fontFamily="JetBrains Mono, monospace">5 km</text>
      {pins.map((p, i) => (
        <g key={i} opacity={p.far ? 0.35 : 1}>
          <circle cx={p.x} cy={p.y} r="10" fill={p.far ? '#8d8d98' : '#ff8a1f'} opacity="0.25" className="animate-ping-slow" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: p.d }} />
          <path d={`M${p.x} ${p.y + 8} l-6 -9 a7 7 0 1 1 12 0 z`} fill={p.far ? '#8d8d98' : '#ff8a1f'} />
          <circle cx={p.x} cy={p.y - 4} r="2.5" fill="#0b0b0d" />
        </g>
      ))}
      <circle cx="200" cy="145" r="7" fill="#5fb3ff" stroke="white" strokeWidth="2.5" />
      <g transform="translate(232 222)">
        <rect width="140" height="44" rx="10" fill="#141418" stroke="#24242b" />
        <circle cx="20" cy="22" r="10" fill="#ff8a1f" opacity="0.2" />
        <text x="20" y="26" textAnchor="middle" fontSize="11">🔧</text>
        <text x="38" y="19" fill="white" fontSize="9" fontFamily="Inter">Ravi · Electrician</text>
        <text x="38" y="32" fill="#8d8d98" fontSize="8" fontFamily="Inter">1.2 km away · Chat →</text>
      </g>
    </svg>
  )
}

function StreetVisual() {
  const stalls = [
    { x: 110, y: 100, e: '☕', d: '0s' },
    { x: 220, y: 80, e: '🥟', d: '0.8s' },
    { x: 300, y: 160, e: '🍢', d: '1.6s' },
    { x: 160, y: 200, e: '🍋', d: '2.4s' },
  ]
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <Roads />
      <path d="M60 240 C 120 220, 140 150, 220 80" fill="none" stroke="#ff8a1f" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" className="animate-dash" style={{ strokeDasharray: 120, strokeDashoffset: 120 }} />
      <circle cx="60" cy="240" r="6" fill="#5fb3ff" stroke="white" strokeWidth="2" />
      {stalls.map((s, i) => (
        <g key={i} className="animate-float" style={{ animationDelay: s.d, transformBox: 'fill-box' }}>
          <circle cx={s.x} cy={s.y} r="17" fill="#141418" stroke="#ff8a1f" strokeWidth="1.5" />
          <text x={s.x} y={s.y + 5} textAnchor="middle" fontSize="15">{s.e}</text>
        </g>
      ))}
      <g transform="translate(232 205)">
        <rect width="152" height="70" rx="10" fill="#141418" stroke="#24242b" />
        <text x="12" y="18" fill="#ffb15c" fontSize="8.5" fontFamily="JetBrains Mono, monospace">👑 KING OF THE STREETS</text>
        <text x="12" y="36" fill="white" fontSize="9" fontFamily="Inter">1. Sharma Chai Tapri</text>
        <text x="140" y="36" fill="#ff8a1f" fontSize="9" textAnchor="end" fontFamily="Inter">4.9</text>
        <text x="12" y="52" fill="#c9c9d1" fontSize="9" fontFamily="Inter">2. Momo Bhaiya</text>
        <text x="140" y="52" fill="#ff8a1f" fontSize="9" textAnchor="end" fontFamily="Inter">4.7</text>
      </g>
    </svg>
  )
}

function RagVisual() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 p-4 font-sans text-[10px] sm:gap-3 sm:p-8 sm:text-xs">
      <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 font-medium text-ink shadow-lg">
        What are the main limitations of transformer models on long documents?
      </div>
      <div className="flex flex-wrap gap-2">
        {['📄 Longformer.pdf · 0.91', '📄 BigBird.pdf · 0.88', '📄 Survey-2023.pdf · 0.84'].map((c, i) => (
          <span
            key={c}
            className="animate-float rounded-lg border border-line bg-card px-2.5 py-1 font-mono text-[10px] text-soft"
            style={{ animationDelay: `${i * 0.5}s`, animationDuration: '5s' }}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-card px-4 py-3 text-soft shadow-lg">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> llama3 · local · 3 sources
        </div>
        Self-attention scales quadratically with sequence length, so most papers use sparse or windowed attention
        <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-blink bg-accent" />
      </div>
    </div>
  )
}

const H = [
  [100, 182], [72, 166], [52, 146], [40, 126], [30, 108],
  [76, 110], [70, 80], [67, 60], [65, 42],
  [98, 104], [98, 72], [98, 50], [98, 30],
  [120, 110], [124, 80], [126, 60], [128, 44],
  [140, 120], [147, 98], [151, 82], [155, 68],
]
const E = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]]

function SignVisual() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g transform="translate(95 40)">
        <rect x="10" y="15" width="170" height="185" rx="6" fill="none" stroke="#3ecf8e" strokeWidth="1.5" strokeDasharray="5 4" />
        <rect x="10" y="-2" width="92" height="17" rx="3" fill="#3ecf8e" />
        <text x="16" y="10" fontSize="9" fill="#0b0b0d" fontFamily="JetBrains Mono, monospace" fontWeight="600">HELLO · 0.97</text>
        {E.map(([a, b], i) => (
          <line key={i} x1={H[a][0]} y1={H[a][1]} x2={H[b][0]} y2={H[b][1]} stroke="#ff8a1f" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        ))}
        {H.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.6" fill="white" stroke="#ff8a1f" strokeWidth="1.5" className="animate-pulse" style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </g>
      <g transform="translate(285 210)">
        <rect width="95" height="54" rx="10" fill="#141418" stroke="#24242b" />
        <text x="12" y="20" fill="#8d8d98" fontSize="8" fontFamily="JetBrains Mono, monospace">🔊 SPEAKING</text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <rect key={i} x={12 + i * 8} y="30" width="4" height="14" rx="2" fill="#ff8a1f" className="animate-pulse" style={{ animationDelay: `${i * 0.12}s`, transformBox: 'fill-box', transformOrigin: 'bottom' }} />
        ))}
      </g>
    </svg>
  )
}

// QR code → stars → AI draft → Google: the Feedora flow.
const QR_BITS = '1011010011100101101101001010110110011010010110101100110100101101011001'
function QrCode() {
  const n = 11
  const cells: [number, number][] = []
  const finder = (x: number, y: number) => x < 3 && y < 3
  let b = 0
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (finder(x, y) || finder(n - 1 - x, y) || finder(x, n - 1 - y)) continue
      if (QR_BITS[b++ % QR_BITS.length] === '1') cells.push([x, y])
    }
  const Finder = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width="3" height="3" fill="none" stroke="white" strokeWidth="0.6" />
      <rect x={x + 0.9} y={y + 0.9} width="1.2" height="1.2" fill="white" />
    </g>
  )
  return (
    <svg viewBox="-0.5 -0.5 12 12" className="h-full w-full" aria-hidden>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 0.1} y={y + 0.1} width="0.8" height="0.8" rx="0.15" fill="white" opacity="0.85" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={n - 3} y={0} />
      <Finder x={0} y={n - 3} />
    </svg>
  )
}

function ReviewVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-3 p-4 font-sans sm:gap-6 sm:p-8">
      {/* table stand with QR */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-line bg-card p-2 shadow-lg sm:h-28 sm:w-28 sm:p-3">
          <QrCode />
          <div className="absolute inset-x-0 h-0.5 bg-accent shadow-[0_0_12px_2px_rgb(255_138_31/0.7)] [animation:scan_2.6s_ease-in-out_infinite]" />
        </div>
        <span className="font-mono text-[9px] tracking-wider text-mute uppercase sm:text-[10px]">Scan at table</span>
      </div>

      <svg viewBox="0 0 40 10" className="w-6 shrink-0 text-accent/70 sm:w-10" aria-hidden>
        <path d="M0 5 H34 M30 1 L36 5 L30 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>

      {/* phone review card */}
      <div className="w-[58%] max-w-[230px] rounded-2xl border border-line bg-card p-3 shadow-2xl shadow-black/50 sm:p-4">
        <div className="flex justify-center gap-1 text-sm sm:text-lg">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="text-accent [animation:star-pop_3.2s_ease-out_infinite]" style={{ animationDelay: `${i * 0.12}s` }}>
              ★
            </span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          {['Friendly staff', 'Great coffee'].map((c) => (
            <span key={c} className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[8px] text-accent sm:text-[9px]">✓ {c}</span>
          ))}
        </div>
        <div className="mt-2.5 rounded-lg border border-line bg-ink/60 p-2">
          <div className="mb-1.5 flex items-center gap-1 font-mono text-[8px] text-accent sm:text-[9px]">
            <span className="h-1 w-1 animate-pulse rounded-full bg-accent" /> AI draft · editable
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded bg-white/15" />
            <div className="h-1.5 w-[88%] rounded bg-white/15" />
            <div className="h-1.5 w-[62%] rounded bg-white/15" />
          </div>
        </div>
        <div className="mt-2.5 rounded-lg bg-white py-1.5 text-center text-[9px] font-semibold text-ink sm:text-[10px]">
          Post on Google →
        </div>
      </div>
    </div>
  )
}
