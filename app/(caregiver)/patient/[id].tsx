import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MoreHorizontal, Check, Phone, AlertTriangle, Pill, Bed, CheckCircle2, Clock, CheckCircle } from 'lucide-react-native';
import { useMedicineStore } from '../../../libs/medicineStore';

export default function MemberDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { patients, medicines, logs } = useMedicineStore();

    const [loading, setLoading] = useState(true);

    const patient = patients.find(p => p.id === id);
    const patientMeds = medicines.filter(m => m.patientId === id);

    useEffect(() => {
        // Mock loading for smoothness
        setTimeout(() => setLoading(false), 300);
    }, []);

    if (loading || !patient) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#19e66f" />
            </SafeAreaView>
        );
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Compute stats
    let totalDoses = 0;
    let takenDoses = 0;
    let missedDoses = 0;
    const scheduleItems: any[] = [];
    const recentAlerts: any[] = [];
    let nextDoseTime: string | null = null;
    let nextDoseMin = Infinity;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    patientMeds.forEach(m => {
        m.times.forEach(t => {
            totalDoses++;
            const log = logs.find(l => l.medicineId === m.id && l.date.startsWith(todayStr) && (l.expectedTime === t || !l.expectedTime));

            let h = 0, min = 0;
            if (t.includes(':')) {
                const parts = t.trim().split(/[:\s]/); // Split by colon or space
                h = parseInt(parts[0], 10);
                min = parseInt(parts[1], 10);
                
                // If it was in AM/PM format (legacy data support)
                if (t.toUpperCase().includes('PM') && h !== 12) h += 12;
                if (t.toUpperCase().includes('AM') && h === 12) h = 0;
            }
            
            if (isNaN(h) || isNaN(min)) return;
            
            const tMins = h * 60 + min;
            let status = 'upcoming';

            if (log?.status === 'taken') {
                takenDoses++;
                status = 'taken';
            } else if (log?.status === 'missed') {
                missedDoses++;
                status = 'alert';
                recentAlerts.push({
                    id: m.id + t,
                    title: `Missed ${m.name}`,
                    desc: `Today at ${t} - ${m.dosage}`
                });
            } else if (tMins < currentMins - 60) {
                // If it's more than an hour past and no log, it's missed
                status = 'alert';
                missedDoses++;
                recentAlerts.push({
                    id: m.id + t,
                    title: `Missed ${m.name}`,
                    desc: `Today at ${t} - ${m.dosage}`
                });
            } else if (tMins >= currentMins && tMins < currentMins + 120) {
                // Next upcoming within 2 hrs
                status = 'current';
            }

            if (status === 'upcoming' || status === 'current') {
                if (tMins > currentMins && tMins < nextDoseMin) {
                    nextDoseMin = tMins;
                    nextDoseTime = t;
                }
            }

            scheduleItems.push({
                id: m.id + t,
                med: m,
                time: t,
                tMins,
                status
            });
        });
    });

    scheduleItems.sort((a, b) => a.tMins - b.tMins);

    const onTimeRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    let overallStatusDesc = "All doses taken today";
    if (missedDoses > 0) overallStatusDesc = "Missed doses detected";
    else if (totalDoses === 0) overallStatusDesc = "No medicines scheduled";
    else if (takenDoses < totalDoses) overallStatusDesc = "On track for today";

    const weeklyStats = React.useMemo(() => {
        const today = new Date();
        const chart = [0, 0, 0, 0, 0, 0, 0];
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const dayLabels = ['', '', '', '', '', '', ''];

        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            dayLabels[i] = days[d.getDay()];

            let dayTotal = 0;
            let dayTaken = 0;

            patientMeds.forEach(m => {
                m.times.forEach(t => {
                    dayTotal++;
                    const log = logs.find(l => l.medicineId === m.id && l.date.startsWith(dateStr) && (l.expectedTime === t || !l.expectedTime));
                    if (log?.status === 'taken') {
                        dayTaken++;
                    }
                });
            });
            chart[i] = dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 0;
        }

        return { chart, dayLabels };
    }, [patientMeds, logs]);

    const handleCall = () => {
        Linking.openURL(`tel:911`); // Defaulting to emergency line as no phone numbers in V1 
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Family Detail</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Patient Profile Card */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: `https://ui-avatars.com/api/?name=${patient.name}&background=19e66f&color=fff&size=200` }}
                            style={styles.avatar}
                        />
                        <View style={styles.avatarBadge}>
                            <Check size={16} color="#0f172a" strokeWidth={4} />
                        </View>
                    </View>

                    <Text style={styles.profileName}>{patient.name}</Text>
                    <Text style={styles.profileStatus}>{overallStatusDesc}</Text>

                    <TouchableOpacity style={styles.callBtn} activeOpacity={0.9} onPress={handleCall}>
                        <Text style={styles.callBtnText}>Call {patient.name.split(' ')[0]}</Text>
                    </TouchableOpacity>
                    <Text style={styles.roleLabel}>Family Member</Text>
                </View>

                {/* Quick Metrics */}
                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>On-time Rate</Text>
                        <View style={styles.metricValRow}>
                            <Text style={styles.metricBig}>{onTimeRate}%</Text>
                        </View>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Next Dose</Text>
                        <View style={styles.metricValRow}>
                            <Text style={styles.metricBig}>{nextDoseTime || '--:--'}</Text>
                        </View>
                    </View>
                </View>



                {/* Weekly Overview */}
                <View style={styles.chartSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Weekly Overview</Text>
                        <Text style={styles.chartSub}>Past 7 Days</Text>
                    </View>

                    <View style={styles.chartWrapper}>
                        {weeklyStats.chart.map((perc, idx) => (
                            <View key={idx} style={styles.chartCol}>
                                <View style={[styles.chartBarBg, { height: '100%' }]}>
                                    <View style={[styles.chartBarFill, {
                                        height: `${Math.max(10, perc)}%`,
                                        borderTopLeftRadius: 4,
                                        borderTopRightRadius: 4
                                    }]} />
                                </View>
                                <Text style={[styles.chartDayText, idx === 6 && { fontWeight: '700', color: '#0f172a' }]}>{weeklyStats.dayLabels[idx]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Today's Schedule */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{patient.name.split(' ')[0]}'s Schedule - Today</Text>
                        <View style={styles.progressPill}>
                            <Text style={styles.progressPillText}>{takenDoses} / {totalDoses} Done</Text>
                        </View>
                    </View>

                    <View style={styles.scheduleList}>
                        {scheduleItems.length === 0 && (
                            <Text style={styles.emptyText}>No medications scheduled for today.</Text>
                        )}

                        {scheduleItems.map((item, idx) => {
                            if (item.status === 'taken') {
                                return (
                                    <View key={idx} style={styles.takenItemCard}>
                                        <View style={styles.itemRow}>
                                            <View style={styles.takenIconBox}>
                                                <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/19e66f/pill.png' }} style={{ width: 24, height: 24 }} />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 16 }}>
                                                <Text style={styles.itemTitle}>{item.med.name}</Text>
                                                <Text style={styles.itemDesc}>{item.med.dosage} • Taken {item.time}</Text>
                                            </View>
                                            <CheckCircle size={28} color="#19e66f" />
                                        </View>
                                    </View>
                                );
                            } else if (item.status === 'current') {
                                return (
                                    <View key={idx} style={styles.currentItemCard}>
                                        <View style={styles.itemRow}>
                                            <View style={styles.currentIconBox}>
                                                <Clock size={24} color="#0f172a" />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 16 }}>
                                                <Text style={styles.itemTitle}>{item.med.name}</Text>
                                                <Text style={styles.itemDesc}>{item.med.dosage} • Due {item.time}</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            } else if (item.status === 'alert') {
                                return (
                                    <View key={idx} style={[styles.currentItemCard, { borderColor: '#ef4444' }]}>
                                        <View style={styles.itemRow}>
                                            <View style={[styles.currentIconBox, { backgroundColor: '#fee2e2' }]}>
                                                <AlertTriangle size={24} color="#ef4444" />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 16 }}>
                                                <Text style={styles.itemTitle}>{item.med.name}</Text>
                                                <Text style={[styles.itemDesc, { color: '#ef4444' }]}>{item.med.dosage} • Missed {item.time}</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            } else {
                                // upcoming
                                return (
                                    <View key={idx} style={styles.futureItemCard}>
                                        <View style={styles.itemRow}>
                                            <View style={styles.futureIconBox}>
                                                <Clock size={24} color="#94a3b8" />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 16 }}>
                                                <Text style={styles.itemTitle}>{item.med.name}</Text>
                                                <Text style={styles.itemDesc}>{item.med.dosage} • Due {item.time}</Text>
                                            </View>
                                            <View style={styles.emptyCircle} />
                                        </View>
                                    </View>
                                );
                            }
                        })}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f8f7' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
        backgroundColor: 'rgba(246, 248, 247, 0.9)',
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    iconBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(15, 23, 42, 0.05)' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },

    scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },

    profileSection: { alignItems: 'center', marginBottom: 24 },
    avatarWrapper: { position: 'relative', marginBottom: 16 },
    avatar: { width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: '#19e66f' },
    avatarBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: '#19e66f', width: 32, height: 32, borderRadius: 16, borderWidth: 4, borderColor: '#f6f8f7', alignItems: 'center', justifyContent: 'center' },
    profileName: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    profileStatus: { fontSize: 14, fontWeight: '500', color: '#64748b', marginBottom: 24 },
    callBtn: { width: '100%', maxWidth: 400, backgroundColor: '#19e66f', paddingVertical: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: 'rgba(25, 230, 111, 0.2)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 6 },
    callBtnText: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    roleLabel: { fontSize: 10, fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: 1, marginTop: 12 },

    metricsGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    metricCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    metricLabel: { fontSize: 14, color: '#64748b', marginBottom: 8 },
    metricValRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    metricBig: { fontSize: 24, fontWeight: '700', color: '#0f172a' },

    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    viewAllText: { fontSize: 14, fontWeight: '600', color: '#19e66f' },

    alertCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fef2f2', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', padding: 16, borderRadius: 16, marginBottom: 12 },
    alertTitle: { fontSize: 14, fontWeight: '700', color: '#7f1d1d', marginBottom: 4 },
    alertDesc: { fontSize: 12, color: '#b91c1c' },

    chartSection: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    chartSub: { fontSize: 12, color: '#94a3b8' },
    chartWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, paddingTop: 16, paddingHorizontal: 8 },
    chartCol: { alignItems: 'center', flex: 1, gap: 8, height: '100%' },
    chartBarBg: { width: '100%', backgroundColor: 'rgba(25, 230, 111, 0.2)', borderTopLeftRadius: 4, borderTopRightRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
    chartBarFill: { width: '100%', backgroundColor: '#19e66f' },
    chartDayText: { fontSize: 10, color: '#94a3b8' },

    progressPill: { backgroundColor: 'rgba(25, 230, 111, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    progressPillText: { fontSize: 12, fontWeight: '700', color: '#19e66f' },

    scheduleList: { gap: 12 },
    emptyText: { color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginVertical: 12 },

    itemRow: { flexDirection: 'row', alignItems: 'center' },
    itemTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    itemDesc: { fontSize: 12, color: '#64748b' },

    takenItemCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
    takenIconBox: { width: 48, height: 48, backgroundColor: 'rgba(25, 230, 111, 0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    currentItemCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: '#19e66f', shadowColor: 'rgba(25, 230, 111, 0.1)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 },
    currentIconBox: { width: 48, height: 48, backgroundColor: '#19e66f', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    notifyBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    notifyBtnText: { fontSize: 12, fontWeight: '700', color: '#0f172a' },

    futureItemCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', opacity: 0.7 },
    futureIconBox: { width: 48, height: 48, backgroundColor: '#e2e8f0', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    emptyCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#cbd5e1' }
});
