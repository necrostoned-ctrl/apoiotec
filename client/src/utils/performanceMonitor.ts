export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(label: string) {
    this.marks.set(label, performance.now());
  }

  end(label: string) {
    const start = this.marks.get(label);
    if (!start) {
      console.warn(`No start mark for ${label}`);
      return 0;
    }
    
    const duration = performance.now() - start;
    
    if (duration > 1000) {
      console.warn(`⚠️ ${label} took ${duration.toFixed(2)}ms`);
    } else if (duration > 100) {
      console.info(`ℹ️ ${label} took ${duration.toFixed(2)}ms`);
    } else {
      console.debug(`✓ ${label} took ${duration.toFixed(2)}ms`);
    }
    
    this.marks.delete(label);
    return duration;
  }

  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      console.error(`❌ ${label} failed:`, error);
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
