export interface NLPResult {
  intent: string;
  entities: Record<string, unknown>;
  visualization?: 'bar' | 'pie' | 'line' | 'table';
}

export class NLPParser {
  static parse(query: string): NLPResult {
    query = query.toLowerCase().trim();

    // 1. Filter Transactions (Above/Below Category)
    const amountRegex = /(above|more than|over|>|below|less than|<)\s*(\d+)/;
    const amountMatch = query.match(amountRegex);

    if (query.includes("expense") || query.includes("spend")) {
      let category: string | undefined;
      const categories = ["food", "transport", "bills", "shopping", "health", "travel", "entertainment"];
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
          visualization: 'table'
        };
      }
    }

    // 2. Comparison (Month vs Month)
    const monthVsMonth = query.match(/(\w+)\s*vs\s*(\w+)/);
    if (monthVsMonth) {
      return {
        intent: 'compare_periods',
        entities: {
          period1: monthVsMonth[1],
          period2: monthVsMonth[2]
        },
        visualization: 'bar'
      };
    }

    // 3. Trend/History
    if (query.includes("trend") || query.includes("history")) {
      return { intent: "show_trend", entities: {}, visualization: 'line' };
    }

    // 4. Prediction
    if (query.includes("predict") || query.includes("forecast")) {
      return { intent: "forecast", entities: {}, visualization: 'line' };
    }

    // 5. Anomalies
    if (query.includes("unusual") || query.includes("anomaly") || query.includes("spikes")) {
      return { intent: "detect_anomalies", entities: {}, visualization: 'table' };
    }

    // 6. Financial Health
    if (query.includes("health") || query.includes("score")) {
      return { intent: "financial_health", entities: {} };
    }

    // 7. Category Analysis
    if (query.includes("category") || query.includes("distribution")) {
      return { intent: "category_analysis", entities: {}, visualization: 'pie' };
    }

    return { intent: "unknown", entities: {} };
  }
}
