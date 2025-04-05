type CloudflareContext = {
  env: CloudflareEnv;
  ctx: ExecutionContext;
  cf: IncomingRequestCfProperties;
};

export function getCloudflareEnv(): CloudflareEnv | undefined {
  return (
    (globalThis as any)[Symbol.for("__cloudflare-context__")] as
      | CloudflareContext
      | undefined
  )?.env;
}
