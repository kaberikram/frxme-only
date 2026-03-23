# FRXME Only — boilerplate

This repo is a **starter you can clone**, run locally, and **deploy on your own domain**. It is a static [Vite](https://vitejs.dev/) + [React](https://react.dev/) app (with Three.js / R3F for the FRXME experience). Fork it, rename it, or copy it into your org—whatever fits your workflow.

**Upstream clone URL (example):** `https://github.com/kaberikram/frxme-only.git`

---

## Local development

**Prerequisites:** Git, Node.js **LTS** (`node -v`), npm (`npm -v`).

```bash
git clone <your-repo-url>
cd <repo-folder>
npm install
npm run dev
```

Dev server listens on **port 3000** by default — open `http://localhost:3000`.

## Production build

```bash
npm run build
```

Output goes to **`dist/`**. Preview it locally:

```bash
npm run preview
```

## Deploy on your domain

After `npm run build`, host the **`dist/`** directory on your stack (object storage + CDN, Netlify, Vercel, nginx, etc.) and point DNS at that hosting.

If the site is **not** at the domain root (e.g. `https://example.com/frxme/`), set Vite’s `base` in `vite.config.ts` to that path and rebuild. For `https://example.com/` at the root, leave `base` as default.

---

## Scripts

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Preview build | `npm run preview` |

## Origin

Extracted from `shxft-studio` as a standalone FRXME web experience.
