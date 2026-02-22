import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Share, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react-native';

export default function CaregiverReportsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>History & Reports</Text>
                    <Text style={styles.headerSubtitle}>Monitor patient adherence</Text>
                </View>
                <TouchableOpacity style={styles.shareBtn}>
                    <Share size={20} color="#19e66f" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Patient Selector */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Select Patient</Text>
                </View>
                <TouchableOpacity style={styles.patientSelector} activeOpacity={0.8}>
                    <Text style={styles.patientSelectorText}>Robert Brown</Text>
                    <ChevronDown size={20} color="#64748b" />
                </TouchableOpacity>

                {/* Adherence Chart */}
                <View style={[styles.section, { marginTop: 24 }]}>
                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <View>
                                <Text style={styles.chartLabel}>Weekly Adherence</Text>
                                <Text style={[styles.chartValue, { color: '#ef4444' }]}>72%</Text>
                            </View>
                            <View style={[styles.chartBadge, { backgroundColor: '#fee2e2' }]}>
                                <Text style={[styles.chartBadgeText, { color: '#ef4444' }]}>-8% vs last week</Text>
                            </View>
                        </View>

                        <View style={styles.chartBars}>
                            {[90, 100, 30, 60, 0, 0, 0].map((h, i) => (
                                <View key={i} style={[styles.chartBarCol, h === 0 && { opacity: 0.3 }]}>
                                    <View style={[
                                        styles.chartBar,
                                        { height: `${h || 10}%` },
                                        i === 2 && { backgroundColor: '#fca5a5' },
                                        i === 3 && { backgroundColor: '#fcd34d' },
                                        i < 2 && { backgroundColor: '#19e66f' }
                                    ]} />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Logs */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Logs - Robert</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>SEE ALL</Text></TouchableOpacity>
                    </View>

                    <View style={styles.logsList}>
                        <View style={styles.logCard}>
                            <View style={[styles.logIcon, { backgroundColor: '#fef3c7' }]}>
                                <Clock size={24} color="#f59e0b" />
                            </View>
                            <View style={styles.logInfo}>
                                <View style={styles.logTitleRow}>
                                    <Text style={styles.logName}>Metformin</Text>
                                    <Text style={styles.logTime}>Today</Text>
                                </View>
                                <Text style={styles.logDesc}>Taken at 10:30 AM <Text style={{ color: '#f59e0b' }}>(2h late)</Text></Text>
                            </View>
                        </View>

                        <View style={styles.logCard}>
                            <View style={[styles.logIcon, { backgroundColor: '#fee2e2' }]}>
                                <XCircle size={24} color="#ef4444" />
                            </View>
                            <View style={styles.logInfo}>
                                <View style={styles.logTitleRow}>
                                    <Text style={styles.logName}>Lisinopril</Text>
                                    <Text style={styles.logTime}>Yesterday</Text>
                                </View>
                                <Text style={styles.logDesc}>Missed morning dose</Text>
                            </View>
                        </View>

                        <View style={styles.logCard}>
                            <View style={[styles.logIcon, { backgroundColor: '#e8fdf1' }]}>
                                <CheckCircle size={24} color="#19e66f" />
                            </View>
                            <View style={styles.logInfo}>
                                <View style={styles.logTitleRow}>
                                    <Text style={styles.logName}>Atorvastatin</Text>
                                    <Text style={styles.logTime}>Mon</Text>
                                </View>
                                <Text style={styles.logDesc}>Taken at 8:02 AM <Text style={{ color: '#19e66f' }}>(on time)</Text></Text>
                            </View>
                        </View>
                    </View>
                </View>
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
