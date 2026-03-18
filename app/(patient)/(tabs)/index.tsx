import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pill, CheckCircle2, AlertCircle, Settings } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../../../libs/store';
import { useMedicineStore, Medicine } from '../../../libs/medicineStore';

interface Dose {
    id: string;
    medicine: Medicine;
    timeStr: string;
    timeMs: number;
    isTaken: boolean;
}

const parseTimeMs = (timeStr: string): number => {
    try {
        const [time, period] = timeStr.trim().split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        const now = new Date();
        now.setHours(hours, minutes, 0, 0);
        return now.getTime();
    } catch {
        return Date.now();
    }
};

export default function PatientDashboard() {
    const router = useRouter();
    const { user, profile } = useAuthStore();
    const { medicines, logs, fetchPatientData, markTaken, loading } = useMedicineStore();

    const [todayDoses, setTodayDoses] = useState<Dose[]>([]);
    const [permissionDenied, setPermissionDenied] = useState(false);

    useEffect(() => {
        if (user) {
            fetchPatientData();
        }
    }, [user, fetchPatientData]);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await Notifications.getPermissionsAsync();
                if (status === 'denied') {
                    setPermissionDenied(true);
                }
            }
        })();
    }, []);

    useEffect(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const doses: Dose[] = [];

        medicines.forEach(med => {
            med.times.forEach((t, i) => {
                const doseTimeMs = parseTimeMs(t);
                const takenLog = logs.find(l =>
                    l.medicineId === med.id &&
                    l.status === 'taken' &&
                    l.date.startsWith(todayStr) &&
                    (l.expectedTime === t || !l.expectedTime)
                );

                doses.push({
                    id: `${med.id}-${i}`,
                    medicine: med,
                    timeStr: t,
                    timeMs: doseTimeMs,
                    isTaken: !!takenLog
                });
            });
        });

        doses.sort((a, b) => a.timeMs - b.timeMs);
        setTodayDoses(doses);
    }, [medicines, logs]);

    const stats = {
        total: todayDoses.length,
        taken: todayDoses.filter(d => d.isTaken).length,
        pending: todayDoses.filter(d => !d.isTaken && d.timeMs > Date.now()).length,
        missed: todayDoses.filter(d => !d.isTaken && d.timeMs <= Date.now()).length,
    };

    if (loading && todayDoses.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#19e66f" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {permissionDenied && (
                <View style={styles.permissionBanner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <AlertCircle color="#ea580c" size={20} />
                        <Text style={styles.permissionText}>Notifications disabled</Text>
                    </View>
                    <TouchableOpacity onPress={() => Linking.openSettings()}>
                        <Text style={styles.permissionBtn}>Enable</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.name}>{profile?.name?.split(' ')[0]} 👋</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => router.push('/(patient)/(tabs)/settings' as any)}
                    >
                        <Settings size={22} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    {[
                        { label: 'Total', val: stats.total, color: '#6366F1' },
                        { label: 'Taken', val: stats.taken, color: '#10B981' },
                        { label: 'Pending', val: stats.pending, color: '#F59E0B' },
                        { label: 'Missed', val: stats.missed, color: '#EF4444' },
                    ].map(s => (
                        <View key={s.label} style={styles.statCard}>
                            <Text style={[styles.statNum, { color: s.color }]}>{s.val}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.scheduleSection}>
                    <Text style={styles.sectionTitle}>Today's Schedule</Text>
                    <View style={styles.scheduleList}>
                        {todayDoses.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Pill size={48} color="#cbd5e1" />
                                <Text style={styles.emptyText}>No medicines scheduled for today.</Text>
                            </View>
                        ) : (
                            todayDoses.map((dose, idx) => (
                                <Animated.View
                                    entering={FadeInDown.delay(idx * 50)}
                                    key={dose.id}
                                    style={[styles.medCard, dose.isTaken && styles.medCardTaken]}
                                >
                                    <View style={styles.medIconBox}>
                                        <Pill color={dose.isTaken ? "#94a3b8" : "#19e66f"} size={22} />
                                    </View>
                                    <View style={styles.medInfo}>
                                        <Text style={[styles.medName, dose.isTaken && styles.medNameTaken]}>{dose.medicine.name}</Text>
                                        <Text style={styles.medTime}>{dose.timeStr} • {dose.medicine.dosage}</Text>
                                    </View>
                                    {!dose.isTaken ? (
                                        <TouchableOpacity 
                                            style={styles.actionBtn} 
                                            onPress={() => markTaken(dose.medicine.id, 'taken', dose.timeStr)}
                                        >
                                            <CheckCircle2 color="#19e66f" size={28} />
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.actionBtn}>
                                            <CheckCircle2 color="#94a3b8" size={28} />
                                        </View>
                                    )}
                                </Animated.View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f8f7' },
    permissionBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffedd5', paddingHorizontal: 20, paddingVertical: 10 },
    permissionText: { color: '#ea580c', fontWeight: '600', fontSize: 13, marginLeft: 8 },
    permissionBtn: { color: '#ba4305', fontWeight: '700', textDecorationLine: 'underline', fontSize: 13 },
    scrollContent: { paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16 },
    greeting: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    name: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginTop: 4 },
    settingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 24 },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    statNum: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '600' },
    scheduleSection: { paddingHorizontal: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
    scheduleList: { gap: 12 },
    medCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    medCardTaken: { opacity: 0.6, backgroundColor: '#f8fafc' },
    medIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
    medInfo: { flex: 1, marginLeft: 16 },
    medName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
    medNameTaken: { textDecorationLine: 'line-through' },
    medTime: { fontSize: 13, color: '#64748b', marginTop: 4 },
    actionBtn: { padding: 4 },
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyText: { color: '#64748b', marginTop: 12, fontSize: 14 }
});
