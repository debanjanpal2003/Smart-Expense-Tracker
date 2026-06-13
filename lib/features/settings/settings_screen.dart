import 'package:flutter/material.dart';
import '../../auth/repositories/auth_repository.dart';
import '../../auth/screens/onboarding_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authRepo = AuthRepository();
    final user = authRepo.getCurrentUser();

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          const SizedBox(height: 16),
          _buildUserSection(context, user),
          const Divider(),
          _buildSecuritySection(context),
          const Divider(),
          _buildDataSection(context),
          const Divider(),
          _buildAboutSection(context),
          const SizedBox(height: 32),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: ElevatedButton(
              onPressed: () async {
                await authRepo.logout();
                if (context.mounted) {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const OnboardingScreen()),
                    (route) => false,
                  );
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
              child: const Text('Logout'),
            ),
          ),
          const SizedBox(height: 16),
          TextButton(
            onPressed: () {
              // Confirm and delete
            },
            child: const Text('Delete Account', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }

  Widget _buildUserSection(BuildContext context, dynamic user) {
    return ListTile(
      leading: const CircleAvatar(child: Icon(Icons.person)),
      title: Text(user?.name ?? 'User'),
      subtitle: Text(user?.email ?? 'email@example.com'),
      trailing: IconButton(icon: const Icon(Icons.edit), onPressed: () {}),
    );
  }

  Widget _buildSecuritySection(BuildContext context) {
    return Column(
      children: [
        ListTile(
          leading: const Icon(Icons.lock_person),
          title: const Text('Biometric Authentication'),
          trailing: Switch(value: true, onChanged: (val) {}),
        ),
        const ListTile(
          leading: const Icon(Icons.password),
          title: const Text('Change Password'),
          trailing: Icon(Icons.chevron_right),
        ),
      ],
    );
  }

  Widget _buildDataSection(BuildContext context) {
    return Column(
      children: [
        const ListTile(
          leading: const Icon(Icons.backup),
          title: const Text('Backup Data'),
          trailing: Icon(Icons.chevron_right),
        ),
        const ListTile(
          leading: const Icon(Icons.restore),
          title: const Text('Restore Data'),
          trailing: Icon(Icons.chevron_right),
        ),
        ListTile(
          leading: const Icon(Icons.file_download),
          title: const Text('Export All Transactions'),
          onTap: () {},
        ),
      ],
    );
  }

  Widget _buildAboutSection(BuildContext context) {
    return const ListTile(
      leading: Icon(Icons.info_outline),
      title: Text('About SmartExpense'),
      subtitle: Text('Version 1.0.0'),
    );
  }
}
