# Feature Structure

## When to create a feature

Create `src/features/{feature-name}/` when adding a page-level or route-level unit of UI + logic.

## Layout

```
src/features/{feature-name}/
├── index.tsx           # Main export (page or section)
├── components/         # Feature-scoped UI
├── hooks/              # Feature-scoped hooks (optional)
└── sections/           # Page sections (optional, for larger pages)
```

## Rules

- Route files in `src/app/` stay **thin** — import and render the feature.
- Feature folder names: **kebab-case** (`product-detail`, `checkout`).
- Default export from `index.tsx`: PascalCase component name.

## Example route

```tsx
import HomePage from '@/features/home';

export default function Page() {
  return <HomePage />;
}
```
