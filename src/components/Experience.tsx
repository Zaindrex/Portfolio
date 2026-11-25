import { useEffect, useRef, useState } from 'react'
import { FiBookOpen, FiBriefcase, FiMapPin } from 'react-icons/fi'
import { useContent } from '../data/ContentContext'
import { AddButton, EditButton } from './EditControls'
import { SectionHeading } from './SectionHeading'

export function Experience() {
  const { experience } = useContent()
  const wrap = useRef<HTMLDivElement>(null)
  const [fill, setFill] = useState(0)

  // timeline line fills as you scroll through the section
  useEffect(() => {
    const onScroll = () => {
      const el = wrap.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = (vh * 0.6 - r.top) / r.height
      setFill(Math.max(0, Math.min(1, p)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="experience" className="relative border-t border-line/60 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading eyebrow="Experience & education" title={<>Where I’ve <span className="text-accent">been</span></>} />

        <div ref={wrap} className="relative max-w-4xl">
          <div className="absolute top-2 bottom-2 left-[19px] w-px bg-line" />
          <div
            className="absolute top-2 left-[19px] w-px bg-gradient-to-b from-accent to-accent-2 shadow-[0_0_12px_rgb(255_138_31/0.8)]"
            style={{ height: `calc(${fill * 100}% - 16px)` }}
          />

          <ol className="space-y-12">
            {experience.map((item, i) => {
              const Icon = i === 0 ? FiBriefcase : FiBookOpen
              return (
                <li key={i} className="relative pl-16">
                  <span
                    className={`absolute top-0 left-0 grid h-10 w-10 place-items-center rounded-xl border bg-ink transition-colors duration-500 ${
                      item.current ? 'border-accent text-accent shadow-[0_0_24px_-4px_rgb(255_138_31/0.7)]' : 'border-line text-mute'
                    }`}
                  >
                    <Icon />
                  </span>
                  <div
                    className="reveal spot rounded-3xl border border-line bg-card p-6 transition-transform duration-500 ease-out-expo hover:-translate-y-1 md:p-8"
                    style={{ '--d': `${i * 120}ms` } as React.CSSProperties}
                  >
                    <EditButton path={['experience', i]} className="-top-3 right-5" />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="font-mono text-xs tracking-wider text-accent">{item.period}</span>
                      {item.current && (
                        <span className="flex items-center gap-2 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] text-green-400">
                          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-green-500" /> Current
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold md:text-2xl">{item.title}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-mute">
                      <span className="text-soft">{item.org}</span>
                      {item.place && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="text-xs" /> {item.place}
                        </span>
                      )}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {item.points.map((pt, j) => (
                        <li key={j} className="flex gap-3 text-sm leading-relaxed text-soft/90">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ol>
          <AddButton listPath={['experience']} label="Add experience / education" className="mt-10 ml-16 w-[calc(100%-4rem)]" />
        </div>
      </div>
    </section>
  )
}
