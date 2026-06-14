import { Transaction } from "../../models/types";
import { StatsEngine } from "../ai_engine/stats_engine";

export class AnomalyDetector {
  static detectByIQR(transactions: Transaction[]): Transaction[] {
    if (transactions.length < 4) return [];

    const amounts = transactions.map((t) => t.amount);
    const [q1, q3] = StatsEngine.getPercentiles(amounts, [25, 75]);

    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return transactions.filter(
      (t) => t.amount < lowerBound || t.amount > upperBound
    );
  }

  static detectByZScore(
    transactions: Transaction[],
    threshold: number = 3.0
  ): Transaction[] {
    if (transactions.length < 2) return [];

    const amounts = transactions.map((t) => t.amount);
    const mean = StatsEngine.mean(amounts);
    const stdDev = StatsEngine.standardDeviation(amounts);

    if (stdDev === 0) return [];

    return transactions.filter((t) => {
      const zScore = Math.abs(t.amount - mean) / stdDev;
      return zScore > threshold;
    });
  }
}
