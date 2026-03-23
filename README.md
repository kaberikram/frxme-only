# FRXME Only

Standalone FRXME web experience extracted from `shxft-studio`.

**Repository:** https://github.com/kaberikram/frxme-only (public)

---

## Instructions for setup and deployment

### 1. Prerequisites

- **Git** — to clone the repository  
- **Node.js** — use the current **LTS** version (e.g. 20.x or 22.x). Check with `node -v`.  
- **npm** — comes with Node (`npm -v`)

### 2. Get the code

```bash
git clone https://github.com/kaberikram/frxme-only.git
cd frxme-only
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run locally (development)

Starts a dev server (default in this project: port **3000**).

```bash
npm run dev
```

Open **http://localhost:3000** in a browser.

### 5. Production build

Creates optimized static files in the `dist/` folder.

```bash
npm run build
```

To preview the production build on your machine:

```bash
npm run preview
```

### 6. Deploy to the company domain

This is a **static site** after build. Typical steps:

1. Run `npm run build` in a clean checkout (or in CI).
2. Deploy the contents of **`dist/`** to your hosting (S3 + CloudFront, Netlify, Vercel, nginx, etc.).
3. Point the company DNS / load balancer at that hosting.
4. If the app is served from a **subpath** (not the domain root), set Vite’s `base` option in `vite.config.ts` to that path (e.g. `/frxme/`) and rebuild. For the site root (`https://example.com/`), no change is needed.

---

## Quick reference

| Task        | Command        |
|------------|----------------|
| Dev server | `npm run dev`  |
| Build      | `npm run build`|
| Preview build | `npm run preview` |
