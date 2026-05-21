import { useQuery } from '@tanstack/react-query';
import { apiResolver } from '@/services/api-resolver';
import { api } from '@/services/axios-config';
import { EXAMPLE_KEYS } from '../keys';
import type { ExampleItem } from '../types/example';

export async function getExampleList(): Promise<ExampleItem[]> {
  return apiResolver(() => api.get<ExampleItem[]>('/example'));
}

export function useGetExampleList(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: EXAMPLE_KEYS.list(),
    queryFn: getExampleList,
    enabled: options?.enabled ?? false,
  });
}
