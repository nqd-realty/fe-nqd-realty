# Technology Stack

**Analysis Date:** 2026-07-15

## Languages

**Primary:**
- TypeScript 5.x - All source code in `app/` directory
- JavaScript ES2017+ - Three.js 3D modules in `g4/walkthrough/js/` and `public/project/under-construction/g4/js/`

**Secondary:**
- CSS (via Tailwind CSS) - Styling throughout the application

## Runtime

**Environment:**
- Node.js (via Next.js server runtime)
- Browser (React client-side rendering)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present (version 226858 bytes)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with server-side rendering, file-based routing in `app/` directory
- React 19.2.3 - UI component framework
- React DOM 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework configured in `postcss.config.mjs`
- @tailwindcss/postcss 4.x - PostCSS plugin for Tailwind

**3D Graphics:**
- Three.js - 3D rendering library (imported in `g4/walkthrough/js/main.js` and related modules)

## Key Dependencies

**Core Rendering:**
- next 16.1.6 - React meta-framework with server/client capabilities
- react 19.2.3 - UI library
- react-dom 19.2.3 - DOM binding for React

**Styling & CSS Processing:**
- tailwindcss 4.x - CSS utility framework
- @tailwindcss/postcss 4.x - PostCSS integration
- postcss - CSS transformation tool (referenced in `postcss.config.mjs`)

**Type Support:**
- typescript 5.x - TypeScript compiler and language support
- @types/react 19.x - React type definitions
- @types/react-dom 19.x - React DOM type definitions
- @types/node 20.x - Node.js type definitions

**Development & Quality:**
- eslint 9.x - JavaScript/TypeScript linter
- eslint-config-next 16.1.6 - Next.js ESLint configuration (extends next/core-web-vitals and next/typescript)

## Configuration Files

**Build & Development:**
- `next.config.ts` - Next.js configuration with custom rewrites for `/project/under-construction/g4` path
- `tsconfig.json` - TypeScript compiler options (ES2017 target, bundler module resolution, path aliases with `@/*`)
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS plugin
- `eslint.config.mjs` - ESLint configuration using flat config format

**Environment:**
- `.gitignore` present - Standard Node.js/Next.js ignore patterns

## Platform Requirements

**Development:**
- Node.js runtime (version not specified in package.json, follows Next.js 16 requirements)
- npm package manager
- Modern browser with ES2017+ support

**Build Process:**
```bash
npm run dev        # Next.js development server
npm run build      # Next.js production build
npm start          # Next.js production server
npm run lint       # ESLint validation
```

**Production:**
- Supports deployment on Vercel (default Next.js platform) or any Node.js hosting
- Serverless-ready with Next.js default configuration

## Special Notes

**Compiler Settings:**
- Target: ES2017 (`tsconfig.json`)
- Module: ESNext with bundler resolution
- Strict mode enabled (strict: true)
- Path alias `@/*` maps to project root for clean imports
- JSX: React 17+ automatic runtime (jsx: react-jsx)

**Font Loading:**
- Google Fonts integration via `next/font/google` in `app/layout.tsx`
- Uses Playfair Display and Montserrat fonts with font-swapping
- Fonts optimized and loaded at build time by Next.js

**3D Project Integration:**
- Separate Three.js project in `g4/walkthrough/js/`
- Mirrored in `public/project/under-construction/g4/js/`
- Not integrated into main Next.js app, served as static assets

---

*Stack analysis: 2026-07-15*
