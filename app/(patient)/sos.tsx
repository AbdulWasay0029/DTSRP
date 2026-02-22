import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, PhoneCall, CheckCircle, Pointer } from 'lucide-react-native';
import { useAuthStore } from '../../libs/store';
import { db } from '../../libs/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function SOSScreen() {
    const router = useRouter();
    const { profile } = useAuthStore();

    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const [alertTriggered, setAlertTriggered] = useState(false);

    // Simulated hold-to-trigger
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isHolding && !alertTriggered) {
            interval = setInterval(() => {
                setHoldProgress(prev => {
                    if (prev >= 3) {
                        setAlertTriggered(true);
                        setIsHolding(false);
                        return 3;
                    }
                    return prev + 0.1;
                });
            }, 100);
        } else {
            if (!alertTriggered) {
                setHoldProgress(0);
            }
        }
        return () => clearInterval(interval);
    }, [isHolding, alertTriggered]);

    useEffect(() => {
        if (alertTriggered) {
            triggerEmergency();
        }
    }, [alertTriggered]);

    const triggerEmergency = async () => {
        try {
            // Find all connected caregivers
            const qConn = query(collection(db, 'Connections'), where('patientId', '==', profile?.id), where('status', '==', 'approved'));
            const connSnap = await getDocs(qConn);
            const caregiverIds = connSnap.docs.map(d => d.data().caregiverId);

            if (caregiverIds.length > 0) {
                // Get their push tokens
                const qUsers = query(collection(db, 'Users'), where('__name__', 'in', caregiverIds));
                const usersSnap = await getDocs(qUsers);

                const pushTokens: string[] = [];
                usersSnap.forEach(u => {
                    const data = u.data();
                    if (data.expoPushToken) pushTokens.push(data.expoPushToken);
                });

                // Send push notifications
                if (pushTokens.length > 0) {
                    await fetch('https://exp.host/--/api/v2/push/send', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Accept-encoding': 'gzip, deflate',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(pushTokens.map(token => ({
                            to: token,
                            sound: 'default',
                            title: '🚨 EMERGENCY ALERT',
                            body: `${profile?.name} has triggered an SOS alert!`,
                            data: { type: 'sos', patientId: profile?.id },
                            priority: 'high'
                        }))),
                    });
                }
            }

            Alert.alert(
                "Emergency Alert Sent!",
                "Your caregiver and emergency contacts have been notified.",
                [{ text: "OK" }]
            );
        } catch (error) {
            console.error("Failed to send SOS push notification:", error);
            Alert.alert("SOS Triggered", "We tried to notify your caregiver, but encountered an error. Please call them directly.");
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleCallCaregiver = () => {
        Alert.alert("Calling...", "Initiating call to primary caregiver.");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.locationBadge}>
                    <MapPin size={16} color="#19e66f" />
                    <Text style={styles.locationText}>Location being shared</Text>
                </View>
                <Text style={styles.title}>Emergency Alert</Text>
                <Text style={styles.subtitle}>
                    Hold for 3 seconds to alert your caregiver and emergency services.
                </Text>
            </View>

            <View style={styles.mainContent}>
                {/* Hold Status Bar */}
                <View style={styles.statusBarContainer}>
                    <View style={styles.statusRow}>
                        <Text style={styles.triggeringText}>{alertTriggered ? 'TRIGGERED!' : 'Triggering...'}</Text>
                        <Text style={styles.timerText}>{holdProgress.toFixed(1)}s <Text style={styles.timerSubText}>/ 3s</Text></Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${(holdProgress / 3) * 100}%` }]} />
                    </View>
                </View>

                {/* Central SOS Button */}
                <View style={styles.sosButtonContainer}>
                    <View style={styles.sosOuterRing1} />
                    <View style={styles.sosOuterRing2} />

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPressIn={() => setIsHolding(true)}
                        onPressOut={() => setIsHolding(false)}
                        style={[styles.sosButton, alertTriggered && styles.sosButtonTriggered]}
                        disabled={alertTriggered}
                    >
                        <Text style={styles.sosText}>SOS</Text>
                        {!alertTriggered && (
                            <View style={styles.holdRow}>
                                <Pointer size={18} color="#ffffff" />
                                <Text style={styles.holdText}>HOLD</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.callBtn} onPress={handleCallCaregiver}>
                        <View style={styles.callIconBox}>
                            <PhoneCall size={28} color="#19e66f" />
                        </View>
                        <Text style={styles.callText}>Call Caregiver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.safeBtn} onPress={handleCancel}>
                        <View style={styles.safeIconBox}>
                            <CheckCircle size={28} color="#112118" />
                        </View>
                        <Text style={styles.safeText}>I am Safe</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleCancel} style={styles.cancelWrap}>
                    <Text style={styles.cancelText}>Cancel Alert</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#7f1d1d', justifyContent: 'space-between', paddingHorizontal: 24 },
    header: { alignItems: 'center', paddingTop: 32 },
    locationBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, marginBottom: 12
    },
    locationText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    title: { fontSize: 28, fontWeight: '800', color: '#ffffff', textAlign: 'center', letterSpacing: -1 },
    subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', marginTop: 12, fontWeight: '500', maxWidth: 300 },

    mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 40 },

    // Status Bar
    statusBarContainer: { width: '100%', marginBottom: 40, paddingHorizontal: 16 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
    triggeringText: { fontSize: 14, fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: 1 },
    timerText: { fontSize: 24, fontWeight: '900', color: '#ffffff' },
    timerSubText: { fontSize: 16, fontWeight: '400', color: 'rgba(255, 255, 255, 0.4)' },
    progressBarBg: { height: 12, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 9999, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#19e66f', borderRadius: 9999 },

    // SOS Button
    sosButtonContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center', width: 240, height: 240 },
    sosOuterRing1: {
        position: 'absolute', width: 240, height: 240, borderRadius: 120,
        borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    sosOuterRing2: {
        position: 'absolute', width: 190, height: 190, borderRadius: 95,
        borderWidth: 4, borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    sosButton: {
        width: 140, height: 140, borderRadius: 70,
        backgroundColor: '#dc2626',
        borderWidth: 8, borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: 'rgba(220, 38, 38, 0.5)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 40, elevation: 20
    },
    sosButtonTriggered: { backgroundColor: '#19e66f', borderColor: 'rgba(255, 255, 255, 0.8)', shadowColor: '#19e66f' },
    sosText: { fontSize: 40, fontWeight: '900', color: '#ffffff', letterSpacing: -2 },
    holdRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    holdText: { fontSize: 12, fontWeight: '800', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: 2 },

    footer: { paddingBottom: 40 },
    actionGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    callBtn: {
        flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 20,
        padding: 16, alignItems: 'center', justifyContent: 'center', gap: 12,
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    callIconBox: { backgroundColor: 'rgba(25, 230, 111, 0.2)', padding: 12, borderRadius: 9999 },
    callText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },

    safeBtn: {
        flex: 1, backgroundColor: '#19e66f', borderRadius: 20,
        padding: 16, alignItems: 'center', justifyContent: 'center', gap: 12,
        shadowColor: 'rgba(25, 230, 111, 0.4)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 8
    },
    safeIconBox: { backgroundColor: 'rgba(0, 0, 0, 0.1)', padding: 12, borderRadius: 9999 },
    safeText: { fontSize: 16, fontWeight: '700', color: '#112118' },

    cancelWrap: { padding: 16, alignItems: 'center' },
    cancelText: { fontSize: 16, fontWeight: '600', color: 'rgba(255, 255, 255, 0.5)', textDecorationLine: 'underline' }
});
