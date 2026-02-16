# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wakaroo is a mobile-first PWA portal for discovering children's educational apps, organized by age category. It's designed to be launched from LINE rich menus. The UI is entirely in Japanese.

## Commands

```bash
npm run dev    # Start dev server at localhost:3000
npm run build  # Production build
npm run lint   # ESLint (next/core-web-vitals + typescript)
```

No test framework is configured.

## Tech Stack

- **Next.js 16** (App Router) with TypeScript
- **Tailwind CSS v4** (via `@tailwindcss/postcss` plugin)
- **Framer Motion** for animations and swipe gestures
- **Supabase** as sole backend (Postgres DB + Storage)
- **M PLUS Rounded 1c** font (Google Fonts, weights 400/700)
- Path alias: `@/*` → `./src/*`

## Architecture

### Data Flow
- Almost all pages are `'use client'` with `useState` + `useEffect` for client-side data fetching from Supabase
- One exception: `src/app/apps/[slug]/page.tsx` is a Server Component that fetches data and passes to `DetailView`
- No Next.js API routes, Server Actions, or ISR — all DB access goes through `src/lib/supabase.ts` client
- When Supabase is not configured (env vars missing), components fall back to mock data from `src/data/mockData.ts`

### Supabase (`src/lib/supabase.ts`)
Central module containing: singleton client, all TypeScript type definitions (`Post`, `AppRow`, `WorryTag`, etc.), all fetch/write functions, and `transformAppRow()` which converts DB snake_case rows to camelCase `Post` objects. Tables: `apps`, `worry_tags`, `hero_articles`, `top_carousel`. Storage bucket: `app-images` (path: `thumbnails/{appId}.webp`).

### Category System
Five tabs: `top | baby | infant | low | high`. The `top` tab has a unique layout (carousel, menu icons, popular apps, categories, new apps, banners). Other tabs show a hero section + apps grouped by worry tags. Category switching uses Framer Motion spring-physics slide animations.

### Key Flows
- **App posting** (`PostAppModal`): Form → fake "AI review" animation (security check → scoring → radar chart) → actual `createApp()` call → confetti animation
- **Image upload** (`imageProcessor.ts`): Canvas square-crop → WebP compression (800px, 150KB max) → Supabase Storage upload
- **App player** (`/play?url=`): Renders external apps in full-screen iframe

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## Skills / 参照ドキュメント

- **LINE内ブラウザ互換性:** `.ai_docs/line_browser_skills.md` — LINE IAB (WKWebView/WebView) 特有の制約と対策パターン。`100vh`問題、iframe失敗、`position: fixed`+キーボード、スワイプ競合、`autoFocus`回避、`backdrop-filter`フォールバック等。UI変更時は必ず参照すること。

## Conventions

- All UI text is in Japanese
- Components are in `src/components/`, all marked `'use client'`
- PWA configured via `public/manifest.json` (standalone, orange theme #FF6B35)
- Fixed background image (`public/images/bg-main.png`) applied in root layout
- Splash screen gated by `sessionStorage` key `wakaroo_splash_shown`
