class NLPResult {
  final String intent;
  final Map<String, dynamic> entities;

  NLPResult({required this.intent, required this.entities});
}

class NLPParser {
  static NLPResult parse(String query) {
    query = query.toLowerCase().trim();

    // 1. Search by Category and Amount
    // Example: "food expenses above 500"
    final amountRegex = RegExp(r'(above|more than|over|>|below|less than|<)\s*(\d+)');
    final amountMatch = amountRegex.firstMatch(query);

    if (query.contains('expense') || query.contains('spend')) {
      String? category;
      final categories = ['food', 'transport', 'bills', 'shopping', 'health', 'travel'];
      for (var cat in categories) {
        if (query.contains(cat)) {
          category = cat;
          break;
        }
      }

      if (amountMatch != null) {
        return NLPResult(
          intent: 'filter_transactions',
          entities: {
            'type': 'expense',
            'category': category,
            'operator': amountMatch.group(1),
            'amount': double.parse(amountMatch.group(2)!),
          },
        );
      }
    }

    // 2. Trend Intent
    // Example: "show spending trend"
    if (query.contains('trend') || query.contains('history')) {
      return NLPResult(intent: 'show_trend', entities: {});
    }

    // 3. Prediction Intent
    // Example: "predict next month spending"
    if (query.contains('predict') || query.contains('forecast')) {
      return NLPResult(intent: 'predict_spending', entities: {});
    }

    // 4. Unusual Expenses
    // Example: "find unusual expenses"
    if (query.contains('unusual') || query.contains('anomaly') || query.contains('spikes')) {
      return NLPResult(intent: 'find_anomalies', entities: {});
    }

    return NLPResult(intent: 'unknown', entities: {});
  }
}
