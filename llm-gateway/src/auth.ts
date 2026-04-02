export function authorizeRequest(
  authHeader: string | undefined,
  expectedSecret: string
): boolean {
  if (!expectedSecret) return false;
  const prefix = "Bearer ";
  if (!authHeader?.startsWith(prefix)) return false;
  const token = authHeader.slice(prefix.length).trim();
  return token === expectedSecret;
}
