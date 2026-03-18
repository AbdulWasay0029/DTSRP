import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Share, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react-native';
import { useMedicineStore } from '../../../libs/medicineStore';

export default function CaregiverReportsScreen() {
    const { patients, medicines, logs } = useMedicineStore();
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    const adherenceStats = useMemo(() => {
        if (!selectedPatientId) return { current: 0, chart: [0, 0, 0, 0, 0, 0, 0] };

        const pMeds = medicines.filter(m => m.patientId === selectedPatientId);
        let total = 0;
        let taken = 0;

        const today = new Date();
        const chart = [0, 0, 0, 0, 0, 0, 0];

        // Basic 7-day adherence calculation
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];

            let dayTotal = 0;
            let dayTaken = 0;

            pMeds.forEach(m => {
                m.times.forEach(t => {
                    dayTotal++;
                    if (i === 6) total++;
                    const log = logs.find(l => l.medicineId === m.id && l.date.startsWith(dateStr) && (l.expectedTime === t || !l.expectedTime));
                    if (log?.status === 'taken') {
                        dayTaken++;
                        if (i === 6) taken++;
                    }
                });
            });
            chart[i] = dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 0;
        }

        const current = total > 0 ? Math.round((taken / total) * 100) : 100;
        return { current, chart };
    }, [selectedPatientId, medicines, logs]);

    const recentLogs = useMemo(() => {
        if (!selectedPatientId) return [];
        const pMeds = medicines.filter(m => m.patientId === selectedPatientId);
        const medIds = pMeds.map(m => m.id);
        const pLogs = logs.filter(l => medIds.includes(l.medicineId));

        return pLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map(l => {
            const med = medicines.find(m => m.id === l.medicineId);
            return { ...l, med };
        });
    }, [selectedPatientId, medicines, logs]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>History & Reports</Text>
                    <Text style={styles.headerSubtitle}>Monitor family adherence</Text>
                </View>
                <TouchableOpacity style={styles.shareBtn}>
                    <Share size={20} color="#19e66f" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {patients.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 40, color: '#64748b' }}>No family members connected.</Text>
                ) : (
                    <>
                        {/* Patient Selector */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Select Family Member</Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
                            {patients.map(p => (
                                <TouchableOpacity
                                    key={p.id}
                                    style={[styles.patientSelector, selectedPatientId === p.id && { borderColor: '#19e66f', backgroundColor: 'rgba(25, 230, 111, 0.05)' }]}
                                    onPress={() => setSelectedPatientId(p.id)}
                                >
                                    <Image source={{ uri: `https://ui-avatars.com/api/?name=${p.name}&background=0f172a&color=fff` }} style={{ width: 24, height: 24, borderRadius: 12 }} />
                                    <Text style={[styles.patientSelectorText, selectedPatientId === p.id && { color: '#0f172a' }]}>{p.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Adherence Chart */}
                        <View style={[styles.section, { marginTop: 24 }]}>
                            <View style={styles.chartCard}>
                                <View style={styles.chartHeader}>
                                    <View>
                                        <Text style={styles.chartLabel}>Today&apos;s Adherence</Text>
                                        <Text style={[styles.chartValue, adherenceStats.current < 50 && { color: '#ef4444' }]}>{adherenceStats.current}%</Text>
                                    </View>
                                </View>

                                <View style={styles.chartBars}>
                                    {adherenceStats.chart.map((h, i) => (
                                        <View key={i} style={[styles.chartBarCol, h === 0 && { opacity: 0.3 }]}>
                                            <View style={[
                                                styles.chartBar,
                                                { height: `${Math.max(10, h)}%` },
                                                h <= 50 && { backgroundColor: '#fca5a5' },
                                                h > 50 && h < 90 && { backgroundColor: '#fcd34d' },
                                                h >= 90 && { backgroundColor: '#19e66f' }
                                            ]} />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Logs */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Logs - {selectedPatient?.name.split(' ')[0]}</Text>
                            </View>

                            <View style={styles.logsList}>
                                {recentLogs.length === 0 ? (
                                    <Text style={{ color: '#64748b' }}>No recent logs found.</Text>
                                ) : recentLogs.map(log => (
                                    <View key={log.id} style={styles.logCard}>
                                        <View style={[styles.logIcon, log.status === 'taken' ? { backgroundColor: '#e8fdf1' } : { backgroundColor: '#fee2e2' }]}>
                                            {log.status === 'taken' ? <CheckCircle size={24} color="#19e66f" /> : <XCircle size={24} color="#ef4444" />}
                                        </View>
                                        <View style={styles.logInfo}>
                                            <View style={styles.logTitleRow}>
                                                <Text style={styles.logName}>{log.med?.name || 'Unknown'}</Text>
                                                <Text style={styles.logTime}>{new Date(log.date).toLocaleDateString()}</Text>
                                            </View>
                                            <Text style={styles.logDesc}>
                                                {log.status === 'taken' ? 'Marked as taken' : 'Missed morning dose'}
                                                {log.expectedTime ? ` at ${log.expectedTime}` : ''}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f8f7' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 24, paddingTop: 60, backgroundColor: '#fff' },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#0f172a' },
    headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    shareBtn: { padding: 12, backgroundColor: '#e8fdf1', borderRadius: 24 },
    content: { padding: 24, paddingBottom: 100 },

    patientSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    patientSelectorText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },

    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a' },
    dateRange: { fontSize: 12, fontWeight: '500', color: '#94a3b8' },
    seeAll: { fontSize: 12, fontWeight: '700', color: '#19e66f', letterSpacing: 1 },

    chartCard: { backgroundColor: '#fff', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
    chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    chartLabel: { fontSize: 14, fontWeight: '500', color: '#64748b' },
    chartValue: { fontSize: 36, fontWeight: '700', color: '#0f172a', marginTop: 4 },
    chartBadge: { backgroundColor: '#e8fdf1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    chartBadgeText: { fontSize: 12, fontWeight: '700', color: '#19e66f' },
    chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, gap: 8 },
    chartBarCol: { flex: 1, height: '100%', justifyContent: 'flex-end' },
    chartBar: { width: '100%', backgroundColor: '#dcfce7', borderTopLeftRadius: 8, borderTopRightRadius: 8 },

    logsList: { gap: 12 },
    logCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
    logIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    logInfo: { flex: 1 },
    logTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    logName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
    logTime: { fontSize: 12, fontWeight: '500', color: '#94a3b8' },
    logDesc: { fontSize: 14, color: '#64748b', marginTop: 4 }
});
