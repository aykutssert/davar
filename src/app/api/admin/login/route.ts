import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

const loginRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "5 m"),
  prefix: "admin_login",
});

export async function POST(request: NextRequest) {
  // Rate limit kontrolü - IP bazlı
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";

  const { success, reset } = await loginRatelimit.limit(ip);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin." },
      {
        status: 429,
        headers: { "Retry-After": retryAfter.toString() },
      }
    );
  }

  // Şifre kontrolü
  const { password } = await request.json();
  const pw = password || "";

  try {
    const a = Buffer.from(pw);
    const b = Buffer.from(ADMIN_PASSWORD);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Şifre yanlış." }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Şifre yanlış." }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
