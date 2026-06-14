import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'smat_expense.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Categories Table
    await db.execute('''
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        color INTEGER,
        type TEXT NOT NULL -- income or expense
      )
    ''');

    // Transactions Table
    await db.execute('''
      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        categoryId TEXT NOT NULL,
        note TEXT,
        type TEXT NOT NULL, -- income or expense
        FOREIGN KEY (categoryId) REFERENCES categories (id)
      )
    ''');

    // Budgets Table
    await db.execute('''
      CREATE TABLE budgets (
        id TEXT PRIMARY KEY,
        categoryId TEXT NOT NULL,
        amount REAL NOT NULL,
        period TEXT NOT NULL, -- monthly, weekly
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        FOREIGN KEY (categoryId) REFERENCES categories (id)
      )
    ''');
  }
}
