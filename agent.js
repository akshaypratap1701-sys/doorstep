// Serverless endpoint that lets Doorstep talk to Claude when it runs outside claude.ai.
// Set ANTHROPIC_API_KEY in your Vercel project settings to switch on live AI.
// Without a key it answers 501 and the app falls back to its scripted demo replies.

const hits = new Map(); // best-effort per-instance rate limit
const LIMIT = 60;       // requests per IP per 10 minutes
const WINDOW = 10 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(501).json({ error: "live_ai_not_configured" });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW);
  if (recent.length >= LIMIT) return res.status(429).json({ error: "rate_limited" });
  recent.push(now); hits.set(ip, recent);

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const prompt = body.prompt;
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 30000) {
    return res.status(400).json({ error: "bad_prompt" });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: "upstream_error" });
    const text = (data.content || []).map(c => c.text || "").join("").trim();
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: "upstream_error" });
  }
}
