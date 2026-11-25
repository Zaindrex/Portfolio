import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { defaultContent, type Content } from './content'

type Ctx = {
  content: Content
  setContent: (c: Content) => void
  /** Local previews for images uploaded in the studio but not deployed yet. */
  previews: Record<string, string>
  setPreview: (path: string, objectUrl: string) => void
}

const ContentContext = createContext<Ctx | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content>(defaultContent)
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const value = useMemo<Ctx>(
    () => ({
      content,
      setContent,
      previews,
      setPreview: (path, url) => setPreviews((p) => ({ ...p, [path]: url })),
    }),
    [content, previews],
  )
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

function useCtx() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}

export const useContent = () => useCtx().content
export const useContentStore = useCtx

/**
 * Resolves a /public path against the deploy base (e.g. '/Portfolio/' on GitHub Pages).
 * Full URLs are returned untouched.
 */
export function useAsset() {
  const { previews } = useCtx()
  return (path: string) => {
    if (!path) return ''
    if (previews[path]) return previews[path]
    if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path
    return import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
  }
}
