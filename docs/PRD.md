# 📄 PRD: HealthSync (Medicine & Family Monitor)

## 1. Project Overview
HealthSync is a synchronized healthcare platform designed to bridge the gap between medication adherence for individuals ("Family Members") and proactive monitoring for their loved ones ("Family Guardians"). The mission is to provide independence to members while ensuring guardians have real-time visibility and emergency intervention capabilities.

## 2. Target Personas
- **Family Member**: Usually an elderly individual or someone managing chronic conditions. Requires a high-contrast, simple, and distraction-free interface.
- **Family Guardian**: Family members (children, spouses) who need to monitor adherence remotely and receive alerts if doses are missed or emergencies occur.

## 3. Core Requirements

### 3.1 Onboarding & Authentication
- SEC-01: Multi-role registration (Family Member vs. Family Guardian).
- SEC-02: Secure invite-code based linking to ensure only approved Guardians can see health data.
- SEC-03: Firebase-backed Email/Password authentication.

### 3.2 Medical Management (Family Member)
- MED-01: Intuitive medicine addition (dosage, timings, meal relations).
- MED-02: Real-time dashboard showing *upcoming* doses for the day.
- MED-03: Ability to mark doses as "Taken" with automatic logging to Firestore.

### 3.3 Family Monitoring (Family Guardian)
- MON-01: Real-time dashboard listing all linked Family Members.
- MON-02: Adherence percentage tracking per member.
- MON-03: Detailed "Family Detail" view showing past history and future schedules.

### 3.4 Emergency Protocols (SOS)
- SOS-01: A high-priority SOS trigger on the Member's dashboard (3-second hold to prevent fat-finger triggers).
- SOS-02: Instant high-priority notifications to all linked Guardians.
- SOS-03: "I'm Safe" resolution flow to clear active alerts.

### 3.5 Notifications
- NOT-01: Local reminders for medication times (even when app is in background/closed).
- NOT-02: Remote push notifications from Member to Guardian for missed doses and SOS alerts.

## 4. User Experience (UX) Goals
- **Premium Look**: Glassmorphic UI with vibrant emerald accents (#19e66f).
- **Accessibility**: Large touch targets, clear typography, and minimal navigation steps.
- **Reliability**: Zero-latency synchronization using Firestore real-time listeners.
