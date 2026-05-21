# Component Structure

## Layers

| Folder | Purpose |
|--------|---------|
| `src/components/ui/` | shadcn/ui primitives — add via `npx shadcn@latest add` |
| `src/components/shared/` | Reusable composites used across features |
| `src/features/{name}/components/` | Feature-specific only |

## Naming

- Folders: **kebab-case** (`hero-banner/`)
- Files: **PascalCase** (`HeroBanner.tsx`)
- Merge Tailwind classes with `cn()` from `@/lib/utils`

## Rules

- Prefer shadcn/ui components before building custom UI.
- Do not put feature-specific components in `shared/`.
