import { NextRequest } from "next/server";
export const runtime = "edge";
import { getCloudflareEnv } from "@/utils/env";
export async function GET(request: NextRequest) {
  const env = getCloudflareEnv();
  const response = await env?.AI.run("@cf/meta/llama-3.1-8b-instruct", {
    prompt: "What is the origin of the phrase Hello, World",
  });

  return new Response(JSON.stringify(response, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
