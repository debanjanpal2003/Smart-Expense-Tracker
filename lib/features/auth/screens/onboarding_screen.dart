import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../../../models/app_models.dart';
import '../repositories/auth_repository.dart';
import '../../dashboard/dashboard_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _selectedCurrency = 'USD';
  bool _trackIncome = true;

  final _authRepo = AuthRepository();

  void _completeOnboarding() async {
    final user = UserModel(
      id: const Uuid().v4(),
      name: _nameController.text,
      email: _emailController.text,
      currency: _selectedCurrency,
      trackIncome: _trackIncome,
    );

    final success = await _authRepo.register(user, _passwordController.text);
    if (success && mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const DashboardScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _pageController,
        physics: const NeverScrollableScrollPhysics(),
        onPageChanged: (index) => setState(() => _currentPage = index),
        children: [
          _buildStep1(),
          _buildStep2(),
          _buildStep3(),
        ],
      ),
    );
  }

  Widget _buildStep1() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Welcome to SmartExpense', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          const Text('Let\'s get started by setting up your profile.'),
          const SizedBox(height: 48),
          TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Name')),
          const SizedBox(height: 16),
          TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email')),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () => _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.ease),
            child: const Text('Next'),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Preferences', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 32),
          DropdownButtonFormField<String>(
            value: _selectedCurrency,
            items: ['USD', 'EUR', 'GBP', 'INR', 'JPY'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
            onChanged: (val) => setState(() => _selectedCurrency = val!),
            decoration: const InputDecoration(labelText: 'Currency'),
          ),
          const SizedBox(height: 24),
          SwitchListTile(
            title: const Text('Track Income'),
            value: _trackIncome,
            onChanged: (val) => setState(() => _trackIncome = val),
          ),
          const SizedBox(height: 32),
          Row(
            children: [
              Expanded(child: OutlinedButton(onPressed: () => _pageController.previousPage(duration: const Duration(milliseconds: 300), curve: Curves.ease), child: const Text('Back'))),
              const SizedBox(width: 16),
              Expanded(child: ElevatedButton(onPressed: () => _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.ease), child: const Text('Next'))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStep3() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Secure Your App', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 48),
          TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Create Password')),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _completeOnboarding,
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent, foregroundColor: Colors.white),
            child: const Text('Complete Setup'),
          ),
        ],
      ),
    );
  }
}
