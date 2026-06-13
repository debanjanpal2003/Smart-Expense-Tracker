import '../../../core/database/database_service.dart';

class BudgetModel {
  final String id;
  final String categoryId;
  final double amount;
  final String period; // 'monthly', 'weekly'
  final DateTime startDate;
  final DateTime endDate;

  BudgetModel({
    required this.id,
    required this.categoryId,
    required this.amount,
    required this.period,
    required this.startDate,
    required this.endDate,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'categoryId': categoryId,
      'amount': amount,
      'period': period,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
    };
  }

  factory BudgetModel.fromMap(Map<String, dynamic> map) {
    return BudgetModel(
      id: map['id'],
      categoryId: map['categoryId'],
      amount: map['amount'],
      period: map['period'],
      startDate: DateTime.parse(map['startDate']),
      endDate: DateTime.parse(map['endDate']),
    );
  }
}

class BudgetRepository {
  final DatabaseService _dbService = DatabaseService();

  Future<void> setBudget(BudgetModel budget) async {
    final db = await _dbService.database;
    await db.insert('budgets', budget.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<BudgetModel>> getBudgets() async {
    final db = await _dbService.database;
    final List<Map<String, dynamic>> maps = await db.query('budgets');
    return List.generate(maps.length, (i) => BudgetModel.fromMap(maps[i]));
  }

  Future<double> getCategorySpending(String categoryId, DateTime start, DateTime end) async {
    final db = await _dbService.database;
    final result = await db.rawQuery(
      'SELECT SUM(amount) as total FROM transactions WHERE categoryId = ? AND type = "expense" AND date BETWEEN ? AND ?',
      [categoryId, start.toIso8601String(), end.toIso8601String()],
    );
    return (result.first['total'] as num?)?.toDouble() ?? 0.0;
  }
}
