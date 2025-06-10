import { parse, stringify } from "devalue";
import { api, useMockServer, type MockRPCCommand } from "./mock";
import { APIClient } from "./type";

export function createMockClient(): APIClient {
  if (useMockServer) {
    return createServerBackedMockClient();
  } else {
    return createClientOnlyMockClient();
  }
}

function createClientOnlyMockClient(): APIClient {
  return api;
}

function createServerBackedMockClient() {
  async function onCall(path: string, ...params: any[]) {
    const command: MockRPCCommand = {
      command: path as any,
      params
    };

    const response = await fetch((process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000") + "/api/dev", {
      method: "POST",
      body: stringify(command as any)
    });

    return parse(await response.text());
  }

  return createPathTracker(onCall);
}

// low cost trpc lmao
function createPathTracker(onCall: (path: string, ...params: any[]) => any): any {
  return new Proxy((...params: any[]) => onCall("", ...params), {
    get(target, p) {
      if (typeof p === "symbol") {
        throw new Error("unsupport");
      }

      return createPathTracker((path, ...params) => {
        return onCall(path === "" ? p : `${p}.${path}`, ...params);
      });
    },
  });
}
