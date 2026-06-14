class CategoryModel {
  final String id;
  final String name;
  final String? icon;
  final int? color;
  final String type; // 'income' or 'expense'

  CategoryModel({
    required this.id,
    required this.name,
    this.icon,
    this.color,
    required this.type,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'color': color,
      'type': type,
    };
  }

  factory CategoryModel.fromMap(Map<String, dynamic> map) {
    return CategoryModel(
      id: map['id'],
      name: map['name'],
      icon: map['icon'],
      color: map['color'],
      type: map['type'],
    );
  }
}

class TransactionModel {
  final String id;
  final String title;
  final double amount;
  final DateTime date;
  final String categoryId;
  final String? note;
  final String type; // 'income' or 'expense'

  TransactionModel({
    required this.id,
    required this.title,
    required this.amount,
    required this.date,
    required this.categoryId,
    this.note,
    required this.type,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'amount': amount,
      'date': date.toIso8601String(),
      'categoryId': categoryId,
      'note': note,
      'type': type,
    };
  }

  factory TransactionModel.fromMap(Map<String, dynamic> map) {
    return TransactionModel(
      id: map['id'],
      title: map['title'],
      amount: map['amount'],
      date: DateTime.parse(map['date']),
      categoryId: map['categoryId'],
      note: map['note'],
      type: map['type'],
    );
  }
}

class UserModel {
  final String id;
  final String name;
  final String email;
  final String currency;
  final bool trackIncome;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.currency,
    required this.trackIncome,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'currency': currency,
      'trackIncome': trackIncome ? 1 : 0,
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'],
      name: map['name'],
      email: map['email'],
      currency: map['currency'],
      trackIncome: map['trackIncome'] == 1,
    );
  }
}
