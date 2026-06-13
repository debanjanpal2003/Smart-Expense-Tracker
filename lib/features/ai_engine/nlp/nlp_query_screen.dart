import 'package:flutter/material.dart';
import 'nlp_parser.dart';
import '../../transactions/repositories/transaction_repository.dart';
import '../../models/app_models.dart';

class NLPQueryScreen extends StatefulWidget {
  const NLPQueryScreen({super.key});

  @override
  State<NLPQueryScreen> createState() => _NLPQueryScreenState();
}

class _NLPQueryScreenState extends State<NLPQueryScreen> {
  final _queryController = TextEditingController();
  final _txRepo = TransactionRepository();
  List<TransactionModel> _results = [];
  String _summary = '';

  void _handleQuery() async {
    final nlpResult = NLPParser.parse(_queryController.text);
    
    if (nlpResult.intent == 'filter_transactions') {
      // Basic implementation for demo
      final all = await _txRepo.getTransactions(limit: 1000);
      setState(() {
        _results = all.where((t) {
          bool matches = true;
          if (nlpResult.entities['category'] != null) {
            matches = matches && t.categoryId.toLowerCase().contains(nlpResult.entities['category']);
          }
          if (nlpResult.entities['amount'] != null) {
            double queryAmount = nlpResult.entities['amount'];
            String op = nlpResult.entities['operator'];
            if (op == 'above' || op == '>') matches = matches && t.amount > queryAmount;
            if (op == 'below' || op == '<') matches = matches && t.amount < queryAmount;
          }
          return matches;
        }).toList();
        _summary = 'Found ${_results.length} transactions matching your query.';
      });
    } else {
      setState(() {
        _summary = 'Intent "${nlpResult.intent}" recognized, but logic not yet implemented.';
        _results = [];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI NLP Assistant')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _queryController,
              decoration: InputDecoration(
                hintText: 'e.g., "Food expenses above 500"',
                suffixIcon: IconButton(icon: const Icon(Icons.send), onPressed: _handleQuery),
              ),
              onSubmitted: (_) => _handleQuery(),
            ),
            const SizedBox(height: 24),
            if (_summary.isNotEmpty) ...[
              Text(_summary, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blueAccent)),
              const SizedBox(height: 16),
            ],
            Expanded(
              child: ListView.builder(
                itemCount: _results.length,
                itemBuilder: (context, index) {
                  final tx = _results[index];
                  return ListTile(
                    title: Text(tx.title),
                    subtitle: Text(tx.categoryId),
                    trailing: Text('\$${tx.amount.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
