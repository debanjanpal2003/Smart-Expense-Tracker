import 'dart:math';

class StatsEngine {
  static double mean(List<double> data) {
    if (data.isEmpty) return 0.0;
    return data.reduce((a, b) => a + b) / data.length;
  }

  static double median(List<double> data) {
    if (data.isEmpty) return 0.0;
    List<double> sorted = List.from(data)..sort();
    int middle = sorted.length ~/ 2;
    if (sorted.length % 2 == 1) {
      return sorted[middle];
    } else {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
  }

  static double standardDeviation(List<double> data) {
    if (data.length < 2) return 0.0;
    double avg = mean(data);
    double sumSquaredDiff = data.map((x) => pow(x - avg, 2)).reduce((a, b) => a + b);
    return sqrt(sumSquaredDiff / (data.length - 1));
  }

  static List<double> getPercentiles(List<double> data, List<double> percentiles) {
    if (data.isEmpty) return percentiles.map((_) => 0.0).toList();
    List<double> sorted = List.from(data)..sort();
    return percentiles.map((p) {
      double index = (p / 100) * (sorted.length - 1);
      int lower = index.floor();
      int upper = index.ceil();
      double weight = index - lower;
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }).toList();
  }
}
