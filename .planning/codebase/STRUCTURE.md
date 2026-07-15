# Codebase Structure

**Analysis Date:** 2026-07-15

## Directory Layout

```
fe-nqd-realty/
├── app/                    # Next.js App Router directory - main application code
│   ├── layout.tsx          # Root layout component with metadata and fonts
│   ├── page.tsx            # Main landing page (route: /)
│   ├── globals.css         # Global styles with Tailwind imports and theme
│   └── favicon.ico         # Favicon for browser tabs
├── public/                 # Static assets served directly by Next.js
│   ├── logo.jpg            # NQD Realty logo (displayed in navigation)
│   ├── project/            # Project showcase files
│   │   └── under-construction/
│   │       └── g4/         # 3D building visualization (HTML/JS)
│   ├── shared/             # Shared JavaScript utilities
│   │   └── js/
│   │       └── avatar.js
│   └── *.svg               # Icon/brand SVG files
├── .next/                  # Next.js build output (generated)
├── .planning/              # GSD planning documents
│   └── codebase/           # Architecture and structure analysis
├── node_modules/           # npm dependencies
├── .git/                   # Git repository
├── package.json            # npm dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration with rewrites
├── eslint.config.mjs       # ESLint configuration
└── README.md               # Project documentation (if present)
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router source directory - contains all application pages and layouts
- Contains: Page components, layout wrappers, and global styles
- Key files: `layout.tsx` (root), `page.tsx` (landing page), `globals.css` (theme)
- Special: Only contains the root page - no nested routes

**public/:**
- Purpose: Static assets served directly without processing
- Contains: Images, SVG icons, and standalone HTML/JavaScript files
- Key files: `logo.jpg` (branding), project files (under-construction/g4/)
- Special: Generated on build, not processed by Next.js bundler

**.next/:**
- Purpose: Next.js build output and cache
- Generated: Yes (automatically by `npm run build`)
- Committed: No (included in .gitignore)

**.planning/codebase/:**
- Purpose: GSD mapping documents for architecture analysis
- Contains: ARCHITECTURE.md, STRUCTURE.md, and other analysis documents
- Generated: No (manually written)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout component - initializes HTML document, loads fonts, applies global styles
- `app/page.tsx`: Main application entry point - renders complete landing page for root route (/)

**Configuration:**
- `package.json`: Project metadata, dependency list, and npm scripts
- `tsconfig.json`: TypeScript compiler options and path aliases
- `next.config.ts`: Next.js configuration including URL rewrites
- `eslint.config.mjs`: ESLint rules for code quality

**Core Logic:**
- `app/page.tsx`: All business logic and UI rendering (single 237-line component)
- `app/layout.tsx`: Metadata setup and font loading (38-line component)

**Styling:**
- `app/globals.css`: Global theme variables and Tailwind CSS imports
- Inline styles: Tailwind utility classes in component className attributes

**Testing:**
- No test files present - no automated testing infrastructure

**Static Assets:**
- `public/logo.jpg`: NQD Realty brand logo
- `public/project/under-construction/g4/`: Interactive 3D building visualization

## Naming Conventions

**Files:**
- TypeScript React components: `[PascalCase].tsx` (e.g., `layout.tsx`, `page.tsx`)
- Global styles: `globals.css` (lowercase with .css extension)
- Configuration files: Named by framework (next.config.ts, tsconfig.json, eslint.config.mjs)
- Static assets: `[lowercase].jpg`, `[lowercase].svg`

**Directories:**
- App Router directories: `app/` (required by Next.js)
- Public assets: `public/` (required by Next.js)
- Feature grouping: Use lowercase with hyphens for organization (e.g., `under-construction`, `shared`)

**Components:**
- Exported default components in TypeScript: Export as `export default function ComponentName() {}`
- All components use arrow functions or function declarations
- Component names use PascalCase (e.g., `RootLayout`, `Home`)

**Classes and Styling:**
- Tailwind utility classes: Use standard Tailwind naming (text-sm, bg-white, grid-cols-2, etc.)
- Custom colors: Use hex codes in className (e.g., `text-[#1e3a5f]`, `bg-[#d4af37]`)
- Responsive modifiers: Prefix with breakpoint (sm:, lg:, xl:)

## Where to Add New Code

**New Feature (Landing Page Sections):**
- Primary code: `app/page.tsx` (add new JSX sections)
- Styling: Add Tailwind classes inline or extract to component
- Assets: Place images/logos in `public/`
- Example: To add a testimonials section, add new JSX markup in `app/page.tsx` with Tailwind styles

**New Component/Module:**
- Implementation: Create `.tsx` file in `app/` directory
- Style: Use Tailwind classes in component
- Export: Use `export default function` or `export const`
- Example: To extract a reusable service card, create `app/ServiceCard.tsx` and import in `page.tsx`

**Utilities/Helpers:**
- Shared helpers: No utilities directory currently exists - add as needed in new `lib/` directory
- Shared functions: Could be placed in `app/utils.ts` or extracted to separate `lib/utils.ts` file
- Example: If adding shared date formatting, create `lib/utils.ts`

**Static Assets:**
- Images: Place in `public/` directory
- Project files: Use subdirectories like `public/project/` for organization
- SVGs: Embed directly in components or place in `public/` if reused

**Tests:**
- Test files: Currently no test infrastructure
- To add tests: Create `__tests__/` or `*.test.tsx` files
- Config: Set up Jest or Vitest in `package.json` with appropriate config file

## Special Directories

**app/:**
- Purpose: Next.js App Router source directory for all routes
- Generated: No
- Committed: Yes
- Contains all application components and layout

**.next/:**
- Purpose: Build output and Next.js cache
- Generated: Yes (by `npm run build` or `npm run dev`)
- Committed: No (.gitignore)
- Safe to delete - regenerates on build

**node_modules/:**
- Purpose: npm package dependencies
- Generated: Yes (by `npm install`)
- Committed: No (.gitignore)
- Safe to delete - regenerates from package-lock.json

**public/:**
- Purpose: Static assets accessible at `/` URL root
- Generated: No
- Committed: Yes
- Example: `public/logo.jpg` accessible at `/logo.jpg`

**.planning/codebase/:**
- Purpose: GSD architecture analysis documents
- Generated: No (manually by codebase mapping agent)
- Committed: Yes (for team reference)
- Contains: ARCHITECTURE.md, STRUCTURE.md, and related analysis files

## Import Path Aliases

**Configured Aliases (tsconfig.json):**
- `@/*`: Resolves to project root
- Example: `import { something } from "@/lib/utils"` resolves to `./lib/utils`

**Current Usage:**
- Not actively used in codebase (all imports use relative paths)
- Available for future use when adding utilities or shared code

## Build and Dev Directories

**Source Files:**
- Location: `app/`
- TypeScript enabled: Yes
- Module format: ESModules (via Next.js)

**Build Output:**
- Location: `.next/` (standalone mode)
- Size: Generated on build, typically 50-200MB
- Include in git: No (add to .gitignore)

---

*Structure analysis: 2026-07-15*
