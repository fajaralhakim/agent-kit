import axios from 'axios';
import { env } from '@/env';

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL || env.NEXT_PUBLIC_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
