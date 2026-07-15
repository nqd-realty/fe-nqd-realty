# Coding Conventions

**Analysis Date:** 2026-07-15

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `layout.tsx`, `page.tsx`)
- Configuration files: camelCase with `.mjs`/`.ts` extension (e.g., `postcss.config.mjs`, `eslint.config.mjs`)
- CSS files: kebab-case (e.g., `globals.css`)

**Functions:**
- React components: PascalCase (e.g., `RootLayout`, `Home`)
- Regular functions: camelCase (e.g., `getYear()`)
- Avoid extracting functions currently—code is primarily JSX markup

**Variables:**
- Constants and variables: camelCase (e.g., `playfair`, `montserrat`, `metadata`)
- CSS variable names: kebab-case (e.g., `--font-playfair`, `--font-montserrat`, `--color-background`)
- Event handlers: camelCase prefixed with `handle` or descriptive name (e.g., in className hover states)

**Types:**
- TypeScript interfaces/types: PascalCase (e.g., `Metadata`, `Readonly`, `NextConfig`)
- Generic type parameters: PascalCase single letters (e.g., `T`)
- Imported types: Qualified imports from `next` (e.g., `type { Metadata } from "next"`)

## Code Style

**Formatting:**
- 2-space indentation (consistent throughout JSX and config files)
- Line length: No enforced limit observed, but markup is broken into logical lines
- Trailing commas: Used in multi-line objects/arrays
- Quotes: Double quotes for HTML attributes and strings

**Linting:**
- ESLint is configured via `eslint.config.mjs`
- Uses `eslint-config-next/core-web-vitals` for Next.js web vitals rules
- Uses `eslint-config-next/typescript` for TypeScript rule support
- Run command: `npm run lint` (executes `eslint`)
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

## Import Organization

**Order:**
1. Next.js framework imports (`import type { Metadata } from "next"`)
2. Next.js components (`import Image from "next/image"`)
3. Third-party packages (e.g., Google Fonts `from "next/font/google"`)
4. Local CSS/styling (`import "./globals.css"`)

**Path Aliases:**
- Configured in `tsconfig.json`: `@/*` → `./`
- Not currently used in codebase but available for future use
- When used, follow import pattern: `import { component } from "@/components/..."`

**Style:**
- Use `type { ... } from "module"` for type-only imports
- Group related imports together
- Separate external and local imports with blank lines

## Error Handling

**Patterns:**
- No explicit error handling currently in place—component is display-only
- When adding error handling, use try-catch for async operations
- Provide fallback values for dynamic data (e.g., `new Date().getFullYear()` with default)
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe property access when needed

## Logging

**Framework:** `console` (built-in browser API)

**Patterns:**
- No logging observed in current codebase
- When adding logging, use `console.log()` for info, `console.error()` for errors
- Avoid logging in components during render (use useEffect for side effects)
- For server-side logging, use Node.js console or external logging service

## Comments

**When to Comment:**
- Add comments for non-obvious JSX sections (e.g., `{/* Navigation Bar */}`, `{/* Main Content */}`)
- Explain complex logic or workarounds
- Document why code does something, not what it does (code should be self-documenting)
- Avoid obvious comments like `// increment count`

**JSDoc/TSDoc:**
- Used for exported functions and components
- Example from codebase: `Readonly<{ children: React.ReactNode }>`
- Provide type annotations instead of JSDoc comments for function parameters when using TypeScript

## Function Design

**Size:**
- Keep functions small and focused
- Avoid deeply nested JSX (extract to variables or separate components)
- Current codebase has large single components; refactor complex sections into smaller components

**Parameters:**
- Use destructuring for object parameters: `({ children }: { children: React.ReactNode })`
- Limit parameters to 3 or fewer; use object parameter for multiple options
- Always type parameters with TypeScript

**Return Values:**
- Components return JSX.Element or React.ReactNode
- Explicitly type return values for functions
- Avoid implicit any return types

## Module Design

**Exports:**
- Default export for Next.js page and layout components (e.g., `export default function RootLayout()`)
- Named exports for utilities and helper functions
- Export types with `export type { MyType }`

**Barrel Files:**
- Not currently used in project
- If needed, create `index.ts` files to re-export from directory (e.g., `export { Component1 } from "./component1"`)

## Styling

**Approach:** Tailwind CSS v4 exclusively

**Patterns:**
- Use Tailwind utility classes for all styling: `className="px-6 py-4 rounded-lg"`
- Use arbitrary values for custom colors: `className="bg-[#1e3a5f] text-[#d4af37]"`
- Group related classes by category: layout, sizing, colors, effects
- Use responsive prefixes: `lg:text-5xl`, `sm:flex-row`
- Define CSS variables in `globals.css` for reusable values
- Example: `--font-playfair`, `--color-background`

**CSS Variables:**
- Define root variables in `globals.css`: `--background`, `--foreground`, `--font-playfair`
- Reference in Tailwind theme: `@theme inline { --color-background: var(--background); }`
- Use in className: `className="bg-[var(--color-background)]"`

## TypeScript

**Configuration:**
- Target: ES2017
- Strict mode enabled (`"strict": true`)
- Module resolution: bundler
- JSX transform: react-jsx (React 19 automatic JSX)
- Isolated modules enabled

**Practices:**
- Always use `type` keyword for type-only imports: `import type { Metadata }`
- Use `Readonly<>` for immutable types: `Readonly<{ children: React.ReactNode }>`
- Prefer specific types over `any`
- Use union types for multiple possible values
- Document complex type structures with comments

---

*Convention analysis: 2026-07-15*
