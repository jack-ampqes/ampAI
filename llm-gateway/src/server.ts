import http from "node:http";
import { authorizeRequest } from "./auth.js";
import { loadConfig } from "./config.js";
import { forwardToLmStudio } from "./lmstudio.js";
import { rateLimit } from "./rate-limit.js";
import type { ChatRequestBody } from "./types.js";

const { port, lmStudioUrl, gatewaySecret } = loadConfig();

const server = http.createServer(async (req, res) => {
  const clientIp = req.socket.remoteAddress ?? "unknown";

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method !== "POST" || !req.url?.startsWith("/chat")) {
    res.writeHead(404);
    res.end();
    return;
  }

  if (!rateLimit(clientIp)) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too many requests" }));
    return;
  }

  const auth = req.headers.authorization;
  if (!authorizeRequest(auth, gatewaySecret)) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 2_000_000) {
      res.writeHead(413);
      res.end();
      return;
    }
  }

  let body: ChatRequestBody;
  try {
    body = JSON.parse(raw) as ChatRequestBody;
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid JSON" }));
    return;
  }

  if (!body.messages?.length) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "messages required" }));
    return;
  }

  try {
    const data = await forwardToLmStudio(lmStudioUrl, body);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  } catch (e) {
    console.error("[gateway]", e);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Upstream error" }));
  }
});

server.listen(port, () => {
  console.log(`ampAI LLM gateway listening on :${port}`);
});
