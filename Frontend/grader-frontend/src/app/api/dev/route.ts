import { dispatch, MockRPCCommand } from "@/lib/api/mock";
import { parse, stringify } from "devalue";

export async function POST(request: Request) {
  const text = await request.text();
  const command = parse(text) as MockRPCCommand; // well well well

  // console.log({ command });

  const value = await dispatch(command);
  return new Response(stringify(value));
}

