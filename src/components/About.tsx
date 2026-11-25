import { FiBriefcase, FiMail, FiMapPin, FiUser } from 'react-icons/fi'
import { useContent } from '../data/ContentContext'
import { SectionHeading } from './SectionHeading'

export function About() {
  const { about, profile } = useContent()
  const words = about.heading.split(' ')
  const headLast = words.pop()
  const headStart = words.join(' ')
  const info = [
    { Icon: FiUser, k: 'Name', v: profile.name },
    { Icon: FiBriefcase, k: 'Role', v: about.currentRole },
    { Icon: FiMapPin, k: 'Location', v: profile.location },
    { Icon: FiMail, k: 'Email', v: profile.email, href: `mailto:${profile.email}` },
  ]

  return (
    <section id="about" className="relative border-t border-line/60 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading eyebrow="About me" title={<>{headStart} <span className="text-accent">{headLast}</span></>} />

        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            {about.paragraphs.map((p, i) => (
              <p key={i} className="reveal mb-5 text-lg leading-relaxed text-soft/90" style={{ '--d': `${i * 100}ms` } as React.CSSProperties}>
                {p}
              </p>
            ))}

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {about.now.map((n, i) => (
                <div
                  key={i}
                  className="reveal reveal-scale spot rounded-2xl border border-line bg-card p-5 transition-transform duration-500 ease-out-expo hover:-translate-y-1"
                  style={{ '--d': `${i * 90}ms` } as React.CSSProperties}
                >
                  <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    {n.label}
                  </div>
                  <div className="mt-2.5 text-sm leading-snug text-white">{n.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal reveal-right spot h-fit rounded-3xl border border-line bg-card p-7" style={{ '--d': '150ms' } as React.CSSProperties}>
            <div className="mb-6 flex items-center justify-between">
              <span className="font-mono text-xs tracking-[0.2em] text-mute uppercase">// quick facts</span>
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </span>
            </div>
            <ul className="space-y-5">
              {info.map(({ Icon, k, v, href }) => (
                <li key={k} className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
                    <Icon />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs text-mute">{k}</div>
                    {href ? (
                      <a href={href} className="block truncate text-white transition-colors hover:text-accent">
                        {v}
                      </a>
                    ) : (
                      <div className="text-white">{v}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-7 rounded-xl border border-line bg-ink/60 p-4 font-mono text-[13px] leading-relaxed">
              <span className="text-accent">const</span> <span className="text-white">focus</span> = [
              <span className="text-green-400">'Curiosity'</span>, <span className="text-green-400">'Creativity'</span>,{' '}
              <span className="text-green-400">'Consistency'</span>, <span className="text-green-400">'Creation'</span>];
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
