import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "demire:visitor_count";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
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
    return res.status(500).json({ error: "Visitor counter unavailable" });
  }
}
