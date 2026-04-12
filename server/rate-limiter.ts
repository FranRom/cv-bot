import type { RateLimitConfig } from "../src/lib/types";

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
