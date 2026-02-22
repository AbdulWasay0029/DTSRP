import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pill, CheckCircle2, Circle, PhoneCall, AlertCircle, Activity, ChevronRight } from 'lucide-react-native';
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
    const { profile } = useAuthStore();
    const { medicines, logs, fetchPatientData, markTaken } = useMedicineStore();

    const [todayDoses, setTodayDoses] = useState<Dose[]>([]);
    const [nextDose, setNextDose] = useState<Dose | null>(null);
    const [timerTxt, setTimerTxt] = useState({ min: '00', sec: '00' });
    const [adherence, setAdherence] = useState(0);
    const [permissionDenied, setPermissionDenied] = useState(false);

    useEffect(() => {
        fetchPatientData();
    }, [fetchPatientData]);

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

    // Parse medicines into strict flat dose instances
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const doses: Dose[] = [];

        medicines.forEach(med => {
            med.times.forEach((t, i) => {
                // Check if taken today
                const takenLog = logs.find(l =>
                    l.medicineId === med.id &&
                    l.status === 'taken' &&
                    l.date.startsWith(today)
                );

                doses.push({
                    id: `${med.id}-${i}`,
                    medicine: med,
                    timeStr: t,
                    timeMs: parseTimeMs(t),
                    isTaken: !!takenLog
                });
            });
        });

        // Sort by time
        doses.sort((a, b) => a.timeMs - b.timeMs);
        setTodayDoses(doses);

        // Adherence
        const takenCount = doses.filter(d => d.isTaken).length;
        setAdherence(doses.length > 0 ? Math.round((takenCount / doses.length) * 100) : 0);

        // Next dose
        const pending = doses.filter(d => !d.isTaken);
        if (pending.length > 0) {
            setNextDose(pending[0]);
        } else {
            setNextDose(null);
        }
    }, [medicines, logs]);

    // Timer Tick
    useEffect(() => {
        if (!nextDose) return;

        const interval = setInterval(() => {
            const now = Date.now();
            let diff = nextDose.timeMs - now;

            if (diff < 0) {
                // Overdue
                diff = Math.abs(diff);
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimerTxt({ min: `-${minutes.toString().padStart(2, '0')}`, sec: seconds.toString().padStart(2, '0') });
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimerTxt({ min: minutes.toString().padStart(2, '0'), sec: seconds.toString().padStart(2, '0') });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [nextDose]);

    const handleMarkTaken = async () => {
        if (!nextDose) return;
        await markTaken(nextDose.medicine.id, 'taken', nextDose.timeStr);
    };

    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

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

                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good morning, {profile?.name?.split(' ')[0] || 'User'}</Text>
                        <Text style={styles.dateText}>{todayStr}</Text>
                    </View>
                    <View style={styles.progressCircle}>
                        <Text style={styles.progressText}>{adherence}%</Text>
                    </View>
                </View>

                {/* Main Adherence Metric (Alternative view) */}
                <View style={styles.adherenceWrapper}>
                    <View style={styles.adherenceCard}>
                        <Activity size={32} color="#19e66f" />
                        <View style={styles.adherenceTextCont}>
                            <Text style={styles.adherenceLabel}>DAILY ADHERENCE</Text>
                            <Text style={styles.adherenceValue}>
                                {adherence === 100 ? "Perfect! You're on track." :
                                    adherence > 50 ? "Great job! Keep it up today." :
                                        "Take your meds to improve adherence."}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Hero Card: Next Dose */}
                {nextDose ? (
                    <View style={styles.heroWrapper}>
                        <View style={styles.heroCard}>
                            <View style={styles.heroContent}>
                                <View style={styles.heroHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.nextDoseTag}>
                                            <Text style={styles.nextDoseTagText}>
                                                {nextDose.timeMs < Date.now() ? 'OVERDUE' : 'NEXT DOSE'}
                                            </Text>
                                        </View>
                                        <Text style={styles.heroTitle} numberOfLines={1}>{nextDose.medicine.name}</Text>
                                        <Text style={styles.heroSubtitle}>{nextDose.medicine.dosage} • {nextDose.timeStr}</Text>
                                    </View>
                                    <View style={styles.remindsInBox}>
                                        <Text style={styles.remindsInLabel}>{nextDose.timeMs < Date.now() ? 'PASSED' : 'IN'}</Text>
                                        <Text style={styles.remindsInValue}>{timerTxt.min}:{timerTxt.sec}</Text>
                                    </View>
                                </View>

                                {/* Large countdown visualization */}
                                <View style={styles.timerRow}>
                                    <View style={styles.timerBoxActive}>
                                        <Text style={styles.timerBigText}>{timerTxt.min.replace('-', '')}</Text>
                                        <Text style={styles.timerSmallText}>MINUTES</Text>
                                    </View>
                                    <View style={styles.timerBoxInactive}>
                                        <Text style={[styles.timerBigText, { color: '#94a3b8' }]}>{timerTxt.sec}</Text>
                                        <Text style={[styles.timerSmallText, { color: '#94a3b8' }]}>SECONDS</Text>
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.markBtn} activeOpacity={0.9} onPress={handleMarkTaken}>
                                    <CheckCircle2 color="#0f172a" size={28} />
                                    <Text style={styles.markBtnText}>Mark as Taken</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={[styles.heroWrapper, { paddingHorizontal: 24, marginBottom: 32 }]}>
                        <View style={[styles.heroCard, { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }]}>
                            <CheckCircle2 color="#19e66f" size={64} style={{ marginBottom: 16 }} />
                            <Text style={styles.heroTitle}>All Done!</Text>
                            <Text style={[styles.heroSubtitle, { textAlign: 'center' }]}>
                                {todayDoses.length === 0
                                    ? "No medicines scheduled for today."
                                    : "You have taken all your medicines for today."}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Today's Schedule */}
                <View style={styles.scheduleSection}>
                    <View style={styles.scheduleHeaderRow}>
                        <Text style={styles.sectionTitle}>Today's Schedule</Text>
                        <TouchableOpacity onPress={() => router.push('/(patient)/plan' as any)}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.scheduleList}>
                        {todayDoses.length === 0 ? (
                            <Text style={styles.emptyText}>No medicines to show.</Text>
                        ) : (
                            todayDoses.map((dose) => (
                                <View key={dose.id} style={[styles.medCard, dose.isTaken && styles.medCardTaken]}>
                                    <View style={[styles.medIconBox, dose.isTaken && { backgroundColor: '#f1f5f9' }]}>
                                        <Pill color={dose.isTaken ? "#94a3b8" : "#3b82f6"} size={24} />
                                    </View>
                                    <View style={styles.medInfo}>
                                        <Text style={[styles.medName, dose.isTaken && styles.medNameTaken]}>{dose.medicine.name}</Text>
                                        <Text style={styles.medTime}>{dose.timeStr} • {dose.medicine.dosage}</Text>
                                    </View>
                                    <View>
                                        {dose.isTaken ? (
                                            <CheckCircle2 color="#19e66f" size={28} />
                                        ) : (
                                            <Circle color="#cbd5e1" size={28} />
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>

            </ScrollView>

            {/* Persistent RED SOS Button */}
            <TouchableOpacity
                style={styles.sosFab}
                activeOpacity={0.9}
                onPress={() => router.push('/(patient)/sos' as any)}
            >
                <PhoneCall size={32} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f8f7' },
    scrollContent: { paddingBottom: 120, paddingTop: 10 },
    permissionBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#ffedd5', paddingHorizontal: 24, paddingVertical: 12,
    },
    permissionText: { color: '#ea580c', fontWeight: '600', marginLeft: 8, fontSize: 13 },
    permissionBtn: { color: '#ba4305', fontWeight: '700', textDecorationLine: 'underline', fontSize: 13 },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 24, marginBottom: 24,
    },
    greeting: { fontSize: 28, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 },
    dateText: { fontSize: 16, fontWeight: '500', color: '#64748b', marginTop: 4 },
    progressCircle: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: '#fff',
        borderWidth: 4, borderColor: 'rgba(25, 230, 111, 0.2)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    progressText: { fontSize: 18, fontWeight: '700', color: '#19e66f' },

    adherenceWrapper: { paddingHorizontal: 24, marginBottom: 24 },
    adherenceCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(25, 230, 111, 0.1)',
        borderWidth: 1, borderColor: 'rgba(25, 230, 111, 0.2)',
        borderRadius: 12,
    },
    adherenceTextCont: { marginLeft: 16, flex: 1 },
    adherenceLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(25, 230, 111, 0.8)', letterSpacing: 1, textTransform: 'uppercase' },
    adherenceValue: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginTop: 2 },

    heroWrapper: { paddingHorizontal: 24, marginBottom: 32 },
    heroCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1, borderColor: '#f1f5f9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 6,
        overflow: 'hidden',
    },
    heroContent: { padding: 24 },
    heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    nextDoseTag: {
        backgroundColor: '#ffedd5', paddingHorizontal: 12, paddingVertical: 4,
        borderRadius: 9999, marginBottom: 8, alignSelf: 'flex-start'
    },
    nextDoseTagText: { fontSize: 10, fontWeight: '700', color: '#ea580c', letterSpacing: 1, textTransform: 'uppercase' },
    heroTitle: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
    heroSubtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
    remindsInBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, alignItems: 'center', minWidth: 80, marginLeft: 12 },
    remindsInLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' },
    remindsInValue: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginTop: 2 },

    timerRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    timerBoxActive: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f6f8f7', paddingVertical: 16,
        borderRadius: 12, borderWidth: 2, borderColor: 'rgba(25, 230, 111, 0.3)',
    },
    timerBoxInactive: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f6f8f7', paddingVertical: 16,
        borderRadius: 12, borderWidth: 2, borderColor: 'rgba(25, 230, 111, 0.1)',
    },
    timerBigText: { fontSize: 32, fontWeight: '700', color: '#0f172a' },
    timerSmallText: { fontSize: 12, fontWeight: '600', color: '#64748b', letterSpacing: 1, marginTop: 4, textTransform: 'uppercase' },

    markBtn: {
        backgroundColor: '#19e66f',
        paddingVertical: 20, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
        shadowColor: 'rgba(25, 230, 111, 0.3)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4,
    },
    markBtnText: { fontSize: 20, fontWeight: '700', color: '#0f172a' },

    scheduleSection: { paddingHorizontal: 24 },
    scheduleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
    viewAllText: { fontSize: 14, fontWeight: '600', color: '#19e66f' },
    scheduleList: { gap: 12 },
    medCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', padding: 16,
        borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9',
        borderLeftWidth: 4, borderLeftColor: '#3b82f6',
    },
    medCardTaken: {
        opacity: 0.6,
        borderLeftColor: '#cbd5e1',
        backgroundColor: '#f8fafc',
    },
    medIconBox: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: '#eff6ff',
        alignItems: 'center', justifyContent: 'center',
    },
    medInfo: { flex: 1, marginLeft: 16 },
    medName: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    medNameTaken: { textDecorationLine: 'line-through', color: '#94a3b8' },
    medTime: { fontSize: 14, fontWeight: '500', color: '#64748b', marginTop: 4 },
    emptyText: { color: '#64748b', textAlign: 'center', padding: 24 },

    sosFab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#dc2626', // emergency-red
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 4,
        borderColor: '#ffffff',
    }
});
