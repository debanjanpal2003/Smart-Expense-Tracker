class ForecastingEngine {
  /// Simple Linear Regression to predict next value
  /// [y] is the list of values (e.g., monthly spending)
  static double predictNext(List<double> y) {
    if (y.length < 2) return y.isNotEmpty ? y.last : 0.0;

    int n = y.length;
    List<int> x = List.generate(n, (i) => i);

    double sumX = x.reduce((a, b) => a + b).toDouble();
    double sumY = y.reduce((a, b) => a + b);
    double sumXY = 0;
    double sumXX = 0;

    for (int i = 0; i < n; i++) {
      sumXY += x[i] * y[i];
      sumXX += x[i] * x[i];
    }

    double slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    double intercept = (sumY - slope * sumX) / n;

    // Predict for the next index (n)
    return slope * n + intercept;
  }

  static double movingAverage(List<double> data, {int period = 3}) {
    if (data.isEmpty) return 0.0;
    int actualPeriod = data.length < period ? data.length : period;
    List<double> lastN = data.sublist(data.length - actualPeriod);
    return lastN.reduce((a, b) => a + b) / actualPeriod;
  }
}
