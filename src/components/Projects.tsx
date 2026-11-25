import { useEffect, useMemo, useRef, useState } from 'react'
import { FiArrowUpRight, FiCheck, FiChevronDown, FiChevronUp, FiExternalLink, FiGithub } from 'react-icons/fi'
import type { Project } from '../data/content'
import { useAsset, useContent, useEditor } from '../data/ContentContext'
import { filterLabels } from '../data/techFilters'
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

function ProjectRow({ p, i, index }: { p: Project; i: number; index: number }) {
  const asset = useAsset()
  const flip = i % 2 === 1
  return (
    <article className="relative grid items-center gap-8 rounded-3xl md:gap-12 lg:grid-cols-2">
      <EditButton path={['projects', index]} label="Edit project" className="-top-4 right-0" />
      <div className={`reveal ${flip ? 'reveal-right lg:order-2' : 'reveal-left'}`}>
        <TiltFrame>
          {p.image ? <img src={asset(p.image)} alt={`${p.title} screenshot`} className="h-full w-full object-cover" /> : <ProjectVisual kind={p.visual} />}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/5 ring-inset" />
        </TiltFrame>
      </div>

      <div className={flip ? 'lg:order-1' : ''}>
        <div className="reveal mb-4 flex items-center gap-3">
          <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, '0')}</span>
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

/** If no project is marked featured, this many from the top get big rows. */
const FALLBACK_FEATURED = 4
/** Max filter chips above the "more projects" grid (most-used first). Only languages and frameworks, see data/techFilters.ts. */
const MAX_FILTERS = 8

type Indexed = { p: Project; index: number }

export function Projects() {
  const { profile, projects } = useContent()
  const editing = useEditor() !== null
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState('All')

  // A newly added project starts with no tech tags; clear the filter so it doesn't vanish.
  useEffect(() => setFilter('All'), [projects.length])

  // Featured = big rows. Chosen with the "Featured" checkbox in the studio.
  const { featured, more } = useMemo(() => {
    const all: Indexed[] = projects.map((p, index) => ({ p, index }))
    const anyMarked = projects.some((p) => p.featured)
    const isFeatured = (x: Indexed) => (anyMarked ? !!x.p.featured : x.index < FALLBACK_FEATURED)
    return { featured: all.filter(isFeatured), more: all.filter((x) => !isFeatured(x)) }
  }, [projects])

  // Filter chips: the languages and frameworks used by the grid projects.
  const { filters, labelsOf } = useMemo(() => {
    const labelsOf = new Map(more.map(({ p, index }) => [index, filterLabels(p.stack)]))
    const counts = new Map<string, number>()
    for (const labels of labelsOf.values()) for (const l of labels) counts.set(l, (counts.get(l) ?? 0) + 1)
    const filters = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, MAX_FILTERS).map(([l]) => l)
    return { filters, labelsOf }
  }, [more])

  const activeFilter = filter !== 'All' && filters.includes(filter) ? filter : 'All'
  const shown = activeFilter === 'All' ? more : more.filter(({ index }) => labelsOf.get(index)?.includes(activeFilter))
  const open = expanded || editing // the studio always shows everything so it can be edited

  const collapse = () => {
    setExpanded(false)
    setFilter('All')
    document.getElementById('more-projects')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
          {featured.map(({ p, index }, i) => (
            <ProjectRow key={index} p={p} i={i} index={index} />
          ))}
        </div>

        {more.length > 0 && (
          <div id="more-projects" className="mt-24 md:mt-28">
            {!open ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  aria-expanded={false}
                  className="group inline-flex items-center gap-2.5 rounded-full border border-line bg-card px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent"
                >
                  Show more projects
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-xs text-accent">+{more.length}</span>
                  <FiChevronDown className="transition-transform duration-300 group-hover:translate-y-0.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <h3 className="font-display text-2xl font-semibold text-white">
                    More <span className="text-accent">projects</span>
                    <span className="ml-3 font-mono text-sm font-normal text-mute">{shown.length}</span>
                  </h3>
                  {filters.length > 1 && (
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by technology">
                      {['All', ...filters].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFilter(t)}
                          aria-pressed={activeFilter === t}
                          className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                            activeFilter === t ? 'border-accent bg-accent text-ink' : 'border-line text-mute hover:border-accent/50 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map(({ p, index }, i) => (
                    <ProjectCard key={index} p={p} index={index} delay={Math.min(i, 5) * 70} />
                  ))}
                </div>

                {!editing && (
                  <div className="mt-12 flex justify-center">
                    <button
                      type="button"
                      onClick={collapse}
                      aria-expanded={true}
                      className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-mute transition-colors hover:border-accent/60 hover:text-white"
                    >
                      Show less <FiChevronUp />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <AddButton listPath={['projects']} label="Add project" className="mt-16 w-full" />
      </div>
    </section>
  )
}

function ProjectCard({ p, index, delay }: { p: Project; index: number; delay: number }) {
  const MAX_TAGS = 4
  return (
    <article
      className="reveal spot group relative flex flex-col rounded-3xl border border-line bg-card p-6 transition-transform duration-500 ease-out-expo hover:-translate-y-1.5"
      style={{ '--d': `${delay}ms` } as React.CSSProperties}
    >
      <EditButton path={['projects', index]} className="-top-3 right-4" />
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-lg leading-snug font-semibold text-white">{p.title || 'Untitled project'}</h4>
        {p.status && (
          <span className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">{p.status}</span>
        )}
      </div>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mute">{p.tagline || p.problem}</p>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap gap-1.5">
          {p.stack.slice(0, MAX_TAGS).map((t, k) => (
            <span key={k} className="rounded-md border border-line bg-ink/60 px-2 py-0.5 font-mono text-[11px] text-soft">
              {t}
            </span>
          ))}
          {p.stack.length > MAX_TAGS && <span className="px-1 py-0.5 font-mono text-[11px] text-mute">+{p.stack.length - MAX_TAGS}</span>}
        </div>
        {(p.live || p.repo) && (
          <div className="mt-4 flex gap-4 border-t border-line/70 pt-4 text-sm">
            {p.live && (
              <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-white transition-colors hover:text-accent">
                <FiExternalLink /> Live
              </a>
            )}
            {p.repo && (
              <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-mute transition-colors hover:text-white">
                <FiGithub /> Source
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
