import { mockClient } from './mock';
import { client } from './client';

const mock = process.env.NEXT_PUBLIC_USE_MOCK_API!.toLowerCase() === "true";
export const api = mock ? mockClient : client;
