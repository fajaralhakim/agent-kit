# App Types (Reference)

The slim Next.js starter is **app-type neutral**. Adapt structure as needed:

| App type | Typical additions |
|----------|-------------------|
| Marketing / landing | Route group `(marketing)/`, minimal services |
| SaaS product | `(app)/` routes, auth provider, billing service |
| E-commerce | Product/catalog services, cart feature modules |
| Admin dashboard | `(dashboard)/`, sidebar layout, auth middleware — use Phase 2 `nextjs-admin` addon |
| Content / blog | `src/app/[slug]/`, content services |

Route groups are **optional** — add when they clarify routing, not by default.
