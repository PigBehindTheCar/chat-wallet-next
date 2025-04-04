type CloudflareContext = {
  env: CloudflareEnv;
  ctx: ExecutionContext;
  cf: IncomingRequestCfProperties;
};

export function getCloudflareEnv(): Record<string, any> | undefined {
  return (
    (globalThis as any)[Symbol.for("__cloudflare-context__")] as
      | CloudflareContext
      | undefined
  )?.env;
}
