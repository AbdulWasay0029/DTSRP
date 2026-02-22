import * as Notifications from 'expo-notifications';
import { Medicine } from './medicineStore';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

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
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission || !med.reminderEnabled) return [];

    let newIds: string[] = [];

    for (const t of med.times) {
        if (med.frequency === '1 Min Test') {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Time for ${med.name}`,
                    body: `Dose: ${med.dosage}. Meal: ${med.mealRelation}`,
                    sound: true,
                },
                trigger: {
                    seconds: 60,
                    repeats: true,
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL
                } as any,
            });
            newIds.push(id);
        } else {
            const [timeStr, period] = t.split(' ');
            let [hours, minutes] = timeStr.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Time for ${med.name}`,
                    body: `Dose: ${med.dosage}. Meal: ${med.mealRelation}`,
                    sound: true,
                },
                trigger: {
                    hour: hours,
                    minute: minutes,
                    repeats: true,
                    type: Notifications.SchedulableTriggerInputTypes.CALENDAR
                } as any,
            });
            newIds.push(id);
        }
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
