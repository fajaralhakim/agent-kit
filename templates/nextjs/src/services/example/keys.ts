export const EXAMPLE_KEYS = {
  all: ['example'] as const,
  list: () => [...EXAMPLE_KEYS.all, 'list'] as const,
};
