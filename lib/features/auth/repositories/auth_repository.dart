import 'dart:convert';
import 'package:crypto/crypto.dart';
import '../../../core/storage/storage_service.dart';
import '../../../models/app_models.dart';

class AuthRepository {
  final StorageService _storage = StorageService();

  static const String _userKey = 'current_user';
  static const String _passwordHashKey = 'password_hash';
  static const String _isLoggedInKey = 'is_logged_in';

  Future<bool> register(UserModel user, String password) async {
    try {
      final bytes = utf8.encode(password);
      final hash = sha256.convert(bytes).toString();

      await _storage.secureSet(_passwordHashKey, hash);
      await _storage.set(StorageService.userBox, _userKey, user.toMap());
      await _storage.set(StorageService.settingsBox, _isLoggedInKey, true);
      
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> login(String password) async {
    final storedHash = await _storage.secureGet(_passwordHashKey);
    if (storedHash == null) return false;

    final bytes = utf8.encode(password);
    final hash = sha256.convert(bytes).toString();

    if (storedHash == hash) {
      await _storage.set(StorageService.settingsBox, _isLoggedInKey, true);
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    await _storage.set(StorageService.settingsBox, _isLoggedInKey, false);
  }

  Future<bool> isLoggedIn() async {
    return _storage.get(StorageService.settingsBox, _isLoggedInKey, defaultValue: false);
  }

  UserModel? getCurrentUser() {
    final userMap = _storage.get(StorageService.userBox, _userKey);
    if (userMap != null) {
      return UserModel.fromMap(Map<String, dynamic>.from(userMap));
    }
    return null;
  }

  Future<void> deleteAccount() async {
    await _storage.clearAll();
  }
}
