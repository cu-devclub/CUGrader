import '@/lib/env-config';
import { mockClient } from './mock';
import { client } from './client';

export const api = process.env.USE_MOCK_API ? mockClient : client;

