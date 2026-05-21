# Service Structure

Use when the app calls external HTTP APIs.

## Layout

```
src/services/{domain}/
├── keys.ts                 # React Query key factory
├── query/get-{resource}.ts # fetch fn + useQuery hook
├── mutations/              # optional mutation hooks
└── types/{resource}.ts     # request/response types
```

Shared utilities:

- `src/services/axios-config.ts` — axios instance + interceptors
- `src/services/api-resolver.ts` — error normalization wrapper

## Query key pattern

```ts
export const EXAMPLE_KEYS = {
  all: ['example'] as const,
  list: (params?: object) => [...EXAMPLE_KEYS.all, 'list', params] as const,
};
```

## Hook pattern

```ts
export async function getExampleList() {
  return apiResolver(() => api.get('/example'));
}

export function useGetExampleList(options?) {
  return useQuery({
    queryKey: EXAMPLE_KEYS.list(),
    queryFn: getExampleList,
    ...options,
  });
}
```
