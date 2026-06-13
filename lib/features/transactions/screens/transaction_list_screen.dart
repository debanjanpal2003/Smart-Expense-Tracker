import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../repositories/transaction_repository.dart';
import 'add_transaction_screen.dart';

final transactionRepoProvider = Provider((ref) => TransactionRepository());

class TransactionListScreen extends ConsumerStatefulWidget {
  const TransactionListScreen({super.key});

  @override
  ConsumerState<TransactionListScreen> createState() => _TransactionListScreenState();
}

class _TransactionListScreenState extends ConsumerState<TransactionListScreen> {
  final _searchController = TextEditingController();
  bool _isSearching = false;

  @override
  Widget build(BuildContext context) {
    final repo = ref.watch(transactionRepoProvider);

    return Scaffold(
      appBar: AppBar(
        title: _isSearching 
          ? TextField(
              controller: _searchController,
              autofocus: true,
              decoration: const InputDecoration(hintText: 'Search...', border: InputBorder.none),
              onChanged: (_) => setState(() {}),
            )
          : const Text('Transactions'),
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            onPressed: () => setState(() {
              _isSearching = !_isSearching;
              if (!_isSearching) _searchController.clear();
            }),
          ),
        ],
      ),
      body: FutureBuilder(
        future: _isSearching && _searchController.text.isNotEmpty
          ? repo.searchTransactions(_searchController.text)
          : repo.getTransactions(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final transactions = snapshot.data!;
          
          if (transactions.isEmpty) return const Center(child: Text('No transactions found'));

          return ListView.builder(
            itemCount: transactions.length,
            itemBuilder: (context, index) {
              final tx = transactions[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: tx.type == 'income' ? Colors.green.withOpacity(0.2) : Colors.redAccent.withOpacity(0.2),
                  child: Icon(
                    tx.type == 'income' ? Icons.arrow_downward : Icons.arrow_upward,
                    color: tx.type == 'income' ? Colors.green : Colors.redAccent,
                  ),
                ),
                title: Text(tx.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(DateFormat('MMM dd, yyyy').format(tx.date)),
                trailing: Text(
                  '${tx.type == 'income' ? '+' : '-'}${tx.amount.toStringAsFixed(2)}',
                  style: TextStyle(
                    color: tx.type == 'income' ? Colors.green : Colors.redAccent,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            builder: (context) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  leading: const Icon(Icons.add_circle, color: Colors.green),
                  title: const Text('Add Income'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const AddTransactionScreen(type: 'income')));
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.remove_circle, color: Colors.redAccent),
                  title: const Text('Add Expense'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const AddTransactionScreen(type: 'expense')));
                  },
                ),
              ],
            ),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
