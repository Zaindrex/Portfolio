import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiAlertTriangle, FiCheckCircle, FiDownload, FiEdit3, FiExternalLink, FiKey, FiLogOut, FiMinimize2, FiRotateCcw, FiSend } from 'react-icons/fi'
import { defaultContent, type Content } from '../data/content'
import { useContentStore } from '../data/ContentContext'
import { repoUrl, STUDIO_CONFIG } from './config'
import { Field, inputCls, labelFor, UploadContext } from './Fields'
import { currentContentSha, GitHubError, isConflict, readContentFile, uploadImage, verifyToken, writeContentFile } from './github'

const TOKEN_KEY = 'studio.token'
const DRAFT_KEY = 'studio.draft'

// Which section each tab scrolls the page to, so you see what you're editing.
const SECTION_FOR: Record<string, string> = {
  profile: 'top',
  about: 'about',
  skills: 'skills',
  marquee: 'skills',
  projects: 'projects',
  experience: 'experience',
  contact: 'contact',
}

const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k) ?? sessionStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k: string, v: string, persist = true) => {
    try {
      ;(persist ? localStorage : sessionStorage).setItem(k, v)
    } catch {
      /* storage blocked */
    }
  },
  del: (k: string) => {
    try {
      localStorage.removeItem(k)
      sessionStorage.removeItem(k)
    } catch {
      /* storage blocked */
    }
  },
}

const serialize = (c: Content) => JSON.stringify(c, null, 2) + '\n'

type Phase = 'login' | 'loading' | 'ready'
type Notice = { kind: 'ok' | 'err' | 'info'; text: string; link?: { href: string; label: string } } | null

export default function Studio() {
  const { content, setContent, setPreview } = useContentStore()
  const [token, setToken] = useState(() => store.get(TOKEN_KEY) ?? '')
  const [phase, setPhase] = useState<Phase>(token ? 'loading' : 'login')
  const [repoName, setRepoName] = useState('')
  const [baseSha, setBaseSha] = useState('')
  const [published, setPublished] = useState(() => serialize(defaultContent))
  const [tab, setTab] = useState<keyof Content>('profile')
  const [collapsed, setCollapsed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [conflict, setConflict] = useState(false)
  const [message, setMessage] = useState('')

  const current = useMemo(() => serialize(content), [content])
  const dirty = phase === 'ready' && current !== published

  // ── load from GitHub ──────────────────────────────────────
  const load = useCallback(
    async (tok: string, { keepDraft = true } = {}) => {
      setPhase('loading')
      setNotice(null)
      try {
        const name = await verifyToken(tok)
        const { text, sha } = await readContentFile(tok)
        const remote = JSON.parse(text) as Content
        setRepoName(name)
        setBaseSha(sha)
        setPublished(serialize(remote))

        const draft = keepDraft ? store.get(DRAFT_KEY) : null
        if (draft) {
          const d = JSON.parse(draft) as { content: Content; sha: string }
          setContent(d.content)
          setNotice({
            kind: 'info',
            text: d.sha === sha ? 'Restored your unsaved changes.' : 'Restored unsaved changes. Heads-up: the site was updated elsewhere since this draft was made.',
          })
        } else {
          setContent(remote)
        }
        setPhase('ready')
      } catch (e) {
        if (e instanceof GitHubError && e.status === 401) {
          store.del(TOKEN_KEY)
          setToken('')
          setNotice({ kind: 'err', text: 'GitHub rejected the token (expired or revoked). Paste a new one.' })
        } else if (e instanceof GitHubError && e.status === 404) {
          setNotice({
            kind: 'err',
            text: `Couldn't find ${STUDIO_CONFIG.owner}/${STUDIO_CONFIG.repo} → ${STUDIO_CONFIG.contentPath} on "${STUDIO_CONFIG.branch}". Push the project first, or check that the token has access to this repo.`,
          })
        } else {
          setNotice({ kind: 'err', text: e instanceof Error ? e.message : 'Something went wrong.' })
        }
        setPhase('login')
      }
    },
    [setContent],
  )

  useEffect(() => {
    if (token) load(token)
    // run once on mount with the saved token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── autosave draft & warn before leaving ──────────────────
  useEffect(() => {
    if (phase !== 'ready') return
    if (dirty) store.set(DRAFT_KEY, JSON.stringify({ content, sha: baseSha }))
    else store.del(DRAFT_KEY)
  }, [content, dirty, phase, baseSha])

  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  // ── actions ───────────────────────────────────────────────
  const publish = async (overwrite = false) => {
    setBusy(true)
    setNotice(null)
    setConflict(false)
    try {
      const sha = overwrite ? await currentContentSha(token) : baseSha
      const msg = message.trim() || `studio: update ${changedSections(published, current).join(', ') || 'content'}`
      const r = await writeContentFile(token, current, sha, msg)
      setBaseSha(r.sha)
      setPublished(current)
      setMessage('')
      store.del(DRAFT_KEY)
      setNotice({ kind: 'ok', text: 'Published! GitHub is rebuilding the site; it goes live in about a minute.', link: { href: `${repoUrl}/actions`, label: 'Watch the deploy' } })
    } catch (e) {
      if (isConflict(e)) {
        setConflict(true)
        setNotice({ kind: 'err', text: 'The content on GitHub changed since you opened the studio (another device or a manual commit?).' })
      } else {
        setNotice({ kind: 'err', text: e instanceof Error ? e.message : 'Publish failed.' })
      }
    } finally {
      setBusy(false)
    }
  }

  const discard = () => {
    setContent(JSON.parse(published) as Content)
    store.del(DRAFT_KEY)
    setNotice(null)
    setConflict(false)
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([current], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'content.json' })
    a.click()
    URL.revokeObjectURL(url)
  }

  const logout = () => {
    if (dirty && !window.confirm('You have unpublished changes. Log out anyway? (They stay saved as a draft on this device.)')) return
    store.del(TOKEN_KEY)
    setToken('')
    setPhase('login')
    setNotice(null)
  }

  const upload = useCallback(
    async (file: File) => {
      const path = await uploadImage(token, file)
      setPreview(path, URL.createObjectURL(file)) // show it now; the real file is live after the next deploy
      return path
    },
    [token, setPreview],
  )

  const goTo = (key: keyof Content) => {
    setTab(key)
    document.getElementById(SECTION_FOR[key] ?? '')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── collapsed pill ────────────────────────────────────────
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-5 bottom-5 z-[1000] inline-flex items-center gap-2 rounded-full border border-accent/50 bg-ink/90 px-4 py-2.5 text-sm font-medium text-white shadow-2xl shadow-black/60 backdrop-blur"
      >
        <FiEdit3 className="text-accent" /> Studio
        {dirty && <span className="h-2 w-2 rounded-full bg-accent" aria-label="unsaved changes" />}
      </button>
    )
  }

  return (
    <aside className="fixed top-0 right-0 z-[1000] flex h-dvh w-full flex-col border-l border-line bg-[#0e0e11]/97 font-sans text-soft shadow-[-24px_0_60px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl sm:w-[440px]">
      {/* header */}
      <header className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <FiEdit3 className="text-accent" />
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-semibold text-white">Studio</div>
          <div className="truncate font-mono text-[11px] text-mute">{repoName || `${STUDIO_CONFIG.owner}/${STUDIO_CONFIG.repo}`}</div>
        </div>
        {phase === 'ready' && (
          <button onClick={logout} title="Log out" className="grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-white/5 hover:text-white">
            <FiLogOut />
          </button>
        )}
        <button onClick={() => setCollapsed(true)} title="Minimise" className="grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-white/5 hover:text-white">
          <FiMinimize2 />
        </button>
      </header>

      {phase === 'login' && <Login notice={notice} onSubmit={(t, remember) => { store.set(TOKEN_KEY, t, remember); setToken(t); load(t) }} />}

      {phase === 'loading' && <div className="grid flex-1 place-items-center text-sm text-mute">Loading content from GitHub…</div>}

      {phase === 'ready' && (
        <>
          {/* tabs */}
          <nav className="flex gap-1.5 overflow-x-auto border-b border-line px-4 py-2.5 [scrollbar-width:none]">
            {(Object.keys(content) as (keyof Content)[]).map((key) => (
              <button
                key={key}
                onClick={() => goTo(key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === key ? 'bg-accent text-ink' : 'text-mute hover:bg-white/5 hover:text-white'
                }`}
              >
                {labelFor(key)}
              </button>
            ))}
          </nav>

          {/* fields */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <UploadContext.Provider value={upload}>
              <Field
                key={tab}
                k={tab}
                value={content[tab]}
                hideLabel={!Array.isArray(content[tab])}
                onChange={(v) => setContent({ ...content, [tab]: v } as Content)}
              />
            </UploadContext.Provider>
          </div>

          {/* footer */}
          <footer className="space-y-3 border-t border-line px-5 py-4">
            {notice && <NoticeBox notice={notice} />}
            {conflict && (
              <div className="flex gap-2">
                <button onClick={() => load(token, { keepDraft: false })} className="flex-1 rounded-lg border border-line px-3 py-2 text-xs text-soft hover:text-white">
                  Load latest (drop mine)
                </button>
                <button onClick={() => publish(true)} className="flex-1 rounded-lg border border-red-400/50 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10">
                  Overwrite with mine
                </button>
              </div>
            )}
            {dirty && (
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Commit message (optional)" className={inputCls} />
            )}
            <div className="flex items-center gap-2">
              <button onClick={download} title="Download content.json" className="grid h-10 w-10 place-items-center rounded-lg border border-line text-mute hover:text-white">
                <FiDownload />
              </button>
              <button
                onClick={discard}
                disabled={!dirty || busy}
                title="Discard changes"
                className="grid h-10 w-10 place-items-center rounded-lg border border-line text-mute hover:text-white disabled:opacity-30"
              >
                <FiRotateCcw />
              </button>
              <button
                onClick={() => publish()}
                disabled={!dirty || busy}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-ink transition-opacity disabled:opacity-35"
              >
                <FiSend /> {busy ? 'Publishing…' : dirty ? 'Publish' : 'No changes'}
              </button>
            </div>
          </footer>
        </>
      )}
    </aside>
  )
}

function changedSections(before: string, after: string) {
  const a = JSON.parse(before) as Record<string, unknown>
  const b = JSON.parse(after) as Record<string, unknown>
  return Object.keys(b).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]))
}

function NoticeBox({ notice }: { notice: NonNullable<Notice> }) {
  const style = {
    ok: 'border-green-500/30 bg-green-500/10 text-green-200',
    err: 'border-red-500/30 bg-red-500/10 text-red-200',
    info: 'border-line bg-white/[0.03] text-soft',
  }[notice.kind]
  const Icon = notice.kind === 'ok' ? FiCheckCircle : FiAlertTriangle
  return (
    <div className={`flex gap-2.5 rounded-lg border px-3 py-2.5 text-xs leading-relaxed ${style}`}>
      <Icon className="mt-0.5 shrink-0" />
      <div>
        {notice.text}
        {notice.link && (
          <a href={notice.link.href} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center gap-1 underline underline-offset-2">
            {notice.link.label} <FiExternalLink />
          </a>
        )}
      </div>
    </div>
  )
}

function Login({ notice, onSubmit }: { notice: Notice; onSubmit: (token: string, remember: boolean) => void }) {
  const [value, setValue] = useState('')
  const [remember, setRemember] = useState(true)
  return (
    <form
      className="flex-1 space-y-5 overflow-y-auto px-5 py-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) onSubmit(value.trim(), remember)
      }}
    >
      <div>
        <h2 className="font-display text-xl font-semibold text-white">Unlock editing</h2>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          Paste a GitHub fine-grained token. It's stored only in this browser and sent only to GitHub, which checks it on every publish.
        </p>
      </div>
      {notice && <NoticeBox notice={notice} />}
      <div>
        <label htmlFor="studio-token" className="mb-1.5 block font-mono text-[11px] tracking-wider text-mute uppercase">
          Token
        </label>
        <input
          id="studio-token"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="github_pat_…"
          className={inputCls}
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-soft">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#ff8a1f]" />
        Remember on this device
      </label>
      <button type="submit" disabled={!value.trim()} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-ink disabled:opacity-35">
        <FiKey /> Unlock
      </button>

      <div className="rounded-xl border border-line/70 p-4 text-xs leading-relaxed text-mute">
        <div className="mb-2 font-medium text-soft">Making a token (one time)</div>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            Open{' '}
            <a className="text-accent underline underline-offset-2" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
              GitHub → new fine-grained token
            </a>
          </li>
          <li>Expiration: 90 days</li>
          <li>
            Repository access: <span className="text-soft">Only select repositories → {STUDIO_CONFIG.repo}</span>
          </li>
          <li>
            Permissions → Contents: <span className="text-soft">Read and write</span> (nothing else)
          </li>
        </ol>
      </div>
    </form>
  )
}
