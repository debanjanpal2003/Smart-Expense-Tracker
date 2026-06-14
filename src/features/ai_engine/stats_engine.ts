import { Transaction } from "../../models/types";

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

  static median(data: number[]): number {
    if (data.length === 0) return 0;
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  static mode(data: number[]): number[] {
    if (data.length === 0) return [];
    const counts: Record<number, number> = {};
    let maxCount = 0;
    data.forEach(n => {
      counts[n] = (counts[n] || 0) + 1;
      if (counts[n] > maxCount) maxCount = counts[n];
    });
    return Object.entries(counts)
      .filter(([_, count]) => count === maxCount)
      .map(([n, _]) => parseFloat(n));
  }

  static standardDeviation(data: number[]): number {
    if (data.length < 2) return 0;
    const m = this.mean(data);
    return Math.sqrt(
      data.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / (data.length - 1)
    );
  }

  static variance(data: number[]): number {
    if (data.length < 2) return 0;
    const m = this.mean(data);
    return data.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / (data.length - 1);
  }

  static calculateFinancialHealth(transactions: Transaction[]): number {
    if (transactions.length === 0) return 50;
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expenses += t.amount;
    });

    if (income === 0) return Math.max(0, 50 - (expenses / 100));
    const ratio = (income - expenses) / income;
    let score = 50 + (ratio * 50);
    
    // Penalty for zero savings
    if (expenses >= income) score = Math.max(0, 30 - ((expenses - income) / income) * 20);
    
    return Math.min(100, Math.max(0, score));
  }
}
