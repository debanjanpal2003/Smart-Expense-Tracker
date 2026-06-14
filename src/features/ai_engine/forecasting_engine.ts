export class ForecastingEngine {
  /**
   * Simple Linear Regression to predict next value
   * @param y List of values (e.g., monthly spending)
   */
  static predictNext(y: number[]): number {
    if (y.length < 2) return y.length > 0 ? y[y.length - 1] : 0.0;

    const n = y.length;
    const x = Array.from({ length: n }, (_, i) => i);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumXY += x[i] * y[i];
      sumXX += x[i] * x[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict for the next index (n)
    return slope * n + intercept;
  }

  static movingAverage(data: number[], period: number = 3): number {
    if (data.length === 0) return 0.0;
    const actualPeriod = data.length < period ? data.length : period;
    const lastN = data.slice(data.length - actualPeriod);
    return lastN.reduce((a, b) => a + b, 0) / actualPeriod;
  }
}
