import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  timestamp: Date;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 requests

  public middleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime();
    const startMemory = process.memoryUsage();

    // Override res.end to capture metrics
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const responseTime = seconds * 1000 + nanoseconds / 1e6; // Convert to milliseconds

      const metric: PerformanceMetrics = {
        timestamp: new Date(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: Math.round(responseTime * 100) / 100, // Round to 2 decimal places
        memoryUsage: process.memoryUsage(),
      };

      performanceMonitor.addMetric(metric);
      
      // Log slow requests
      if (responseTime > 1000) {
        console.warn(`🐌 Slow request: ${req.method} ${req.path} - ${responseTime}ms`);
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };

  private addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only the last N metrics to prevent memory leak
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  public getMetrics() {
    return this.metrics;
  }

  public getStats() {
    if (this.metrics.length === 0) {
      return { message: 'No metrics available' };
    }

    const responseTimes = this.metrics.map(m => m.responseTime);
    const statusCodes = this.metrics.reduce((acc, m) => {
      acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);

    // Calculate percentiles
    const sorted = responseTimes.sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    // Memory stats from latest metric
    const latestMemory = this.metrics[this.metrics.length - 1].memoryUsage;

    return {
      totalRequests: this.metrics.length,
      responseTime: {
        avg: Math.round(avgResponseTime * 100) / 100,
        min: Math.round(minResponseTime * 100) / 100,
        max: Math.round(maxResponseTime * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        p99: Math.round(p99 * 100) / 100,
      },
      statusCodes,
      memory: {
        rss: Math.round(latestMemory.rss / 1024 / 1024 * 100) / 100, // MB
        heapUsed: Math.round(latestMemory.heapUsed / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(latestMemory.heapTotal / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(latestMemory.external / 1024 / 1024 * 100) / 100, // MB
      },
      uptime: Math.round(process.uptime()),
    };
  }

  public reset() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Health check endpoint data
export const getHealthCheck = () => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  return {
    status: 'healthy',
    uptime: Math.round(uptime),
    timestamp: new Date().toISOString(),
    memory: {
      rss: `${Math.round(memory.rss / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    },
    env: process.env.NODE_ENV || 'development',
    version: process.version,
  };
};