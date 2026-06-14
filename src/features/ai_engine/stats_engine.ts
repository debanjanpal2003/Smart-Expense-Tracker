export class StatsEngine {
  static getPercentiles(data: number[], percentiles: number[]): number[] {
    if (data.length === 0) return percentiles.map(() => 0);
    const sorted = [...data].sort((a, b) => a - b);
    return percentiles.map((p) => {
      const pos = (sorted.length - 1) * (p / 100);
      const base = Math.floor(pos);
      const rest = pos - base;
      if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
      } else {
        return sorted[base];
      }
    });
  }

  static mean(data: number[]): number {
    if (data.length === 0) return 0;
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  static standardDeviation(data: number[]): number {
    if (data.length < 2) return 0;
    const m = this.mean(data);
    return Math.sqrt(
      data.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / (data.length - 1)
    );
  }
}
