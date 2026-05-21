# Naming Conventions (Next.js)

| Layer | Convention | Example |
|-------|------------|---------|
| Route folders | kebab-case | `about-us/`, `product-detail/` |
| Route groups | parentheses, optional | `(marketing)/`, `(app)/` |
| Feature folders | kebab-case | `home/`, `checkout/` |
| Feature entry | `index.tsx`, PascalCase export | `HomePage` |
| Shared/UI folders | kebab-case | `hero-banner/` |
| Component files | PascalCase | `HeroBanner.tsx` |
| Service domains | kebab-case | `products/`, `users/` |
| Query keys | SCREAMING_SNAKE | `PRODUCT_KEYS` |
| Path alias | `@/*` → `src/*` | `@/features/home` |
