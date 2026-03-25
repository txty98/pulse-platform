# Pulse RMS

Pulse RMS is a TypeScript monorepo for a modern church relationship management system. This repository is structured to support a growing suite of products:

- a marketing website
- a CHMS web application
- an admin mobile app for church staff
- shared packages for design, UI, and Supabase access

## Workspace layout

```text
apps/
  marketing/      Next.js marketing website
  chms-web/       Next.js church management web app
  admin-mobile/   Expo React Native app for church admins
packages/
  design-system/  Shared tokens, theme values, and brand primitives
  supabase/       Shared Supabase clients and data access helpers
  tsconfig/       Shared TypeScript config presets
  ui/             Shared web UI components with room to expand
```

## Why this shape

- `pnpm` keeps workspace dependency management fast and simple.
- `turbo` gives us a good path for caching, selective builds, and CI scaling.
- `Next.js` works well for both the public marketing site and authenticated web app.
- `Expo` gives the admin mobile app a strong starting point for iOS and Android delivery.
- `Supabase` stays centralized in a shared package so auth and database access patterns stay consistent.
- `design-system` holds the first cross-platform layer, since tokens and brand primitives are easier to share cleanly across Next.js and React Native than DOM-specific components.

## Suggested next steps

1. Install dependencies with `pnpm install`.
2. Add environment files for Supabase keys and URLs.
3. Generate Supabase types and wire them into `packages/supabase`.
4. Choose a component strategy for shared web and mobile primitives as the design system evolves.

## Initial commands

```bash
pnpm install
pnpm dev
pnpm typecheck
```
