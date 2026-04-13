import type { RateLimitConfig } from "../src/lib/types";

/**
 * In-memory rate limiter for the chat API.
 *
 * Known limitation: state resets on cold starts. Vercel Edge Functions are
 * ephemeral — each instance gets a fresh Map/Set, so counters reset when
 * the instance is evicted (~5-10 min of inactivity). This means the "daily"
 * session cap isn't truly per day, it's per instance lifetime.
 *
 * For a personal portfolio project with low traffic this is acceptable.
 * For production use, replace with a persistent store like Vercel KV or
 * Upstash Redis to survive cold starts and share state across instances.
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private sessionCounts: Map<string, number>;
  private dailySessions: Set<string>;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.sessionCounts = new Map<string, number>();
    this.dailySessions = new Set<string>();
  }

  async check(ip: string): Promise<{ allowed: boolean; message?: string }> {
    if (!this.dailySessions.has(ip) && this.dailySessions.size >= this.config.maxSessionsPerDay) {
      return { allowed: false, message: this.config.cooldownMessage };
    }

    const count = this.sessionCounts.get(ip) ?? 0;
    if (count >= this.config.maxMessagesPerSession) {
      return { allowed: false, message: this.config.cooldownMessage };
    }

    this.dailySessions.add(ip);
    this.sessionCounts.set(ip, count + 1);
    return { allowed: true };
  }
}
