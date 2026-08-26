# Talha Qureshi — Developer Portfolio

A production-grade, single-page portfolio for an AI Systems Engineer & Full-Stack Architect.

## Stack
- **Next.js 15** (App Router) · React 19 · TypeScript
- **Tailwind CSS** + vanilla CSS variables (radial meshes, noise, keyframes)
- **Framer Motion** — scroll reveals, stagger, magnetic buttons, spring physics
- **Lenis** — normalized momentum scrolling
- **Three.js + React Three Fiber + drei** — interactive particle node field (lazy-loaded)
- **Lucide** icons

## Sections
Glassmorphic nav (terminal mode toggle) → 3D hero with operator portrait →
bento skills grid (live ML pipeline, throughput, Lighthouse switcher, k8s board) →
case studies with animated architecture diagrams → architecture playground
(live capacity simulator) → experience timeline → dual-mode contact (form + CLI
terminal) → footer with live PKT clock.

## Commands
```bash
npm run dev     # develop at localhost:3000
npm run build   # production build
npm run start   # serve production build
```

## Customization
- All copy lives in `lib/data.ts` (projects, timeline, skills, socials).
- Replace `public/profile.png` to swap the portrait.
- `public/Resume.pdf` is your real resume — re-export from Overleaf
  and overwrite this file to update it (Overleaf read-links cannot be
  fetched programmatically; their PDF endpoints are session-signed).
- Contact endpoint (`app/api/contact/route.ts`) validates + logs — wire in
  Resend/SendGrid or a database when deploying.
