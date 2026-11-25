import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiAlertTriangle,
  FiArrowDown,
  FiArrowUp,
  FiCheckCircle,
  FiDownload,
  FiEdit3,
  FiExternalLink,
  FiKey,
  FiLogOut,
  FiRotateCcw,
  FiSend,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { defaultContent, type Content } from '../data/content'
import { useContentStore, type ContentPath } from '../data/ContentContext'
import { repoUrl, STUDIO_CONFIG } from './config'
import { Field, labelFor, newItem, singular, summaryOf, UploadContext, inputCls } from './Fields'
import { currentContentSha, GitHubError, isConflict, readContentFile, uploadImage, verifyToken, writeContentFile } from './github'

// The studio runs on top of the live page: once you're logged in, every section
// gets an Edit button (see components/EditControls.tsx). Clicking one opens a
// card here with just that item's fields, and a floating bar handles publishing.

const TOKEN_KEY = 'studio.token'
const DRAFT_KEY = 'studio.draft'

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

// ── immutable path helpers ──────────────────────────────────

function getIn(obj: unknown, path: ContentPath): unknown {
  return path.reduce<unknown>((acc, k) => (acc == null ? undefined : (acc as Record<string | number, unknown>)[k]), obj)
}

function setIn(obj: unknown, path: ContentPath, value: unknown): unknown {
  if (!path.length) return value
  const [k, ...rest] = path
  if (Array.isArray(obj)) {
    const copy = obj.slice()
    copy[k as number] = setIn(obj[k as number], rest, value)
    return copy
  }
  const rec = obj as Record<string, unknown>
  return { ...rec, [k]: setIn(rec[k as string], rest, value) }
}

function changedSections(before: string, after: string) {
  const a = JSON.parse(before) as Record<string, unknown>
  const b = JSON.parse(after) as Record<string, unknown>
  return Object.keys(b).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]))
}

type Phase = 'login' | 'loading' | 'ready'
type Notice = { kind: 'ok' | 'err' | 'info'; text: string; link?: { href: string; label: string } } | null

const exitStudio = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('studio')
  window.location.href = url.toString()
}

export default function Studio() {
  const { content, setContent, setPreview, setEditor } = useContentStore()
  const [token, setToken] = useState(() => store.get(TOKEN_KEY) ?? '')
  const [phase, setPhase] = useState<Phase>(token ? 'loading' : 'login')
  const [baseSha, setBaseSha] = useState('')
  const [published, setPublished] = useState(() => serialize(defaultContent))
  const [target, setTarget] = useState<ContentPath | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [conflict, setConflict] = useState(false)

  const current = useMemo(() => serialize(content), [content])
  const changed = useMemo(() => (phase === 'ready' ? changedSections(published, current) : []), [phase, published, current])
  const dirty = changed.length > 0

  // ── load from GitHub ──────────────────────────────────────
  const load = useCallback(
    async (tok: string, { keepDraft = true } = {}) => {
      setPhase('loading')
      setNotice(null)
      setConflict(false)
      try {
        await verifyToken(tok)
        const { text, sha } = await readContentFile(tok)
        const remote = JSON.parse(text) as Content
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
            text: `Couldn't find ${STUDIO_CONFIG.owner}/${STUDIO_CONFIG.repo} → ${STUDIO_CONFIG.contentPath} on "${STUDIO_CONFIG.branch}". Push the project first, or check the token has access to this repo.`,
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

  // ── give the page its Edit buttons ────────────────────────
  useEffect(() => {
    if (phase !== 'ready') {
      setEditor(null)
      return
    }
    setEditor({
      active: target ? target.join('.') : null,
      open: (path) => setTarget(path),
      add: (listPath) => {
        const list = (getIn(content, listPath) as unknown[]) ?? []
        const key = String(listPath[listPath.length - 1])
        setContent(setIn(content, listPath, [...list, newItem(list, key)]) as Content)
        setTarget([...listPath, list.length])
      },
    })
  }, [phase, target, content, setContent, setEditor])

  useEffect(() => () => setEditor(null), [setEditor])

  // close the card if its item disappeared (deleted, discarded)
  const targetValue = target ? getIn(content, target) : undefined
  useEffect(() => {
    if (target && targetValue === undefined) setTarget(null)
  }, [target, targetValue])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setTarget(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
      const r = await writeContentFile(token, current, sha, `studio: update ${changed.join(', ') || 'content'}`)
      setBaseSha(r.sha)
      setPublished(current)
      store.del(DRAFT_KEY)
      setTarget(null)
      setNotice({ kind: 'ok', text: 'Published! The site rebuilds and goes live in about a minute.', link: { href: `${repoUrl}/actions`, label: 'Watch the deploy' } })
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
    store.del(TOKEN_KEY)
    setToken('')
    setTarget(null)
    setPhase('login')
    setNotice(dirty ? { kind: 'info', text: 'Logged out. Your unpublished changes are kept as a draft on this device.' } : null)
  }

  const upload = useCallback(
    async (file: File) => {
      const path = await uploadImage(token, file)
      setPreview(path, URL.createObjectURL(file)) // show it now; the real file is live after the next deploy
      return path
    },
    [token, setPreview],
  )

  // ── login / loading ───────────────────────────────────────
  if (phase !== 'ready') {
    return (
      <div className="fixed right-3 bottom-3 left-3 z-[1000] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-line bg-[#0e0e11]/97 font-sans text-soft shadow-2xl shadow-black/70 backdrop-blur-xl sm:left-auto sm:w-[400px]">
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
          <FiEdit3 className="text-accent" />
          <span className="flex-1 font-display font-semibold text-white">Studio</span>
          <button onClick={exitStudio} className="text-xs text-mute hover:text-white">
            Exit
          </button>
        </div>
        {phase === 'loading' ? (
          <div className="px-5 py-10 text-center text-sm text-mute">Loading content from GitHub…</div>
        ) : (
          <Login
            notice={notice}
            onSubmit={(t, remember) => {
              store.set(TOKEN_KEY, t, remember)
              setToken(t)
              load(t)
            }}
          />
        )}
      </div>
    )
  }

  // ── editing ───────────────────────────────────────────────
  return (
    <UploadContext.Provider value={upload}>
      {target && targetValue !== undefined && (
        <EditorCard
          path={target}
          value={targetValue}
          content={content}
          onChange={(v) => setContent(setIn(content, target, v) as Content)}
          onReplaceList={(listPath, list, nextTarget) => {
            setContent(setIn(content, listPath, list) as Content)
            setTarget(nextTarget)
          }}
          onClose={() => setTarget(null)}
        />
      )}

      <div className="fixed bottom-4 left-1/2 z-[1000] w-[min(640px,calc(100vw-1.5rem))] -translate-x-1/2 font-sans">
        {notice && (
          <div className="mb-2">
            <NoticeBox notice={notice} onClose={() => setNotice(null)}>
              {conflict && (
                <div className="mt-2.5 flex gap-2">
                  <button onClick={() => load(token, { keepDraft: false })} className="rounded-lg border border-line px-3 py-1.5 text-xs text-soft hover:text-white">
                    Load latest (drop mine)
                  </button>
                  <button onClick={() => publish(true)} className="rounded-lg border border-red-400/50 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">
                    Overwrite with mine
                  </button>
                </div>
              )}
            </NoticeBox>
          </div>
        )}
        <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-[#0e0e11]/95 p-2 pl-4 text-soft shadow-2xl shadow-black/70 backdrop-blur-xl">
          <FiEdit3 className="shrink-0 text-accent" />
          <div className="min-w-0 flex-1 truncate text-xs">
            {dirty ? (
              <>
                <span className="font-medium text-white">Unsaved</span>
                <span className="text-mute"> · {changed.map((k) => labelFor(k)).join(', ')}</span>
              </>
            ) : (
              <span className="text-mute">Studio · everything is published</span>
            )}
          </div>
          <BarIcon title="Discard changes" disabled={!dirty || busy} onClick={discard}>
            <FiRotateCcw />
          </BarIcon>
          <BarIcon title="Download content.json" onClick={download}>
            <FiDownload />
          </BarIcon>
          <BarIcon title="Log out" onClick={logout}>
            <FiLogOut />
          </BarIcon>
          <BarIcon title="Exit studio" onClick={exitStudio}>
            <FiX />
          </BarIcon>
          <button
            onClick={() => publish()}
            disabled={!dirty || busy}
            className="ml-1 inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-ink transition-opacity disabled:opacity-35"
          >
            <FiSend /> {busy ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </UploadContext.Provider>
  )
}

// ── editor card ─────────────────────────────────────────────

function EditorCard({
  path,
  value,
  content,
  onChange,
  onReplaceList,
  onClose,
}: {
  path: ContentPath
  value: unknown
  content: Content
  onChange: (v: unknown) => void
  onReplaceList: (listPath: ContentPath, list: unknown[], nextTarget: ContentPath | null) => void
  onClose: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const section = String(path[0])
  const isItem = typeof path[path.length - 1] === 'number'
  const listPath = path.slice(0, -1)
  const index = path[path.length - 1] as number
  const list = isItem ? (getIn(content, listPath) as unknown[]) : []
  const listKey = String(listPath[listPath.length - 1])

  const title = isItem ? summaryOf(value) || `New ${singular(listKey)}` : labelFor(section)
  const eyebrow = isItem ? `${singular(listKey)} ${index + 1} of ${list.length}` : 'Section'

  const moveTo = (to: number) => {
    const next = list.slice()
    const [x] = next.splice(index, 1)
    next.splice(to, 0, x)
    onReplaceList(listPath, next, [...listPath, to])
  }

  return (
    <div className="fixed top-3 right-3 bottom-24 left-3 z-[1000] flex flex-col overflow-hidden rounded-2xl border border-accent/30 bg-[#0e0e11]/97 font-sans text-soft shadow-2xl shadow-black/70 backdrop-blur-xl sm:top-20 sm:left-auto sm:w-[420px]">
      <div className="flex items-start gap-3 border-b border-line px-5 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] tracking-widest text-accent uppercase">{eyebrow}</div>
          <div className="truncate font-display text-base font-semibold text-white">{title}</div>
        </div>
        <button onClick={onClose} title="Close (Esc)" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-mute hover:bg-white/5 hover:text-white">
          <FiX />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <Field key={path.join('.')} k={isItem ? listKey : section} parent={isItem ? listKey : undefined} value={value} onChange={onChange} hideLabel={!Array.isArray(value)} />
      </div>

      {isItem && (
        <div className="flex items-center gap-1.5 border-t border-line px-4 py-3">
          <button
            disabled={index === 0}
            onClick={() => moveTo(index - 1)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-mute hover:bg-white/5 hover:text-white disabled:opacity-30"
          >
            <FiArrowUp /> Move up
          </button>
          <button
            disabled={index === list.length - 1}
            onClick={() => moveTo(index + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-mute hover:bg-white/5 hover:text-white disabled:opacity-30"
          >
            <FiArrowDown /> Move down
          </button>
          <div className="flex-1" />
          {confirmDelete ? (
            <button
              autoFocus
              onBlur={() => setConfirmDelete(false)}
              onClick={() => onReplaceList(listPath, list.filter((_, j) => j !== index), null)}
              className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-300"
            >
              Yes, delete it
            </button>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-mute hover:bg-red-500/10 hover:text-red-300">
              <FiTrash2 /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── small pieces ────────────────────────────────────────────

function BarIcon({ title, onClick, disabled, children }: { title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-mute transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

function NoticeBox({ notice, onClose, children }: { notice: NonNullable<Notice>; onClose?: () => void; children?: React.ReactNode }) {
  const style = {
    ok: 'border-green-500/30 bg-[#0f1a13]/95 text-green-200',
    err: 'border-red-500/30 bg-[#1c0f10]/95 text-red-200',
    info: 'border-line bg-[#0e0e11]/95 text-soft',
  }[notice.kind]
  const Icon = notice.kind === 'ok' ? FiCheckCircle : FiAlertTriangle
  return (
    <div className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed shadow-xl shadow-black/50 backdrop-blur-xl ${style}`}>
      <Icon className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        {notice.text}
        {notice.link && (
          <a href={notice.link.href} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center gap-1 underline underline-offset-2">
            {notice.link.label} <FiExternalLink />
          </a>
        )}
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
          <FiX />
        </button>
      )}
    </div>
  )
}

function Login({ notice, onSubmit }: { notice: Notice; onSubmit: (token: string, remember: boolean) => void }) {
  const [value, setValue] = useState('')
  const [remember, setRemember] = useState(true)
  return (
    <form
      className="space-y-4 px-5 py-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) onSubmit(value.trim(), remember)
      }}
    >
      <p className="text-sm leading-relaxed text-mute">
        Paste your GitHub token to unlock editing. It stays in this browser and is only sent to GitHub, which checks it on every publish.
      </p>
      {notice && <NoticeBox notice={notice} />}
      <input
        type="password"
        aria-label="GitHub token"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="github_pat_…"
        className={inputCls}
      />
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-soft">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#ff8a1f]" />
        Remember on this device
      </label>
      <button type="submit" disabled={!value.trim()} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-ink disabled:opacity-35">
        <FiKey /> Unlock
      </button>
      <details className="rounded-xl border border-line/70 px-4 py-3 text-xs leading-relaxed text-mute">
        <summary className="cursor-pointer text-soft">How to make a token</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>
            Open{' '}
            <a className="text-accent underline underline-offset-2" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
              GitHub → new fine-grained token
            </a>
          </li>
          <li>Expiration: 90 days or more</li>
          <li>Repository access: Only select repositories → {STUDIO_CONFIG.repo}</li>
          <li>Permissions → Contents: Read and write (nothing else)</li>
        </ol>
      </details>
    </form>
  )
}
