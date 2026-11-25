import { useState } from 'react'
import { FiArrowUpRight, FiCheckCircle, FiGithub, FiLinkedin, FiMail, FiMapPin, FiSend } from 'react-icons/fi'
import { SiHackerrank, SiLeetcode } from 'react-icons/si'
import { useContent } from '../data/ContentContext'
import { SectionHeading } from './SectionHeading'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function Contact() {
  const { profile, contact } = useContent()
  const FORMSPREE_ID = contact.formspreeId.trim()
  const [status, setStatus] = useState<Status>('idle')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    if (!FORMSPREE_ID) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${data.get('name')}`)
      const body = encodeURIComponent(`${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`)
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  const channels = [
    { Icon: FiMail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { Icon: FiLinkedin, label: 'LinkedIn', value: 'md-asif-raza', href: profile.socials.linkedin },
    { Icon: FiGithub, label: 'GitHub', value: '@Zaindrex', href: profile.socials.github },
    { Icon: FiMapPin, label: 'Based in', value: profile.location },
  ]

  const input =
    'w-full rounded-xl border border-line bg-ink/70 px-4 py-3.5 text-sm text-white placeholder:text-mute/70 outline-none transition-all duration-300 focus:border-accent/70 focus:bg-ink focus:shadow-[0_0_0_4px_rgb(255_138_31/0.12)]'

  return (
    <section id="contact" className="relative overflow-hidden border-t border-line/60 py-24 md:py-32">
      <div className="absolute bottom-0 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 translate-y-1/2 rounded-full bg-accent/10 blur-[140px]" />
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading eyebrow="Get in touch" title={<>Let’s build something <span className="text-accent">together</span></>} />

        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="reveal max-w-md text-lg leading-relaxed text-mute">
              Hiring for a full-stack or .NET role, have an idea worth building, or just want to talk APIs, maps or RAG? My inbox is open.
            </p>
            <ul className="mt-8 space-y-3">
              {channels.map(({ Icon, label, value, href }, i) => {
                const inner = (
                  <>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20 transition-transform duration-300 group-hover:scale-110">
                      <Icon />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-mute">{label}</span>
                      <span className="block truncate text-white">{value}</span>
                    </span>
                    {href && <FiArrowUpRight className="text-mute transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />}
                  </>
                )
                const cls = 'group spot flex items-center gap-4 rounded-2xl border border-line bg-card p-4 transition-all duration-300 hover:border-line hover:translate-x-1'
                return (
                  <li key={label} className="reveal" style={{ '--d': `${i * 80}ms` } as React.CSSProperties}>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={cls}>
                        {inner}
                      </a>
                    ) : (
                      <div className={cls}>{inner}</div>
                    )}
                  </li>
                )
              })}
            </ul>
            {(profile.socials.leetcode || profile.socials.hackerrank) && (
              <div className="reveal mt-6 flex gap-3">
                {profile.socials.leetcode && (
                  <a href={profile.socials.leetcode} target="_blank" rel="noreferrer" aria-label="LeetCode" className="grid h-11 w-11 place-items-center rounded-xl border border-line text-mute transition-all hover:-translate-y-1 hover:text-accent">
                    <SiLeetcode />
                  </a>
                )}
                {profile.socials.hackerrank && (
                  <a href={profile.socials.hackerrank} target="_blank" rel="noreferrer" aria-label="HackerRank" className="grid h-11 w-11 place-items-center rounded-xl border border-line text-mute transition-all hover:-translate-y-1 hover:text-accent">
                    <SiHackerrank />
                  </a>
                )}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="reveal reveal-right spot rounded-3xl border border-line bg-card p-6 md:p-8" style={{ '--d': '150ms' } as React.CSSProperties}>
            {status === 'sent' ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                <FiCheckCircle className="text-5xl text-accent" />
                <h3 className="mt-4 text-2xl font-semibold">Message sent!</h3>
                <p className="mt-2 text-mute">Thanks for reaching out. I’ll reply within a day or two.</p>
                <button type="button" onClick={() => setStatus('idle')} className="mt-6 text-sm text-accent hover:underline">
                  Send another
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs text-mute">Your name</span>
                    <input name="name" required className={input} placeholder="Jane Doe" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs text-mute">Your email</span>
                    <input name="email" type="email" required className={input} placeholder="jane@company.com" />
                  </label>
                </div>
                <label className="mt-4 block">
                  <span className="mb-2 block text-xs text-mute">Message</span>
                  <textarea name="message" required rows={6} className={`${input} resize-none`} placeholder="Tell me about the role or idea…" />
                </label>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-10px_rgb(255_138_31/0.8)] disabled:opacity-60 sm:w-auto"
                >
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                  <FiSend className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                </button>
                {status === 'error' && <p className="mt-3 text-sm text-red-400">Something went wrong. Please email me directly.</p>}
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
