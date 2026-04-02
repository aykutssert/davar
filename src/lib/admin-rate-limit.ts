import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const adminRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "admin",
});

export async function checkAdminRateLimit(request: NextRequest) {
  // Admin rate limit devre dışı
  return null;
}
