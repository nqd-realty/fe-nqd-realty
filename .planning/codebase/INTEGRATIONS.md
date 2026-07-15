# External Integrations

**Analysis Date:** 2026-07-15

## APIs & External Services

**Social Media Integration:**
- Instagram - Direct link integration at `https://www.instagram.com/nqd.realty/` (referenced in `app/page.tsx`)
- Facebook - Direct link integration at `https://www.facebook.com/nqd.realty` (referenced in `app/page.tsx`)
- YouTube - Direct link integration at `https://www.youtube.com/@nqd.realty` (referenced in `app/page.tsx`)

**Communication Services:**
- WhatsApp API - Integrated via wa.me links (`https://wa.me/917233072330`) for customer contact in `app/page.tsx`
  - Used in multiple CTAs: WhatsApp button and footer contact link
  - No SDK required - web link integration only

**Fonts & Typography:**
- Google Fonts - API integration via Next.js `next/font/google`
  - Playfair Display: Font-face loaded from fonts.googleapis.com (weights: 400, 500, 600, 700, 800)
  - Montserrat: Font-face loaded from fonts.googleapis.com (weights: 300, 400, 500, 600, 700)
  - Implementation: `app/layout.tsx` uses `next/font/google` for optimized font loading

## Data Storage

**Databases:**
- None detected - Application is frontend-only

**File Storage:**
- Local filesystem only - Static assets served from `public/` directory
  - Logo: `public/logo.jpg`
  - SVG assets: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/window.svg`, `public/vercel.svg`
  - 3D assets: `public/project/under-construction/g4/` directory

**Caching:**
- Next.js built-in caching for images via `next/image` (used in `app/page.tsx`)

## Authentication & Identity

**Auth Provider:**
- None - Application is public-facing, no user authentication system
- No login/registration functionality

**Identity:**
- Not applicable

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Browser console logging only (typical Next.js application)
- No external logging service configured

## CI/CD & Deployment

**Hosting:**
- Recommended: Vercel (mentioned in README.md as default platform for Next.js)
- Alternative: Any Node.js hosting (AWS, Heroku, DigitalOcean, etc.)

**CI Pipeline:**
- None detected in codebase (would be configured in GitHub Actions, GitLab CI, or hosting provider)

**Static Generation:**
- Next.js static site generation for `/app/page.tsx` (home page)

## Environment Configuration

**Environment Variables:**
- None detected - Application contains no API keys or secrets
- No `.env` or `.env.local` files required

**Secrets Location:**
- Not applicable - No secrets management needed

## Webhooks & Callbacks

**Incoming:**
- None - Application is client-side only

**Outgoing:**
- WhatsApp Web Link - `https://wa.me/917233072330` (not a webhook, direct user redirect)

## Third-Party Libraries

**Font Loading:**
- `next/font/google` package - Handles Google Fonts optimization and delivery

**Image Optimization:**
- `next/image` - Next.js Image component for optimized image loading (used for logo in `app/page.tsx`)

**3D Graphics:**
- Three.js (imported as `import * as THREE` in `g4/walkthrough/js/main.js`)
  - Note: Not included in main package.json dependencies; assumed to be loaded separately or as part of the g4 project
  - Used for 3D walkthrough visualization in project showcase

## Contact Information Integration

**Direct Links in UI:**
- Phone: `tel:+917233072330` (in `app/page.tsx`)
- WhatsApp: `https://wa.me/917233072330` (in `app/page.tsx`)
- Email: `contact@nqdrealty.com` (displayed in `app/page.tsx`, not linked)

## Notes on Integration Simplicity

- This is a **marketing website** with minimal backend integration
- No API calls to external services
- All integrations are frontend-only (links, fonts, static assets)
- Social media links are direct redirects to official profiles
- WhatsApp integration is web-based chat link, not API integration
- Ideal architecture for static hosting (Vercel, Netlify, etc.)

---

*Integration audit: 2026-07-15*
