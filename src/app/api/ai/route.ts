import { NextRequest } from "next/server";
import { getCloudflareEnv } from "@/utils/env";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RequestData {
  messages?: Message[];
}

export async function POST(request: NextRequest) {
  const env = getCloudflareEnv() as any;
  const data = (await request.json()) as RequestData;

  const messages = data.messages;

  const response = await env?.AI.run(
    "@cf/meta/llama-3.1-8b-instruct-fp8-fast",
    {
      messages: messages,
      stream: true,
    }
  );

  return new Response(response, {
    headers: { "content-type": "text/event-stream" },
  });
}
