# RALUI VALUI — website

TanStack Start + React 19 + Tailwind v4. Deploys to Vercel as-is (no Next.js needed).

## Run it locally

```bash
npm install
npm run dev     # http://localhost:8080
npm run build   # production build
```

Copy `.env.example` to `.env` and set `ADMIN_PASSWORD` to use the admin panel locally.

## Admin panel — `/admin`

Sign in with `ADMIN_PASSWORD`. From there you can:

- **Collection** — add, edit, reorder and delete pieces (shown on the Collections page with a
  category filter and 9-per-page pagination). Star a piece to show it in the home page collection
  panel (the first three starred pieces are used).
- **Quick upload** — drop several photos at once; each becomes a new piece you can then name.
- Every photo (JPEG, PNG, WebP, AVIF, GIF, HEIC from iPhone…) is converted in the browser to WebP,
  resized to at most 2000px and compressed before upload — typically a few hundred KB.
- **Settings** — the WhatsApp number. Once saved, a WhatsApp button appears on every page, each
  piece gets "Enquire on WhatsApp", and Contact-page notes open in WhatsApp. Empty = hidden.

### Where uploads are stored

| Where | Data (`pieces`, settings) | Images |
|---|---|---|
| Local `npm run dev` | `.data/site.json` | `public/uploads/` |
| Vercel | Vercel Blob | Vercel Blob |

Both local folders are git-ignored. Until anything is saved, the site shows the starter pieces in
`public/seed/` (defined in `src/lib/site-data.ts`).

## Deploying on Vercel

1. Import the project in Vercel (framework preset: **Other**; the build auto-detects Vercel).
2. **Storage → Create → Blob**, and connect it to this project. This adds `BLOB_READ_WRITE_TOKEN`.
3. **Settings → Environment Variables**: add `ADMIN_PASSWORD` (a long password, 8+ characters).
4. Redeploy. Visit `/admin` to sign in.

## Where things are

- `src/lib/site-data.ts` — business details (name, address, Instagram), categories, starter pieces
- `src/lib/api.ts` — server functions used by the site and admin
- `src/server/` — storage (local folder / Vercel Blob) and admin sign-in
- `src/lib/optimize-image.ts` — in-browser image conversion & compression
- `src/routes/` — one file per page; `admin.tsx` is the admin panel
- `src/components/site/` — header, footer, WhatsApp button, scroll effects
- `src/styles.css` — design tokens and all styling
- `src/assets/logo-*.png` — logo cut-outs made from `logo.jpeg` (ivory for dark backgrounds, olive for light)
