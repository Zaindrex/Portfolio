# Md Asif Raza: Portfolio

React + Vite + TypeScript + Tailwind CSS v4. No animation library: the scroll reveals, count-ups, tilt and spotlight effects are small custom hooks and CSS, so the bundle stays light.

## Run locally

```bash
npm install
npm run dev
```

## Edit content

### In the browser (studio)

Open the live site with **`?studio`** at the end, e.g. `https://zaindrex.github.io/Portfolio/?studio`.

1. Paste a GitHub fine-grained token (only this repo, **Contents: Read and write**, 90-day expiry). It is kept in your browser only.
2. Edit any section. The page behind the panel updates live as you type.
3. Upload images or the resume with the **Upload** buttons (they go to `public/uploads/`).
4. Hit **Publish**. The studio commits `src/data/content.json`, the GitHub Action rebuilds, and the site is live in about a minute.

Unpublished changes are autosaved as a draft on that device. If the file changed elsewhere since you opened the studio, publishing stops and asks whether to load the latest or overwrite.

Security: the hidden URL is only a convenience. Anyone can open the panel, but nothing can be saved without a token that GitHub accepts. The studio code is loaded only when `?studio` is in the URL, so normal visitors never download it.

Repo, branch and paths the studio uses are in `src/studio/config.ts`.

### By hand

Everything (bio, stats, skills, projects, experience, links) lives in **`src/data/content.json`**; its shape is described in `src/data/content.ts`. New fields you add to the JSON show up in the studio automatically.

- **Photo / screenshots / resume:** put files in `public/` and reference them as `/file.webp` (no `/public`).
- **LeetCode / HackerRank:** fill in `profile.socials`; empty links are hidden.
- **Contact form:** create a free form at formspree.io and paste its id into `contact.formspreeId`. Until then the form opens the visitor's email app.

## Deploy

**GitHub Pages (zaindrex.github.io/Portfolio):** push to `main`, then in the repo go to **Settings → Pages → Source: GitHub Actions**. `.github/workflows/deploy.yml` builds and deploys on every push, including studio commits.

**Vercel:** import the repo on vercel.com. It rebuilds on every push too, so the studio works the same way.

## Structure

```
src/
  data/content.json       ← all text and links (edited by the studio)
  data/content.ts         ← types for content.json
  data/ContentContext.tsx ← live content state + asset() base-path helper
  studio/                 ← in-browser editor (loaded only with ?studio)
  components/             ← Navbar, Hero, About, Skills, Projects, ProjectVisual, Experience, Contact, Footer
  hooks/useReveal.ts      ← scroll reveal, active-section nav, card spotlight
  index.css               ← theme colours, fonts, keyframes
```
