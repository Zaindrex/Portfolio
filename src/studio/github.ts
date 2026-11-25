// Minimal GitHub REST client for the studio. The token never leaves the browser
// except to api.github.com, and GitHub decides whether a write is allowed.
import { STUDIO_CONFIG as cfg } from './config'

const API = 'https://api.github.com'

export class GitHubError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function gh<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  if (!res.ok) {
    let msg = res.statusText
    try {
      msg = ((await res.json()) as { message?: string }).message || msg
    } catch {
      /* not JSON */
    }
    throw new GitHubError(res.status, msg)
  }
  return (await res.json()) as T
}

const repoPath = `/repos/${cfg.owner}/${cfg.repo}`
const filePath = (p: string) => `${repoPath}/contents/${p.split('/').map(encodeURIComponent).join('/')}`

export function bytesToBase64(bytes: Uint8Array) {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}
const textToBase64 = (s: string) => bytesToBase64(new TextEncoder().encode(s))
const base64ToText = (b64: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)))

/** Checks the token and that it can push to the configured repo. */
export async function verifyToken(token: string) {
  const repo = await gh<{ permissions?: { push?: boolean }; full_name: string }>(token, repoPath)
  if (!repo.permissions?.push) {
    throw new GitHubError(403, `This token can read ${repo.full_name} but can't write to it. Give it "Contents: Read and write".`)
  }
  return repo.full_name
}

export async function readContentFile(token: string) {
  const f = await gh<{ content: string; sha: string }>(token, `${filePath(cfg.contentPath)}?ref=${encodeURIComponent(cfg.branch)}`)
  return { text: base64ToText(f.content), sha: f.sha }
}

type PutResult = { content: { sha: string }; commit: { sha: string; html_url: string } }

async function putFile(token: string, path: string, base64: string, message: string, sha?: string) {
  return gh<PutResult>(token, filePath(path), {
    method: 'PUT',
    body: JSON.stringify({ message, content: base64, branch: cfg.branch, ...(sha ? { sha } : {}) }),
  })
}

/** Commits content.json. Pass the sha you loaded so GitHub rejects the write if someone changed it since. */
export async function writeContentFile(token: string, text: string, sha: string, message: string) {
  const r = await putFile(token, cfg.contentPath, textToBase64(text), message, sha)
  return { sha: r.content.sha, commitUrl: r.commit.html_url }
}

/** Fetches only the current sha of content.json (used for "overwrite anyway"). */
export async function currentContentSha(token: string) {
  return (await readContentFile(token)).sha
}

/** Uploads an image to public/uploads and returns the site path (e.g. '/uploads/1700-shot.webp'). */
export async function uploadImage(token: string, file: File) {
  const clean = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
  const name = `${Date.now()}-${clean}`
  const bytes = new Uint8Array(await file.arrayBuffer())
  await putFile(token, `${cfg.uploadDir}/${name}`, bytesToBase64(bytes), `studio: upload ${name}`)
  const publicPrefix = cfg.uploadDir.replace(/^public\/?/, '')
  return `/${publicPrefix ? publicPrefix + '/' : ''}${name}`
}

export const isConflict = (e: unknown) =>
  e instanceof GitHubError && (e.status === 409 || (e.status === 422 && /sha/i.test(e.message)))
