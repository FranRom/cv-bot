import { describe, it, expect, beforeEach } from "vitest";
import { RateLimiter } from "../../server/rate-limiter";
import type { RateLimitConfig } from "../../src/lib/types";

const config: RateLimitConfig = {
  maxMessagesPerSession: 3,
  maxSessionsPerDay: 2,
  cooldownMessage: "Rate limited. Try again later.",
};

describe("RateLimiter", () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter(config);
  });

  it("allows requests under session limit", async () => {
    const result = await rateLimiter.check("192.168.1.1");
    expect(result).toEqual({ allowed: true });
  });

  it("blocks over session limit", async () => {
    await rateLimiter.check("192.168.1.1");
    await rateLimiter.check("192.168.1.1");
    await rateLimiter.check("192.168.1.1");
    const result = await rateLimiter.check("192.168.1.1");
    expect(result).toEqual({ allowed: false, message: "Rate limited. Try again later." });
  });

  it("tracks IPs independently", async () => {
    await rateLimiter.check("192.168.1.1");
    await rateLimiter.check("192.168.1.1");
    await rateLimiter.check("192.168.1.1");
    const result = await rateLimiter.check("192.168.1.2");
    expect(result).toEqual({ allowed: true });
  });

  it("blocks when daily session cap reached", async () => {
    await rateLimiter.check("192.168.1.1");
    await rateLimiter.check("192.168.1.2");
    const result = await rateLimiter.check("192.168.1.3");
    expect(result).toEqual({ allowed: false, message: "Rate limited. Try again later." });
  });
});
