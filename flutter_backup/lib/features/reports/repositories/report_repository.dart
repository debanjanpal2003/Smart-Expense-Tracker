import 'dart:io';
import 'package:csv/csv.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:excel/excel.dart';
import '../../../models/app_models.dart';

class ReportService {
  Future<String> generateCSV(List<TransactionModel> transactions) async {
    List<List<dynamic>> rows = [
      ['Date', 'Title', 'Amount', 'Type', 'Category', 'Note']
    ];

    for (var tx in transactions) {
      rows.add([
        tx.date.toIso8601String(),
        tx.title,
        tx.amount,
        tx.type,
        tx.categoryId,
        tx.note ?? ''
      ]);
    }

    String csv = const ListToCsvConverter().convert(rows);
    final directory = await getApplicationDocumentsDirectory();
    final file = File('${directory.path}/transactions_${DateTime.now().millisecondsSinceEpoch}.csv');
    await file.writeAsString(csv);
    return file.path;
  }

  Future<String> generatePDF(List<TransactionModel> transactions) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Text('SmartExpense Report', style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)),
              pw.SizedBox(height: 20),
              pw.Table.fromTextArray(
                headers: ['Date', 'Title', 'Amount', 'Type'],
                data: transactions.map((t) => [
                  t.date.toString().substring(0, 10),
                  t.title,
                  t.amount.toStringAsFixed(2),
                  t.type
                ]).toList(),
              ),
            ],
          );
        },
      ),
    );

    final directory = await getApplicationDocumentsDirectory();
    final file = File('${directory.path}/report_${DateTime.now().millisecondsSinceEpoch}.pdf');
    await file.writeAsBytes(await pdf.save());
    return file.path;
  }

  Future<String> generateExcel(List<TransactionModel> transactions) async {
    var excel = Excel.createExcel();
    Sheet sheetObject = excel['Transactions'];

    sheetObject.appendRow(['Date', 'Title', 'Amount', 'Type', 'Category', 'Note']);

    for (var tx in transactions) {
      sheetObject.appendRow([
        tx.date.toIso8601String(),
        tx.title,
        tx.amount,
        tx.type,
        tx.categoryId,
        tx.note ?? ''
      ]);
    }

    final directory = await getApplicationDocumentsDirectory();
    final fileName = '${directory.path}/transactions_${DateTime.now().millisecondsSinceEpoch}.xlsx';
    final fileBytes = excel.save();
    
    if (fileBytes != null) {
      File(fileName)
        ..createSync(recursive: true)
        ..writeAsBytesSync(fileBytes);
    }
    
    return fileName;
  }
}
