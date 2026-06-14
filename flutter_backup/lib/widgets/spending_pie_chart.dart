import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class SpendingPieChart extends StatelessWidget {
  final Map<String, double> categoryData;

  const SpendingPieChart({super.key, required this.categoryData});

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1.3,
      child: PieChart(
        PieChartData(
          sectionsSpace: 0,
          centerSpaceRadius: 40,
          sections: _getSections(),
        ),
      ),
    );
  }

  List<PieChartSectionData> _getSections() {
    final List<Color> colors = [Colors.blue, Colors.red, Colors.green, Colors.yellow, Colors.purple, Colors.orange];
    int index = 0;

    return categoryData.entries.map((entry) {
      final color = colors[index % colors.length];
      index++;
      return PieChartSectionData(
        color: color,
        value: entry.value,
        title: '${entry.key}\n${entry.value.toStringAsFixed(0)}',
        radius: 50,
        titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
      );
    }).toList();
  }
}
