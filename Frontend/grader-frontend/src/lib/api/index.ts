import { createClient } from './client';
import { createMockClient } from './mock-client';

const mock = process.env.NEXT_PUBLIC_USE_MOCK_API!.toLowerCase() === "true";
export const api = mock ? createMockClient() : createClient();

