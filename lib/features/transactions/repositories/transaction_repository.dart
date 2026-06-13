import '../../../core/database/database_service.dart';
import '../../../models/app_models.dart';

class TransactionRepository {
  final DatabaseService _dbService = DatabaseService();

  Future<void> addTransaction(TransactionModel transaction) async {
    final db = await _dbService.database;
    await db.insert('transactions', transaction.toMap());
  }

  Future<List<TransactionModel>> getTransactions({int limit = 20, int offset = 0}) async {
    final db = await _dbService.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'transactions',
      orderBy: 'date DESC',
      limit: limit,
      offset: offset,
    );
    return List.generate(maps.length, (i) => TransactionModel.fromMap(maps[i]));
  }

  Future<void> updateTransaction(TransactionModel transaction) async {
    final db = await _dbService.database;
    await db.update(
      'transactions',
      transaction.toMap(),
      where: 'id = ?',
      whereArgs: [transaction.id],
    );
  }

  Future<void> deleteTransaction(String id) async {
    final db = await _dbService.database;
    await db.delete(
      'transactions',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<List<TransactionModel>> searchTransactions(String query) async {
    final db = await _dbService.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'transactions',
      where: 'title LIKE ? OR note LIKE ?',
      whereArgs: ['%$query%', '%$query%'],
      orderBy: 'date DESC',
    );
    return List.generate(maps.length, (i) => TransactionModel.fromMap(maps[i]));
  }
}
