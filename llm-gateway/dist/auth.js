export function authorizeRequest(authHeader, expectedSecret) {
    if (!expectedSecret)
        return false;
    const prefix = "Bearer ";
    if (!authHeader?.startsWith(prefix))
        return false;
    const token = authHeader.slice(prefix.length).trim();
    return token === expectedSecret;
}
