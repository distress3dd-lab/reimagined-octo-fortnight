import { Redis } from "@upstash/redis";

const KEY = "demire:visitor_count";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    // Create the client inside the handler so configuration errors are caught
    // and returned as a useful diagnostic instead of failing silently.
    const redis = Redis.fromEnv();

    if (req.method === "GET") {
      const count = (await redis.get(KEY)) ?? 0;
      return res.status(200).json({ count: Number(count) });
    }

    if (req.method === "POST") {
      const count = await redis.incr(KEY);
      return res.status(200).json({ count: Number(count) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Visitor counter error:", error);

    // Temporary diagnostics: exposes only the error message, never Redis secrets.
    return res.status(500).json({
      error: "Visitor counter unavailable",
      details: error instanceof Error ? error.message : String(error),
      hasRedisUrl: Boolean(process.env.UPSTASH_REDIS_REST_URL),
      hasRedisToken: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)
    });
  }
}
