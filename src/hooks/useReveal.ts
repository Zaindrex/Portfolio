import { useEffect } from 'react'

/**
 * Adds `.is-visible` to every `.reveal` element when it scrolls into view.
 * Also watches for `.reveal` elements added later (e.g. a project added in the studio).
 */
export function useRevealAll() {
  useEffect(() => {
    const showAll = (els: Iterable<Element>) => {
      for (const el of els) el.classList.add('is-visible')
    }
    if (!('IntersectionObserver' in window)) {
      showAll(document.querySelectorAll('.reveal'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    const observeNew = (root: ParentNode) =>
      root.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)').forEach((el) => io.observe(el))
    observeNew(document)

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return
          if (n.matches('.reveal:not(.is-visible)')) io.observe(n)
          observeNew(n)
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}

/** Tracks which section is currently in view (for the navbar highlight). */
export function useActiveSection(ids: string[]) {
  useEffect(() => {
    const links = () => document.querySelectorAll<HTMLAnchorElement>('[data-nav]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links().forEach((a) =>
              a.toggleAttribute('data-active', a.dataset.nav === e.target.id),
            )
          }
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids])
}

/** Mouse-follow spotlight: sets --mx / --my on `.spot` elements. */
export function useSpotlight() {
  useEffect(() => {
    const onMove = (ev: PointerEvent) => {
      const target = (ev.target as HTMLElement | null)?.closest<HTMLElement>('.spot')
      if (!target) return
      const r = target.getBoundingClientRect()
      target.style.setProperty('--mx', `${ev.clientX - r.left}px`)
      target.style.setProperty('--my', `${ev.clientY - r.top}px`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
}
