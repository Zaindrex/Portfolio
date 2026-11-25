// Where the studio reads and publishes content.
// Change these if your repo or branch name is different.
export const STUDIO_CONFIG = {
  owner: 'Zaindrex',
  repo: 'Portfolio',
  branch: 'main',
  /** The content file inside the repo. */
  contentPath: 'src/data/content.json',
  /** Uploaded images go here (served from /uploads/... on the site). */
  uploadDir: 'public/uploads',
}

export const repoUrl = `https://github.com/${STUDIO_CONFIG.owner}/${STUDIO_CONFIG.repo}`
