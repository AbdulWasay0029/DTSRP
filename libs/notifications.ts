import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medicine } from './medicineStore';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

// Configure android channel for high priority
export async function ensureNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#19e66f',
        sound: 'default',
    });
  }
}

export async function requestNotificationPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    return finalStatus === 'granted';
}

export async function cancelMedicineNotifications(notificationIds?: string[]) {
    if (!notificationIds) return;
    for (const id of notificationIds) {
        try {
            await Notifications.cancelScheduledNotificationAsync(id);
        } catch (e) {
            console.log('Error cancelling notification', id, e);
        }
    }
}

export async function scheduleMedicineNotifications(med: Medicine): Promise<string[]> {
    await ensureNotificationChannel();
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
        throw new Error('Notification permissions not granted');
    }
    if (!med.reminderEnabled) return [];

    let newIds: string[] = [];

    for (const t of med.times) {
        // Unique identifier for each notification to prevent collision if multiple are scheduled at once
        const uniqueId = `${med.id}_${t.replace(/[:\s]/g, '')}`;

        // Expected format is "HH:mm" (24h)
        const parts = t.split(':');
        if (parts.length < 2) continue;
        
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);

        if (isNaN(hours) || isNaN(minutes)) continue;

        const id = await Notifications.scheduleNotificationAsync({
            identifier: uniqueId,
            content: {
                title: `Time for ${med.name}`,
                body: `Dose: ${med.dosage}. Meal: ${med.mealRelation}`,
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.MAX,
                data: { medicineId: med.id },
                // @ts-ignore
                channelId: 'medication-reminders',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: hours,
                minute: minutes,
                preciseSchedules: true,
            } as Notifications.DailyTriggerInput,
        });
        newIds.push(id);
    }

    return newIds;
}

export async function syncAllNotifications(medicines: Medicine[]) {
    const validIds = new Set<string>();

    // Check all medicines in Firestore
    for (const med of medicines) {
        if (med.reminderEnabled) {
            if (med.notificationIds && med.notificationIds.length > 0) {
                // If it already has scheduled notifications saved, we assume they are valid
                med.notificationIds.forEach(id => validIds.add(id));
            }
        }
    }

    // Fetch EXPO's currently scheduled native notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    // Diff to find orphans
    for (const notif of scheduled) {
        if (!validIds.has(notif.identifier)) {
            try {
                // Not in our valid Firebase tree, cancel it!
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            } catch (e) {
                console.log('Error canceling orphan notification', e);
            }
        }
    }

    return validIds; // Could return updated state if we re-scheduled missing ones, but for now we preserve sync purely on orphan deletion so as to not over-schedule
}
