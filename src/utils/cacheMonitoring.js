export class CacheMonitor {
  constructor() {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
    };
  }

  recordHit() {
    this.metrics.hits++;
  }

  recordMiss() {
    this.metrics.misses++;
  }

  getMetrics() {
    return this.metrics;
  }
}
