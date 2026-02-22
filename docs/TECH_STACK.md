# 🛠️ Tech Stack Document: HealthSync Ecosystem

## 1. Core Frameworks
- **React Native (Expo SDK 51+)**: The backbone of the mobile application, ensuring cross-platform compatibility (iOS/Android).
- **Expo Router**: Modern, file-based routing system (v3).

## 2. Backend-as-a-Service (Firebase v10+)
- **Firestore**: Real-time NoSQL database for ultra-low latency data syncing.
- **Authentication**: Firebase Authentication for secure user boarding.
- **Expo Notifications**: Bridge for handling both local scheduling and remote FCM (Firebase Cloud Messaging).

## 3. State & Storage
- **Zustand**: Lightweight, high-performance state management.
- **Zustand Persist**: Used for persisting the Auth and Profile state across app restarts.
- **AsyncStorage**: Local storage engine for persisted state and onboarding flags.

## 4. UI & Aesthetics
- **React Native Reanimated (v3)**: Powering premium dashboard transitions and the "SOS Pulse" effect.
- **Lucide React Native**: Consistent, modern icon set.
- **Safe Area Context**: Ensuring notch and home-indicator compatibility on modern devices (iPhone 15/16 Pro).

## 5. Development & DevOps
- **EAS (Expo Application Services)**:
  - **EAS Build**: Used for generating high-priority production APKs.
  - **EAS Update**: (Planned) Over-the-air updates for instant bug fixes.
- **Git**: Version control hosted on GitHub.
- **SWC**: Fast JavaScript/TypeScript compilation.

## 6. Security Protocol
- **Firestore Security Rules**: Hardened role-based access control (RBAC).
- **SSL Pinning**: (Planned for Production) To prevent man-in-the-middle attacks.
- **Deterministic ID Logic**: Predictable document paths for connection verification.
