# Architecture

**Analysis Date:** 2026-07-15

## Pattern Overview

**Overall:** Single-page static landing site with Next.js App Router

**Key Characteristics:**
- Simple single-route application (root page only)
- No backend API integration or database
- Static content rendering with React components
- Responsive design using utility-first CSS
- Next.js Image optimization for logo assets

## Layers

**Presentation Layer:**
- Purpose: Render the user interface and handle user interactions
- Location: `app/page.tsx`
- Contains: Main landing page component with navigation, hero section, services grid, and contact information
- Depends on: Next.js Image component, React, Tailwind CSS
- Used by: Browser clients via HTTP

**Layout Layer:**
- Purpose: Provide root HTML structure, metadata, and global styling
- Location: `app/layout.tsx`
- Contains: Root layout component, font imports, metadata configuration, global CSS application
- Depends on: Next.js Metadata API, Google Fonts API
- Used by: All pages (currently just page.tsx)

**Styling Layer:**
- Purpose: Define color scheme, typography, and theme variables
- Location: `app/globals.css`
- Contains: Tailwind CSS import, CSS custom properties for colors and fonts, theme mode support
- Depends on: Tailwind CSS v4
- Used by: All components via className attributes

**Asset Layer:**
- Purpose: Serve static files (images, scripts, icons)
- Location: `public/`
- Contains: Logo images, SVG icons (inline in components), project files, shared JavaScript utilities
- Depends on: Next.js static file serving
- Used by: All pages and components

## Data Flow

**Page Load Flow:**

1. Browser requests `/`
2. Next.js server initializes root layout (`app/layout.tsx`)
3. Layout loads Google Fonts (Playfair Display, Montserrat)
4. Layout imports and applies `globals.css` with Tailwind CSS and theme variables
5. Layout renders root HTML structure with language and metadata
6. Layout renders children (page.tsx)
7. Page component (`app/page.tsx`) renders:
   - Navigation bar with logo (from `public/logo.jpg`) and social media links
   - Main content grid with hero section and services section
   - Footer with copyright information
8. Browser renders fully static HTML with embedded Tailwind styles

**Interactive Flow:**

1. User interacts with navigation links (external social media URLs)
2. User clicks CTA buttons (WhatsApp link or phone call)
3. All interactions are external links or tel: links (no internal state management)
4. No client-side state updates or API calls occur

**State Management:**

- No state management framework used
- Page is fully static with no client-side state
- Current year dynamically calculated for footer: `new Date().getFullYear()`
- All content hardcoded in page component

## Key Abstractions

**Navigation Component (Inline):**
- Purpose: Display top navigation bar with logo and social media links
- Examples: `app/page.tsx` lines 7-68
- Pattern: Inline JSX without component extraction; uses hardcoded links and SVG icons

**Services Grid:**
- Purpose: Display 4 service offerings in a 2x2 responsive grid
- Examples: `app/page.tsx` lines 148-192
- Pattern: Hardcoded service cards with icon SVGs and text; uses Tailwind grid utilities

**Call-to-Action Section:**
- Purpose: Encourage user contact via WhatsApp or phone
- Examples: `app/page.tsx` lines 108-125
- Pattern: Button components styled with Tailwind; external links using `href` and `target="_blank"`

**Hero Section:**
- Purpose: Display main value proposition
- Examples: `app/page.tsx` lines 76-106
- Pattern: Typography hierarchy using serif fonts (Playfair) for headings; gradient text for emphasis

## Entry Points

**Main Application Entry:**
- Location: `app/page.tsx`
- Triggers: HTTP GET request to `/` (root domain)
- Responsibilities: Render complete landing page with all sections (navigation, hero, services, footer)

**Root Layout Entry:**
- Location: `app/layout.tsx`
- Triggers: Every page render (App Router initialization)
- Responsibilities: Set up HTML document structure, import fonts, apply global styles, set metadata

## Error Handling

**Strategy:** No explicit error handling implemented

**Patterns:**
- Application relies on Next.js default error handling
- All external links (social media, WhatsApp) use `target="_blank"` and `rel="noopener noreferrer"` for security
- No error boundaries or error pages defined
- No form validation (no forms in application)

## Cross-Cutting Concerns

**Logging:** Not implemented - no application logging

**Validation:** Not applicable - no user input forms

**Authentication:** Not required - application is public landing page

**Styling Strategy:** Tailwind CSS utility classes with custom theme variables:
- Primary colors: `#1e3a5f` (dark blue), `#2c5282` (lighter blue), `#d4af37` (gold accent), `#25D366` (WhatsApp green)
- Typography: Serif fonts for headings (Playfair Display), sans-serif for body (Montserrat)
- Responsive breakpoints: Mobile-first design with `sm:`, `lg:`, `xl:` prefixes

**Font Strategy:**
- Playfair Display: Premium serif font for headings and branding elements
- Montserrat: Modern sans-serif for body text
- Both imported from Google Fonts API in `app/layout.tsx`
- CSS custom properties enable theme consistency

**Responsive Design:**
- Mobile-first approach with Tailwind breakpoints
- Layout uses `lg:grid-cols-2` to create two-column layout on larger screens
- Navigation and CTA buttons stack vertically on mobile (`flex-col sm:flex-row`)
- All text uses relative sizing (text-sm, text-lg, text-4xl, etc.)

---

*Architecture analysis: 2026-07-15*
