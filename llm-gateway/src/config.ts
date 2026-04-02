export function loadConfig() {
  const port = Number(process.env.PORT ?? "8787");
  const lmStudioUrl =
    process.env.LM_STUDIO_URL ?? "http://127.0.0.1:1234/v1/chat/completions";
  const gatewaySecret = process.env.GATEWAY_SECRET ?? "";

  if (!gatewaySecret) {
    console.warn("GATEWAY_SECRET is empty — refusing requests in production");
  }

  return { port, lmStudioUrl, gatewaySecret };
}
