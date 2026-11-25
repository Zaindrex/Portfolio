import { useContent } from '../data/ContentContext'
import { AddButton, EditButton } from './EditControls'
import { SectionHeading } from './SectionHeading'
import { TechIcon } from './TechIcon'

export function Skills() {
  const { skills, marquee } = useContent()
  return (
    <section id="skills" className="relative border-t border-line/60 pt-24 pb-12 md:pt-32 md:pb-16">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading eyebrow="Skills & tools" title={<>What I work <span className="text-accent">with</span></>} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((group, gi) => (
            <div
              key={gi}
              className="reveal spot group rounded-3xl border border-line bg-card p-6 transition-transform duration-500 ease-out-expo hover:-translate-y-1.5"
              style={{ '--d': `${gi * 110}ms` } as React.CSSProperties}
            >
              <EditButton path={['skills', gi]} className="-top-3 right-4" />
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{group.title}</h3>
                <span className="font-mono text-xs text-mute">0{gi + 1}</span>
              </div>
              <ul className="space-y-2.5">
                {group.items.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 transition-all duration-300 hover:translate-x-1 hover:border-line hover:bg-ink/60"
                    style={{ transitionDelay: `${i * 15}ms` }}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink ring-1 ring-line transition-transform duration-500 group-hover:scale-105">
                      <TechIcon name={s.icon} className="text-lg" />
                    </span>
                    <span className="text-sm text-soft">{s.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <AddButton listPath={['skills']} label="Add skill group" className="mt-5 w-full" />
      </div>

      {/* marquee strip */}
      <div className="relative mt-20">
      <EditButton path={['marquee']} label="Edit strip" className="-top-4 right-5 md:right-8" />
      <div className="reveal relative overflow-hidden border-y border-line/60 py-5 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-2xl font-semibold whitespace-nowrap text-white/25 transition-colors hover:text-accent md:text-3xl">
              {m}
              <span className="text-accent/60">✦</span>
            </span>
          ))}
        </div>
      </div>
      </div>
    </section>
  )
}
