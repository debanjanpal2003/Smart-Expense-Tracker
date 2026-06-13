import '../analytics/stats_engine.dart';
import '../../models/app_models.dart';

class AnomalyDetector {
  static List<TransactionModel> detectByIQR(List<TransactionModel> transactions) {
    if (transactions.length < 4) return [];
    
    List<double> amounts = transactions.map((t) => t.amount).toList();
    List<double> percentiles = StatsEngine.getPercentiles(amounts, [25, 75]);
    
    double q1 = percentiles[0];
    double q3 = percentiles[1];
    double iqr = q3 - q1;
    
    double lowerBound = q1 - 1.5 * iqr;
    double upperBound = q3 + 1.5 * iqr;
    
    return transactions.where((t) => t.amount < lowerBound || t.amount > upperBound).toList();
  }

  static List<TransactionModel> detectByZScore(List<TransactionModel> transactions, {double threshold = 3.0}) {
    if (transactions.length < 2) return [];
    
    List<double> amounts = transactions.map((t) => t.amount).toList();
    double mean = StatsEngine.mean(amounts);
    double stdDev = StatsEngine.standardDeviation(amounts);
    
    if (stdDev == 0) return [];

    return transactions.where((t) {
      double zScore = (t.amount - mean).abs() / stdDev;
      return zScore > threshold;
    }).toList();
  }
}
