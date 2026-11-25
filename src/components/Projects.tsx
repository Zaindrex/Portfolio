import { useRef, useState } from 'react'
import { FiArrowUpRight, FiCheck, FiChevronDown, FiChevronUp, FiGithub } from 'react-icons/fi'
import type { Project } from '../data/content'
import { useAsset, useContent, useEditor } from '../data/ContentContext'
import { AddButton, EditButton } from './EditControls'
import { ProjectVisual } from './ProjectVisual'
import { SectionHeading } from './SectionHeading'

function TiltFrame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(1000px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) scale(1.015)`
  }
  const reset = () => {
    if (ref.current) ref.current.style.transform = ''
  }
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="spot relative aspect-[4/3] overflow-hidden rounded-3xl border border-line shadow-2xl shadow-black/50 transition-transform duration-500 ease-out-expo will-change-transform"
    >
      {children}
    </div>
  )
}

function ProjectRow({ p, i }: { p: Project; i: number }) {
  const asset = useAsset()
  const flip = i % 2 === 1
  return (
    <article className="relative grid items-center gap-8 rounded-3xl md:gap-12 lg:grid-cols-2">
      <EditButton path={['projects', i]} label="Edit project" className="-top-4 right-0" />
      <div className={`reveal ${flip ? 'reveal-right lg:order-2' : 'reveal-left'}`}>
        <TiltFrame>
          {p.image ? <img src={asset(p.image)} alt={`${p.title} screenshot`} className="h-full w-full object-cover" /> : <ProjectVisual kind={p.visual} />}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/5 ring-inset" />
        </TiltFrame>
      </div>

      <div className={flip ? 'lg:order-1' : ''}>
        <div className="reveal mb-4 flex items-center gap-3">
          <span className="font-mono text-sm text-accent">0{i + 1}</span>
          <span className="h-px w-10 bg-line" />
          {p.status && (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-[11px] text-accent">{p.status}</span>
          )}
        </div>
        <h3 className="reveal text-3xl font-semibold md:text-4xl" style={{ '--d': '60ms' } as React.CSSProperties}>
          {p.title}
        </h3>
        <p className="reveal mt-2 font-display text-lg text-accent-2" style={{ '--d': '120ms' } as React.CSSProperties}>
          {p.tagline}
        </p>
        <p className="reveal mt-4 leading-relaxed text-mute" style={{ '--d': '180ms' } as React.CSSProperties}>
          {p.problem}
        </p>
        <ul className="mt-5 space-y-2.5">
          {p.highlights.map((h, j) => (
            <li key={j} className="reveal flex gap-3 text-sm text-soft" style={{ '--d': `${240 + j * 70}ms` } as React.CSSProperties}>
              <FiCheck className="mt-0.5 shrink-0 text-accent" />
              {h}
            </li>
          ))}
        </ul>
        <div className="reveal mt-6 flex flex-wrap gap-2" style={{ '--d': '420ms' } as React.CSSProperties}>
          {p.stack.map((s, k) => (
            <span key={k} className="rounded-lg border border-line bg-card px-2.5 py-1 font-mono text-xs text-soft transition-colors hover:border-accent/50 hover:text-white">
              {s}
            </span>
          ))}
        </div>
        {(p.live || p.repo) && (
          <div className="reveal mt-7 flex flex-wrap gap-3" style={{ '--d': '480ms' } as React.CSSProperties}>
            {p.live && (
              <a
                href={p.live}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent"
              >
                Live demo
                <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
            {p.repo && (
              <a
                href={p.repo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60"
              >
                <FiGithub /> Source
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

/** How many projects show before "Show all". */
const INITIAL_PROJECTS = 4

export function Projects() {
  const { profile, projects } = useContent()
  const editing = useEditor() !== null
  const [expanded, setExpanded] = useState(false)
  // In the studio every project stays visible so it can be edited.
  const showAll = expanded || editing
  const visible = showAll ? projects : projects.slice(0, INITIAL_PROJECTS)
  const hiddenCount = projects.length - INITIAL_PROJECTS

  const collapse = () => {
    setExpanded(false)
    // Bring the reader back to the list instead of leaving them far below it.
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="projects" className="relative border-t border-line/60 py-24 md:py-32">
      <div className="absolute top-1/3 -left-40 -z-10 h-[420px] w-[420px] rounded-full bg-accent/5 blur-[120px]" />
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Featured work" title={<>Things I’ve <span className="text-accent">built</span></>} />
          <a
            href={profile.socials.github}
            target="_blank"
            rel="noreferrer"
            className="reveal mb-12 inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-white transition-all duration-300 hover:border-accent/60 hover:text-accent md:mb-16"
          >
            <FiGithub /> All repositories <FiArrowUpRight />
          </a>
        </div>
        <div className="space-y-24 md:space-y-32">
          {visible.map((p, i) => (
            <ProjectRow key={i} p={p} i={i} />
          ))}
        </div>
        {hiddenCount > 0 && !editing && (
          <div className="mt-20 flex justify-center">
            <button
              type="button"
              onClick={expanded ? collapse : () => setExpanded(true)}
              aria-expanded={expanded}
              className="group inline-flex items-center gap-2.5 rounded-full border border-line bg-card px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent"
            >
              {expanded ? (
                <>
                  Show less <FiChevronUp />
                </>
              ) : (
                <>
                  Show all projects
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-xs text-accent">+{hiddenCount}</span>
                  <FiChevronDown className="transition-transform duration-300 group-hover:translate-y-0.5" />
                </>
              )}
            </button>
          </div>
        )}
        <AddButton listPath={['projects']} label="Add project" className="mt-16 w-full" />
      </div>
    </section>
  )
}
