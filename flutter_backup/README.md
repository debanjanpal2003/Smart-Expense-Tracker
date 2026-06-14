# SmartExpense Tracker - Offline AI Finance Assistant

A complete, production-ready, fully offline Android application built with Flutter.

## Features

- **100% Offline**: No internet, no cloud, no external APIs. Everything stays on your device.
- **Local AI Engines**:
  - **Stats Engine**: Mean, Median, StdDev, and Percentiles.
  - **Anomaly Detection**: IQR and Z-Score based detectors for unusual spending.
  - **Forecasting**: Linear Regression and Moving Averages for future spending predictions.
  - **NLP Query Parser**: Rule-based natural language interaction (e.g., "food expenses > 500").
- **Secure Authentication**: Offline registration, password hashing (SHA-256), and Biometric/PIN lock.
- **Transaction Management**: Full CRUD with search, filtering, and sorting.
- **Advanced Visualizations**: Interactive Pie, Bar, and Line charts using `fl_chart`.
- **Report Generation**: Export data to PDF, Excel (XLSX), and CSV.
- **Material 3 Design**: Modern Fintech UI with Glassmorphism and Dark Mode support.

## Tech Stack

- **Framework**: Flutter 3.x
- **State Management**: Riverpod
- **Local Database**: SQLite (`sqflite`)
- **Key-Value Storage**: Hive
- **Secure Storage**: `flutter_secure_storage`
- **Charts**: `fl_chart`
- **PDF/Excel/CSV**: `pdf`, `excel`, `csv`

## How to Run

### Prerequisites
1.  **Install Flutter SDK**: [Flutter Installation Guide](https://docs.flutter.dev/get-started/install)
2.  **Java Development Kit (JDK)**: Required for Android builds (JDK 11 recommended).
3.  **Android Studio**: For Android SDK and Emulator setup.

### Steps to Run
1.  **Clone the repository**.
2.  **Install Dependencies**:
    ```bash
    flutter pub get
    ```
3.  **Run Code Generation** (if applicable):
    ```bash
    flutter pub run build_runner build
    ```
4.  **Run the App**:
    Connect an Android device or start an emulator, then run:
    ```bash
    flutter run
    ```

## How to Build APK

To generate a production-ready release APK:

1.  **Clean the project**:
    ```bash
    flutter clean
    ```
2.  **Build Release APK**:
    ```bash
    flutter build apk --release
    ```
    The APK will be located at: `build/app/outputs/flutter-apk/app-release.apk`

3.  **Build App Bundle (AAB)**:
    ```bash
    flutter build appbundle --release
    ```
    The AAB will be located at: `build/app/outputs/bundle/release/app-release.aab`

## Project Structure

- `lib/core/`: Foundational services (DB, Storage, Theme).
- `lib/features/`: Modular features (Auth, Dashboard, AI Engine, Reports).
- `lib/models/`: Shared data models.
- `lib/widgets/`: Reusable UI components.
- `.github/workflows/`: CI/CD automation.

## Security Note

All data is stored locally in the application's private directory. If the application is uninstalled, all data is automatically deleted by the Android system.
