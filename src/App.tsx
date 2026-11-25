import { lazy, Suspense } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Experience } from './components/Experience'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { Projects } from './components/Projects'
import { Skills } from './components/Skills'
import { useActiveSection, useRevealAll, useSpotlight } from './hooks/useReveal'

// The editor only loads when the URL has ?studio, so visitors never download it.
const Studio = lazy(() => import('./studio/Studio'))
const studioRequested = new URLSearchParams(window.location.search).has('studio')

const SECTIONS = ['about', 'skills', 'projects', 'experience', 'contact']

export default function App() {
  useRevealAll()
  useActiveSection(SECTIONS)
  useSpotlight()

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
      {studioRequested && (
        <Suspense fallback={null}>
          <Studio />
        </Suspense>
      )}
    </>
  )
}
