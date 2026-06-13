import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/storage/storage_service.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/repositories/auth_repository.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/onboarding_screen.dart';
import 'features/dashboard/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await StorageService().init();
  runApp(const ProviderScope(child: SmatExpenseApp()));
}

class SmatExpenseApp extends ConsumerWidget {
  const SmatExpenseApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authRepo = AuthRepository();

    return MaterialApp(
      title: 'SmartExpense Tracker',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: FutureBuilder<bool>(
        future: authRepo.isLoggedIn(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(body: Center(child: CircularProgressIndicator()));
          }
          
          final bool loggedIn = snapshot.data ?? false;
          final user = authRepo.getCurrentUser();

          if (loggedIn && user != null) {
            return const DashboardScreen();
          } else if (user == null) {
            return const OnboardingScreen();
          } else {
            return const LoginScreen();
          }
        },
      ),
    );
  }
}
