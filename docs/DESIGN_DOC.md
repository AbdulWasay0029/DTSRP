# 🏗️ Design Document: HealthSync Architecture

## 1. System Architecture
HealthSync follows a **Serverless Mobile Architecture** using React Native (Expo) and Firebase.

### 1.1 Client-Side
- **Framework**: Expo Router for file-based navigation.
- **State Management**: **Zustand** with persistence middleware. This ensures that the user's role and basic profile are accessible instantly upon app launch.
- **Offline Capability**: Firestore persistence layers allow the app to function with intermittent connectivity.

### 1.2 Backend (Firebase)
- **Authentication**: Firebase Auth (Email/ID).
- **Database**: Cloud Firestore (NoSQL) for real-time document synchronization.
- **Security**: Granular Firestore Rules based on deterministic Connection IDs.

## 2. Data Models (Firestore Schema)

### 2.1 Users Collection
```typescript
{
  uid: string,
  name: string,
  role: 'patient' | 'caregiver', // Interally clinical, UX uses Family Member/Guardian
  inviteCode: string (6-digit),
  expoPushToken?: string,
  createdAt: timestamp
}
```

### 2.2 Medicines Collection
```typescript
{
  id: string,
  patientId: string, // Links to User
  name: string,
  dosage: string,
  times: string[], // e.g., ["08:00", "20:00"]
  instructions: string,
  category: string
}
```

### 2.3 Connections Collection
```typescript
{
  id: string (caregiverId_patientId),
  caregiverId: string,
  patientId: string,
  status: 'pending' | 'approved',
  createdAt: timestamp
}
```

### 2.4 Logs Collection (Adherence)
```typescript
{
  medicineId: string,
  date: string (YYYY-MM-DD),
  expectedTime: string,
  status: 'taken' | 'missed' | 'initial',
  timestamp: timestamp
}
```

## 3. Security Model (Hardened Rules)
We use a **Deterministic ID Pattern** for connections. 
- A Guardian can only read a Member's medicine/logs if a document exists at `/Connections/{guardianUid}_{memberUid}` with `status == 'approved'`.
- This eliminates the need for expensive "collectionGroup" queries and keeps data isolated.

## 4. Communication & Flow Logic

### 4.1 SOS Protocol Flow
1. **Trigger**: Member holds SOS button for 3s.
2. **State**: App writes `isActive: true` to a specific SOS collection (or User field).
3. **Notification**: Firestore Trigger (Cloud Function) or Client-side listener triggers a high-priority Push Notification to the linked Guardian.
4. **Resolution**: Member clicks "I'm Safe", updating health state back to normal.

### 4.2 Notification Strategy
- **Local**: `expo-notifications` schedules reminders on the device based on the `Medicines` array.
- **Remote**: Triggered when a Member fails to confirm a dose within a grace period (e.g., 60 mins), sending a "Missed Dose" alert to the Guardian.
