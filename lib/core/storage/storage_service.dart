import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  static const _secureStorage = FlutterSecureStorage();
  
  // Hive box names
  static const String settingsBox = 'settings';
  static const String userBox = 'user';

  Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(settingsBox);
    await Hive.openBox(userBox);
  }

  // Generic Hive operations
  Future<void> set(String boxName, String key, dynamic value) async {
    final box = Hive.box(boxName);
    await box.put(key, value);
  }

  dynamic get(String boxName, String key, {dynamic defaultValue}) {
    final box = Hive.box(boxName);
    return box.get(key, defaultValue: defaultValue);
  }

  // Secure Storage operations
  Future<void> secureSet(String key, String value) async {
    await _secureStorage.write(key: key, value: value);
  }

  Future<String?> secureGet(String key) async {
    return await _secureStorage.read(key: key);
  }

  Future<void> secureDelete(String key) async {
    await _secureStorage.delete(key: key);
  }

  Future<void> clearAll() async {
    await Hive.box(settingsBox).clear();
    await Hive.box(userBox).clear();
    await _secureStorage.deleteAll();
  }
}
