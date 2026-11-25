import { useEffect, useRef, useState } from 'react'
import { FiArrowRight, FiDownload, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import { SiAngular, SiDotnet, SiReact } from 'react-icons/si'
import { TbBrandCSharp } from 'react-icons/tb'
import type { IconType } from 'react-icons'
import { useAsset, useContent } from '../data/ContentContext'
import { EditButton } from './EditControls'

const d = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % words.length), 2400)
    return () => clearInterval(t)
  }, [words.length])
  return (
    <span className="word-swap">
      {words.map((w, idx) => (
        <span
          key={idx}
          aria-hidden={idx !== i}
          className={`text-accent ${
            idx === i ? 'translate-y-0 opacity-100' : idx === (i - 1 + words.length) % words.length ? '-translate-y-3 opacity-0' : 'translate-y-3 opacity-0'
          }`}
        >
          {w}
        </span>
      ))}
    </span>
  )
}

function Badge({ Icon, label, color, className, delay }: { Icon: IconType; label: string; color: string; className: string; delay: string }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="enter" style={d(800 + parseInt(delay) / 5)}>
        <div
          className="flex animate-float items-center gap-2 rounded-xl border border-line bg-card/80 px-3 py-2 text-xs font-medium text-white shadow-xl shadow-black/40 backdrop-blur-md"
          style={{ animationDelay: `${delay}ms` }}
        >
          <Icon style={{ color }} className={label.startsWith('.NET') ? 'text-2xl' : 'text-base'} />
          {label}
        </div>
      </div>
    </div>
  )
}

function Portrait() {
  const { profile } = useContent()
  const asset = useAsset()
  const photoRef = useRef<HTMLDivElement>(null)
  const ringsRef = useRef<HTMLDivElement>(null)

  // depth parallax: photo drifts with the mouse, rings drift the other way
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5
        const y = e.clientY / window.innerHeight - 0.5
        if (photoRef.current) photoRef.current.style.transform = `translate3d(${x * 14}px, ${y * 8}px, 0)`
        if (ringsRef.current) ringsRef.current.style.transform = `translate3d(${x * -18}px, ${y * -12}px, 0)`
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="enter relative mx-auto aspect-[4/5] w-full max-w-[360px] sm:max-w-[440px] lg:max-w-[580px]" style={d(350)}>
      {/* back layer: soft glow (unmasked so its blur never gets clipped) */}
      <div className="pointer-events-none absolute top-[4%] left-1/2 aspect-square w-[85%] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgb(255 138 31 / 0.42) 0%, rgb(255 138 31 / 0.16) 38%, transparent 70%)' }}
      />

      {/* orbit rings: only the rings fade out towards the chest */}
      <div
        ref={ringsRef}
        className="pointer-events-none absolute inset-x-0 top-[6%] aspect-square transition-transform duration-700 ease-out [mask-image:linear-gradient(to_bottom,black_40%,transparent_70%)]"
      >
        <svg className="absolute inset-0 h-full w-full animate-spin-slow" viewBox="0 0 400 400" aria-hidden>
          <circle cx="200" cy="200" r="190" fill="none" stroke="rgb(255 138 31 / 0.35)" strokeWidth="1" strokeDasharray="2 10" />
          <circle cx="200" cy="10" r="4" fill="#ff8a1f" />
        </svg>
        <svg className="absolute inset-[6%] h-[88%] w-[88%] animate-spin-rev" viewBox="0 0 400 400" aria-hidden>
          <circle cx="200" cy="200" r="195" fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="1" />
          <path d="M 200 5 A 195 195 0 0 1 395 200" fill="none" stroke="#ff8a1f" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="5" cy="200" r="3.5" fill="#ffb15c" />
        </svg>
        <svg className="absolute inset-[14%] h-[72%] w-[72%]" viewBox="0 0 400 400" aria-hidden>
          <circle cx="200" cy="200" r="198" fill="none" stroke="rgb(255 138 31 / 0.22)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* photo: breaks out of the ring at the top, fades into the page at the bottom */}
      <div ref={photoRef} className="absolute inset-x-[4%] bottom-0 top-0 transition-transform duration-500 ease-out will-change-transform">
        {profile.photo ? (
          <img
            src={asset(profile.photo)}
            alt={profile.name}
            className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom drop-shadow-[0_20px_40px_rgb(0_0_0/0.6)] [mask-image:linear-gradient(to_bottom,black_82%,transparent_100%)]"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-x-[14%] top-[19%] grid aspect-square place-items-center rounded-full">
            <div className="text-center">
              <div className="font-display text-7xl font-bold tracking-tight text-white md:text-8xl">
                A<span className="text-gradient">R</span>
              </div>
              <div className="mt-2 font-mono text-[11px] tracking-[0.3em] text-mute uppercase">photo coming soon</div>
            </div>
          </div>
        )}
      </div>

      <Badge Icon={TbBrandCSharp} label="C#" color="#a179dc" className="top-[22%] left-[-2%] z-10" delay="0" />
      <Badge Icon={SiDotnet} label=".NET Core" color="#7b5cff" className="top-[10%] right-[-2%] z-10" delay="700" />
      <Badge Icon={SiAngular} label="Angular" color="#e23237" className="bottom-[30%] left-[-6%] z-10" delay="1400" />
      <Badge Icon={SiReact} label="React" color="#61dafb" className="right-[-4%] bottom-[40%] z-10" delay="2100" />
    </div>
  )
}

export function Hero() {
  const { profile } = useContent()
  const asset = useAsset()
  const glow = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = glow.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      el.style.setProperty('--gx', `${e.clientX}px`)
      el.style.setProperty('--gy', `${e.clientY}px`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <section id="top" className="relative isolate flex min-h-[100svh] items-end overflow-hidden pt-28 md:pt-24">
      <EditButton path={['profile']} label="Edit intro & links" className="top-24 right-5 md:right-8" />
      {/* backgrounds */}
      <div className="bg-grid absolute inset-0 -z-10" />
      <div
        ref={glow}
        className="pointer-events-none absolute inset-0 -z-10 opacity-70 transition-opacity"
        style={{ background: 'radial-gradient(600px circle at var(--gx, 70%) var(--gy, 40%), rgb(255 138 31 / 0.08), transparent 60%)' }}
      />
      <div className="absolute -top-40 -right-40 -z-10 h-[520px] w-[520px] rounded-full bg-accent/10 blur-[140px]" />

      <div className="mx-auto grid w-full max-w-6xl items-end gap-10 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="self-center lg:pb-16">
          <p className="enter mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-accent uppercase" style={d(100)}>
            <span className="h-px w-8 bg-accent" /> Hello, I’m
          </p>
          <h1 className="enter text-5xl leading-[1.02] font-bold tracking-tight sm:text-6xl lg:text-7xl" style={d(200)}>
            {profile.firstName}
            <br />
            <span className="text-gradient">{profile.lastName}</span>
          </h1>
          <p className="enter mt-6 font-display text-xl text-white md:text-2xl" style={d(320)}>
            {profile.role} · <RotatingWord words={profile.roles} />
          </p>
          <p className="enter mt-5 max-w-xl text-base leading-relaxed text-mute md:text-lg" style={d(440)}>
            {profile.tagline}
          </p>

          <div className="enter mt-9 flex flex-wrap items-center gap-4" style={d(560)}>
            <a
              href="#projects"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-accent px-6 py-3.5 font-medium text-ink shadow-[0_10px_40px_-10px_rgb(255_138_31/0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-10px_rgb(255_138_31/0.9)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              View my work
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href={asset(profile.resume)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-white/5"
            >
              Resume <FiDownload />
            </a>
          </div>

          <div className="enter mt-9 flex items-center gap-5" style={d(680)}>
            <span className="flex items-center gap-2 text-sm text-mute">
              <span className="h-2 w-2 animate-pulse-dot rounded-full bg-green-500" />
              {profile.status}
            </span>
            <span className="h-4 w-px bg-line" />
            <div className="flex gap-2">
              {[
                { href: profile.socials.github, Icon: FiGithub, label: 'GitHub' },
                { href: profile.socials.linkedin, Icon: FiLinkedin, label: 'LinkedIn' },
                { href: `mailto:${profile.email}`, Icon: FiMail, label: 'Email' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-line text-mute transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:text-accent"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Portrait />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-ink" />
    </section>
  )
}
