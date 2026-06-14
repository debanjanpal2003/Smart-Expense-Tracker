export interface NLPResult {
  intent: string;
  entities: Record<string, any>;
}

export class NLPParser {
  static parse(query: string): NLPResult {
    query = query.toLowerCase().trim();

    // 1. Search by Category and Amount
    // Example: "food expenses above 500"
    const amountRegex = /(above|more than|over|>|below|less than|<)\s*(\d+)/;
    const amountMatch = query.match(amountRegex);

    if (query.includes("expense") || query.includes("spend")) {
      let category: string | undefined;
      const categories = [
        "food",
        "transport",
        "bills",
        "shopping",
        "health",
        "travel",
      ];
      for (const cat of categories) {
        if (query.includes(cat)) {
          category = cat;
          break;
        }
      }

      if (amountMatch) {
        return {
          intent: "filter_transactions",
          entities: {
            type: "expense",
            category: category,
            operator: amountMatch[1],
            amount: parseFloat(amountMatch[2]),
          },
        };
      }
    }

    // 2. Trend Intent
    // Example: "show spending trend"
    if (query.includes("trend") || query.includes("history")) {
      return { intent: "show_trend", entities: {} };
    }

    // 3. Prediction Intent
    // Example: "predict next month spending"
    if (query.includes("predict") || query.includes("forecast")) {
      return { intent: "predict_spending", entities: {} };
    }

    // 4. Unusual Expenses
    // Example: "find unusual expenses"
    if (
      query.includes("unusual") ||
      query.includes("anomaly") ||
      query.includes("spikes")
    ) {
      return { intent: "find_anomalies", entities: {} };
    }

    return { intent: "unknown", entities: {} };
  }
}
