import { createClient } from "./client";
import { createMockClient } from "./mock";
import type { APIClient } from "./type";

const mock = process.env.NEXT_PUBLIC_USE_MOCK_API!.toLowerCase() === "true";
export let api = {} as unknown as APIClient;

(async () => {
  api = mock ? await createMockClient() : createClient();
})();
