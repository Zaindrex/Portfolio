import { FiArrowUp, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import { useContent } from '../data/ContentContext'

export function Footer() {
  const { profile } = useContent()
  return (
    <footer className="border-t border-line/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 md:flex-row md:px-8">
        <div className="text-center md:text-left">
          <div className="font-display text-lg font-semibold text-white">
            Md Asif Raza<span className="text-accent">.</span>
          </div>
          <p className="mt-1 text-sm text-mute">© {new Date().getFullYear()} · Just a developer turning ideas into reality.</p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { href: profile.socials.github, Icon: FiGithub, label: 'GitHub' },
            { href: profile.socials.linkedin, Icon: FiLinkedin, label: 'LinkedIn' },
            { href: `mailto:${profile.email}`, Icon: FiMail, label: 'Email' },
          ].map(({ href, Icon, label }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-mute transition-all duration-300 hover:-translate-y-1 hover:text-accent">
              <Icon />
            </a>
          ))}
          <a href="#top" aria-label="Back to top" className="ml-2 grid h-10 w-10 place-items-center rounded-xl bg-accent text-ink transition-transform duration-300 hover:-translate-y-1">
            <FiArrowUp />
          </a>
        </div>
      </div>
    </footer>
  )
}
