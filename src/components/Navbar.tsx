import { useEffect, useState } from 'react'
import { FiDownload, FiMenu, FiX } from 'react-icons/fi'
import { useAsset, useContent } from '../data/ContentContext'

const links = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

export function Navbar() {
  const { profile } = useContent()
  const asset = useAsset()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? y / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* scroll progress */}
      <div
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-150"
        style={{ width: `${progress * 100}%` }}
      />
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between px-5 transition-all duration-500 ease-out-expo md:px-8 ${
          scrolled
            ? 'mt-3 h-14 rounded-2xl border border-line/80 bg-ink/70 shadow-2xl shadow-black/40 backdrop-blur-xl md:mx-6 lg:mx-auto'
            : 'h-20 border border-transparent'
        }`}
      >
        <a href="#top" className="group flex items-center gap-2.5" aria-label="Back to top">
          <img src={asset('/logo.webp')} alt="Zaindrex logo" width={36} height={36} className="h-9 w-9 rounded-xl ring-1 ring-accent/30 transition-transform duration-500 group-hover:rotate-[360deg]" />
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            Zaindrex<span className="text-accent">.</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                data-nav={l.id}
                className="relative rounded-lg px-3.5 py-2 text-sm text-mute transition-colors duration-300 hover:text-white data-[active]:text-white after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-500 after:ease-out-expo data-[active]:after:scale-x-100"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={asset(profile.resume)}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-accent/50 px-4 py-2 text-sm font-medium text-accent transition-all duration-300 hover:bg-accent hover:text-ink sm:inline-flex"
          >
            Resume <FiDownload />
          </a>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-white md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      <div
        className={`fixed inset-0 top-0 -z-10 bg-ink/95 backdrop-blur-xl transition-all duration-500 ease-out-expo md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ul className="flex h-full flex-col items-center justify-center gap-6">
          {links.map((l, i) => (
            <li
              key={l.id}
              className={`transition-all duration-500 ease-out-expo ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: open ? `${80 + i * 60}ms` : '0ms' }}
            >
              <a href={`#${l.id}`} onClick={() => setOpen(false)} className="font-display text-3xl font-semibold text-white hover:text-accent">
                {l.label}
              </a>
            </li>
          ))}
          <li
            className={`transition-all duration-500 ease-out-expo ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{ transitionDelay: open ? `${80 + links.length * 60}ms` : '0ms' }}
          >
            <a href={asset(profile.resume)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-ink">
              Download resume <FiDownload />
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
