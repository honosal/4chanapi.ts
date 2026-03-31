/**
 * A serial request queue that guarantees at least `intervalMs` milliseconds
 * between the *start* of consecutive dispatched requests.
 *
 * Each call to `schedule` waits for the previous request to complete AND for
 * the minimum interval to elapse before dispatching the next one.
 *
 * The 4chan API rule: maximum 1 request per second.
 */
export class RateLimiter {
  private readonly intervalMs: number;
  /** Resolves when the next request is allowed to start. */
  private gate: Promise<void> = Promise.resolve();

  constructor(intervalMs = 1000) {
    this.intervalMs = intervalMs;
  }

  /**
   * Schedule `fn`. Returns a Promise that resolves / rejects with the result
   * of `fn` without waiting for the post-request delay.
   */
  schedule<T>(fn: () => Promise<T>): Promise<T> {
    const currentGate = this.gate;

    // Create a new gate that will be released after fn() + remaining interval
    let releaseNext!: () => void;
    this.gate = new Promise<void>((resolve) => {
      releaseNext = resolve;
    });

    return currentGate.then(async () => {
      const startTime = Date.now();
      try {
        return await fn();
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = this.intervalMs - elapsed;
        if (remaining > 0) {
          setTimeout(releaseNext, remaining);
        } else {
          releaseNext();
        }
      }
    });
  }
}
