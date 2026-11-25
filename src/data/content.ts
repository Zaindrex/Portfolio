// ─────────────────────────────────────────────────────────────
//  Site content lives in content.json (next to this file).
//  Edit it by hand, or visit the site with ?studio to edit it
//  in the browser and publish straight to GitHub.
//  This file only describes its shape.
// ─────────────────────────────────────────────────────────────
import data from './content.json'

export type Socials = { github: string; linkedin: string; leetcode: string; hackerrank: string }

export type Profile = {
  name: string
  firstName: string
  lastName: string
  role: string
  roles: string[]
  tagline: string
  location: string
  email: string
  status: string
  /** Path inside /public, e.g. '/asif.png'. Empty shows the monogram placeholder. */
  photo: string
  resume: string
  socials: Socials
}

export type About = {
  heading: string
  paragraphs: string[]
  now: { label: string; text: string }[]
  currentRole: string
}

// `icon` keys map to react-icons in components/TechIcon.tsx
export type SkillGroup = { title: string; items: { name: string; icon: string }[] }

export type ProjectVisualKind = 'map' | 'rag' | 'sign' | 'street' | 'review'

export type Project = {
  title: string
  tagline: string
  problem: string
  highlights: string[]
  stack: string[]
  visual: ProjectVisualKind
  status: string
  live: string
  repo: string
  /** Optional screenshot in /public; replaces the illustrated preview when set. */
  image: string
}

export type TimelineItem = {
  period: string
  title: string
  org: string
  place: string
  points: string[]
  current: boolean
}

export type Content = {
  profile: Profile
  about: About
  skills: SkillGroup[]
  /** Scrolling strip of tech names under the skills grid. */
  marquee: string[]
  projects: Project[]
  experience: TimelineItem[]
  /** formspreeId: free form id from formspree.io. Empty = contact form opens the mail app. */
  contact: { formspreeId: string }
}

export const defaultContent = data as Content
