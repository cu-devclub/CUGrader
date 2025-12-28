import { createClient } from "./client";
import { createMockClient } from "./mock";

const mock =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// This gonna got tree-shaked anyway
// FIXME: shut the bundler up
export const api = mock ? await createMockClient() : createClient();
