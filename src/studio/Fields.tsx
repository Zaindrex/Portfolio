import { createContext, useContext, useId, useRef, useState } from 'react'
import { FiArrowDown, FiArrowUp, FiChevronDown, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi'
import { techIconKeys } from '../components/TechIcon'

// The editor walks the JSON and picks an input per value type, so adding a new
// field to content.json makes it editable here with no extra code.
// The tables below only fine-tune labels and inputs.

const LABELS: Record<string, string> = {
  firstName: 'First name',
  lastName: 'Last name (highlighted)',
  roles: 'Rotating roles',
  status: 'Availability badge',
  photo: 'Photo',
  resume: 'Resume PDF',
  currentRole: 'Role shown in About',
  now: '“Now” cards',
  formspreeId: 'Formspree form ID',
  problem: 'Description',
  highlights: 'Highlights',
  stack: 'Tech stack',
  visual: 'Illustration (when no image)',
  status_project: 'Badge',
  live: 'Live demo URL',
  repo: 'Source code URL',
  image: 'Screenshot',
  current: 'Current role',
  points: 'Bullet points',
  marquee: 'Scrolling tech strip',
}

const HINTS: Record<string, string> = {
  photo: 'Transparent PNG/WebP cut-out looks best.',
  image: 'Replaces the illustration. Leave empty to keep the illustration.',
  formspreeId: 'From formspree.io. Empty = contact form opens the mail app.',
  icon: 'Pick a known icon key, or type any text (falls back to a generic icon).',
  status: 'Leave empty to hide.',
}

const LONG_TEXT = new Set(['tagline', 'problem', 'heading', 'text'])
const LONG_LIST_ITEMS = new Set(['paragraphs', 'points', 'highlights'])
const ENUMS: Record<string, string[]> = { visual: ['map', 'rag', 'sign', 'street'] }
const ASSETS = new Set(['photo', 'image', 'resume'])
const SUMMARY_KEYS = ['title', 'name', 'label', 'org', 'period']

const humanize = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
export const labelFor = (k: string, parent?: string) =>
  (parent === 'projects' && k === 'status' ? LABELS.status_project : LABELS[k]) ?? humanize(k)

/** Uploads a file and resolves to the site path. Provided by the studio. */
export const UploadContext = createContext<((file: File) => Promise<string>) | null>(null)

export const inputCls =
  'w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-mute/60 focus:border-accent/70'
const iconBtn =
  'grid h-7 w-7 shrink-0 place-items-center rounded-md text-mute transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent'

/** An empty value with the same shape, used for "Add item". */
function blank(v: unknown, key?: string): unknown {
  if (key && ENUMS[key]) return ENUMS[key][0]
  if (typeof v === 'string') return ''
  if (typeof v === 'number') return 0
  if (typeof v === 'boolean') return false
  if (Array.isArray(v)) return []
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x, k)]))
  return ''
}

const TEMPLATES: Record<string, unknown> = {
  skills: { title: '', items: [] },
  items: { name: '', icon: '' },
  now: { label: '', text: '' },
  projects: { title: '', tagline: '', problem: '', highlights: [], stack: [], visual: 'map', status: '', live: '', repo: '', image: '' },
  experience: { period: '', title: '', org: '', place: '', current: false, points: [] },
}

function newItem(list: unknown[], key: string) {
  if (list.length) return blank(list[0])
  return structuredClone(TEMPLATES[key] ?? '')
}

function move<T>(arr: T[], from: number, to: number) {
  const next = arr.slice()
  const [x] = next.splice(from, 1)
  next.splice(to, 0, x)
  return next
}

// ── field dispatcher ────────────────────────────────────────

type FieldProps = { k: string; parent?: string; value: unknown; onChange: (v: unknown) => void; hideLabel?: boolean }

export function Field({ k, parent, value, onChange, hideLabel }: FieldProps) {
  if (typeof value === 'boolean') return <BoolField k={k} value={value} onChange={onChange} />
  if (typeof value === 'string') return <StringField k={k} parent={parent} value={value} onChange={onChange} hideLabel={hideLabel} />
  if (Array.isArray(value)) return <ListField k={k} value={value} onChange={onChange} />
  if (value && typeof value === 'object')
    return <ObjectField k={k} parent={parent} value={value as Record<string, unknown>} onChange={onChange} hideLabel={hideLabel} />
  return null
}

function Label({ k, parent, htmlFor }: { k: string; parent?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-mono text-[11px] tracking-wider text-mute uppercase">
      {labelFor(k, parent)}
    </label>
  )
}

const Hint = ({ k }: { k: string }) => (HINTS[k] ? <p className="mt-1 text-xs text-mute/80">{HINTS[k]}</p> : null)

function BoolField({ k, value, onChange }: { k: string; value: boolean; onChange: (v: unknown) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-soft">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#ff8a1f]" />
      {labelFor(k)}
    </label>
  )
}

function StringField({ k, parent, value, onChange, hideLabel }: { k: string; parent?: string; value: string; onChange: (v: unknown) => void; hideLabel?: boolean }) {
  const id = useId()
  let input
  if (ENUMS[k]) {
    input = (
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {ENUMS[k].map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    )
  } else if (ASSETS.has(k)) {
    input = <AssetInput id={id} k={k} value={value} onChange={onChange} />
  } else if (k === 'icon') {
    input = (
      <>
        <input id={id} list={`${id}-icons`} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
        <datalist id={`${id}-icons`}>
          {techIconKeys.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      </>
    )
  } else if (LONG_TEXT.has(k) || value.length > 90) {
    input = <AutoTextarea id={id} value={value} onChange={onChange} />
  } else {
    input = <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
  }
  return (
    <div>
      {!hideLabel && <Label k={k} parent={parent} htmlFor={id} />}
      {input}
      {!hideLabel && <Hint k={k} />}
    </div>
  )
}

function AutoTextarea({ id, value, onChange }: { id?: string; value: string; onChange: (v: unknown) => void }) {
  return (
    <textarea
      id={id}
      value={value}
      rows={Math.min(8, Math.max(2, Math.ceil(value.length / 52)))}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} resize-y leading-relaxed`}
    />
  )
}

function AssetInput({ id, k, value, onChange }: { id: string; k: string; value: string; onChange: (v: unknown) => void }) {
  const upload = useContext(UploadContext)
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const accept = k === 'resume' ? 'application/pdf' : 'image/*'

  const onFile = async (f?: File) => {
    if (!f || !upload) return
    if (f.size > 5 * 1024 * 1024) {
      setErr('That file is over 5 MB. Compress it first (squoosh.app works well for images).')
      return
    }
    setBusy(true)
    setErr('')
    try {
      onChange(await upload(f))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/file.webp or https://…" className={inputCls} />
        {upload && (
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-sm text-soft transition-colors hover:border-accent/60 hover:text-white disabled:opacity-50"
          >
            <FiUpload /> {busy ? 'Uploading…' : 'Upload'}
          </button>
        )}
        <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {err && <p className="mt-1 text-xs text-red-400">{err}</p>}
    </div>
  )
}

function ObjectField({ k, parent, value, onChange, hideLabel }: { k: string; parent?: string; value: Record<string, unknown>; onChange: (v: unknown) => void; hideLabel?: boolean }) {
  const body = (
    <div className="space-y-4">
      {Object.entries(value).map(([ck, cv]) => (
        <Field key={ck} k={ck} parent={parent ?? k} value={cv} onChange={(v) => onChange({ ...value, [ck]: v })} />
      ))}
    </div>
  )
  if (hideLabel) return body
  return (
    <fieldset className="rounded-xl border border-line/70 p-4">
      <legend className="px-1.5 font-mono text-[11px] tracking-wider text-mute uppercase">{labelFor(k)}</legend>
      {body}
    </fieldset>
  )
}

// ── lists ───────────────────────────────────────────────────

function ListField({ k, value, onChange }: { k: string; value: unknown[]; onChange: (v: unknown) => void }) {
  const isObjects = value.length ? typeof value[0] === 'object' : typeof TEMPLATES[k] === 'object'
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const set = (i: number, v: unknown) => onChange(value.map((x, j) => (j === i ? v : x)))
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i))
  const add = () => {
    onChange([...value, newItem(value, k)])
    setOpenIdx(value.length)
  }
  const shift = (i: number, d: -1 | 1) => {
    onChange(move(value, i, i + d))
    if (openIdx === i) setOpenIdx(i + d)
  }

  return (
    <div>
      <Label k={k} />
      <div className={isObjects ? 'space-y-2' : 'space-y-1.5'}>
        {value.map((item, i) =>
          isObjects ? (
            <ItemCard
              key={i}
              k={k}
              item={item as Record<string, unknown>}
              index={i}
              count={value.length}
              open={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              onChange={(v) => set(i, v)}
              onShift={(d) => shift(i, d)}
              onRemove={() => remove(i)}
            />
          ) : (
            <div key={i} className="flex items-start gap-1">
              <div className="min-w-0 flex-1">
                {LONG_LIST_ITEMS.has(k) ? (
                  <AutoTextarea value={String(item)} onChange={(v) => set(i, v)} />
                ) : (
                  <input value={String(item)} onChange={(e) => set(i, e.target.value)} className={inputCls} />
                )}
              </div>
              <RowControls index={i} count={value.length} onShift={(d) => shift(i, d)} onRemove={() => remove(i)} />
            </div>
          ),
        )}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-1.5 text-xs text-mute transition-colors hover:border-accent/60 hover:text-accent"
      >
        <FiPlus /> Add {singular(k)}
      </button>
    </div>
  )
}

function singular(k: string) {
  const m: Record<string, string> = { skills: 'skill group', items: 'skill', now: 'card', experience: 'entry', marquee: 'item', stack: 'tech', roles: 'role' }
  return m[k] ?? k.replace(/ies$/, 'y').replace(/s$/, '')
}

function RowControls({ index, count, onShift, onRemove }: { index: number; count: number; onShift: (d: -1 | 1) => void; onRemove: () => void }) {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="flex items-center pt-1">
      <button type="button" className={iconBtn} disabled={index === 0} onClick={() => onShift(-1)} aria-label="Move up">
        <FiArrowUp />
      </button>
      <button type="button" className={iconBtn} disabled={index === count - 1} onClick={() => onShift(1)} aria-label="Move down">
        <FiArrowDown />
      </button>
      {confirm ? (
        <button type="button" onClick={onRemove} onBlur={() => setConfirm(false)} autoFocus className="ml-0.5 rounded-md bg-red-500/15 px-2 py-1 text-xs text-red-300">
          Delete?
        </button>
      ) : (
        <button type="button" className={`${iconBtn} hover:text-red-400`} onClick={() => setConfirm(true)} aria-label="Delete">
          <FiTrash2 />
        </button>
      )}
    </div>
  )
}

function ItemCard(props: {
  k: string
  item: Record<string, unknown>
  index: number
  count: number
  open: boolean
  onToggle: () => void
  onChange: (v: unknown) => void
  onShift: (d: -1 | 1) => void
  onRemove: () => void
}) {
  const { k, item, index, count, open, onToggle, onChange, onShift, onRemove } = props
  const summaryKey = SUMMARY_KEYS.find((s) => typeof item[s] === 'string' && item[s])
  const summary = summaryKey ? String(item[summaryKey]) : `New ${singular(k)}`
  return (
    <div className={`rounded-xl border transition-colors ${open ? 'border-accent/40 bg-white/[0.02]' : 'border-line/70'}`}>
      <div className="flex items-center gap-1 pr-1.5">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left">
          <FiChevronDown className={`shrink-0 text-mute transition-transform ${open ? '' : '-rotate-90'}`} />
          <span className="font-mono text-xs text-mute">{String(index + 1).padStart(2, '0')}</span>
          <span className={`truncate text-sm ${summaryKey ? 'text-white' : 'text-mute italic'}`}>{summary}</span>
        </button>
        <RowControls index={index} count={count} onShift={onShift} onRemove={onRemove} />
      </div>
      {open && (
        <div className="border-t border-line/60 p-3.5">
          <Field k={k} parent={k} value={item} onChange={onChange} hideLabel />
        </div>
      )}
    </div>
  )
}
