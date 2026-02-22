import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../libs/store';
import { View, ActivityIndicator, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

function useProtectedRoute() {
    const { user, profile, initialized } = useAuthStore();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (!initialized) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user || !profile) {
            // User is not logged in / fully completed
            if (!inAuthGroup && segments.length > 0) {
                router.replace('/(auth)/login');
            }
        } else {
            // User is logged in
            const role = profile.role;
            // Unauthenticated users cannot access patient/caregiver routes. Role-based routing enforced strictly.
            if (role === 'patient' && segments[0] !== '(patient)') {
                router.replace('/(patient)/(tabs)');
            } else if (role === 'caregiver' && segments[0] !== '(caregiver)') {
                router.replace('/(caregiver)/(tabs)');
            }
        }
    }, [initialized, user, profile, segments, router]);
}

export default function RootLayout() {
    const { initialized } = useAuthStore();

    useProtectedRoute();

    useEffect(() => {
        // Listener for foreground notifications
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            const { title, body } = notification.request.content;
            const data = notification.request.content.data;

            if (data?.type === 'sos') {
                Alert.alert(`🚨 ${title || 'SOS Alert'}`, body || 'A patient needs assistance.', [
                    { text: 'View Patient', onPress: () => { } }
                ]);
            } else if (data?.type === 'missed_dose') {
                Alert.alert(`⚠️ ${title || 'Missed Dose'}`, body || 'A medication dose was missed.');
            }
        });

        return () => subscription.remove();
    }, []);

    if (!initialized) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f6f8f7', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#19e66f" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(patient)" options={{ headerShown: false }} />
                <Stack.Screen name="(caregiver)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
        </SafeAreaProvider>
    );
}
