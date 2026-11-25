import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { defaultContent, type Content } from './content'

export type ContentPath = (string | number)[]

/** Set by the studio once you're logged in. Null for normal visitors. */
export type EditorApi = {
  /** Path of the item being edited, joined with '.', for highlighting. */
  active: string | null
  open: (path: ContentPath) => void
  add: (listPath: ContentPath) => void
}

type Ctx = {
  editor: EditorApi | null
  setEditor: (e: EditorApi | null) => void
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
  const [editor, setEditor] = useState<EditorApi | null>(null)
  const value = useMemo<Ctx>(
    () => ({
      editor,
      setEditor,
      content,
      setContent,
      previews,
      setPreview: (path, url) => setPreviews((p) => ({ ...p, [path]: url })),
    }),
    [content, previews, editor],
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
export const useEditor = () => useCtx().editor

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
