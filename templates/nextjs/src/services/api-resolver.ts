import type { AxiosError } from 'axios';
import type { ApiError } from '@/lib/types';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export async function apiResolver<T>(request: () => Promise<{ data: T }>): Promise<T> {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    const message = axiosError.response?.data?.message ?? axiosError.message ?? 'Request failed';
    const code = axiosError.response?.data?.code ?? 'UNKNOWN_ERROR';
    throw new ApiRequestError(message, code, axiosError.response?.status);
  }
}
