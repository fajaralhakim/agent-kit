---
name: nextjs-patterns
description: Guides adding features, services, and components in Next.js App Router projects using the Agent Kit architecture. Use when scaffolding new pages, features, API clients, or extending the Next.js starter structure.
---

# Next.js Patterns

## Add a new page + feature

1. Create `src/features/{kebab-name}/index.tsx`
2. Add thin route: `src/app/{route}/page.tsx` imports the feature
3. Add feature-scoped components under `src/features/{name}/components/`

## Add a service (API client)

1. Create `src/services/{domain}/keys.ts`
2. Add `query/get-*.ts` with fetch fn + `useQuery` hook
3. Add types under `src/services/{domain}/types/`
4. Use `apiResolver` and shared axios config

## shadcn components

Run `npx shadcn@latest add {component}` — components land in `src/components/ui/`.

## App type guidance

See `.agents/app-types.md` for adapting to marketing, SaaS, e-commerce, or admin apps.
