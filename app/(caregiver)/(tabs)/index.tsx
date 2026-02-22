import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, ArrowRight, CheckCircle2, AlertTriangle, Plus } from 'lucide-react-native';
import Animated, { FadeInRight, FadeInUp, Layout } from 'react-native-reanimated';
import { useAuthStore } from '../../../libs/store';
import { useMedicineStore } from '../../../libs/medicineStore';

export default function CaregiverDashboard() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const { patients, medicines, logs, fetchCaregiverData } = useMedicineStore();

    useEffect(() => {
        fetchCaregiverData();
    }, [fetchCaregiverData]);

    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate Family Overall Adherence
    let familyTotalDoses = 0;
    let familyTakenDoses = 0;

    patients.forEach(p => {
        const pMeds = medicines.filter(m => m.patientId === p.id);
        pMeds.forEach(m => {
            m.times.forEach(t => {
                familyTotalDoses++;
                const log = logs.find(l => l.medicineId === m.id && l.date.startsWith(todayStr) && (l.expectedTime === t || !l.expectedTime) && l.status === 'taken');
                if (log) familyTakenDoses++;
            });
        });
    });

    const familyAdherence = familyTotalDoses > 0 ? Math.round((familyTakenDoses / familyTotalDoses) * 100) : 0;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerProfile}>
                    <View style={styles.avatarBox}>
                        <Image
                            source={{ uri: 'https://ui-avatars.com/api/?name=' + (profile?.name || 'Caregiver') + '&background=19e66f&color=fff' }}
                            style={styles.avatarImg}
                        />
                    </View>
                    <View>
                        <Text style={styles.greeting}>Good Morning,</Text>
                        <Text style={styles.name}>{profile?.name}</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Your Patients */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Patients</Text>
                    <TouchableOpacity style={styles.viewAllBtn}>
                        <Text style={styles.viewAllText}>View All</Text>
                        <ArrowRight size={16} color="#19e66f" />
                    </TouchableOpacity>
                </View>

                <View style={styles.patientsList}>
                    {patients.length === 0 ? (
                        <Text style={styles.emptyText}>No connected patients yet.</Text>
                    ) : (
                        patients.map((p, idx) => {
                            const pMeds = medicines.filter(m => m.patientId === p.id);
                            let totalDoses = 0;
                            let takenDoses = 0;
                            let missedDoses = 0;
                            let lastMissedMedName = '';

                            pMeds.forEach(m => {
                                m.times.forEach(t => {
                                    totalDoses++;
                                    const log = logs.find(l => l.medicineId === m.id && l.date.startsWith(todayStr) && (l.expectedTime === t || !l.expectedTime));
                                    if (log?.status === 'taken') takenDoses++;
                                    if (log?.status === 'missed') {
                                        missedDoses++;
                                        lastMissedMedName = m.name;
                                    }
                                });
                            });

                            const adherence = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;
                            const isAlert = missedDoses > 0;
                            const statusText = isAlert ? 'Alert' : 'Stable';

                            let statusDesc = isAlert ? `Missed: ${lastMissedMedName || "Medication"}` : 'On track for today';
                            if (totalDoses === 0) statusDesc = 'No medicines scheduled';

                            return (
                                <Animated.TouchableOpacity
                                    entering={FadeInRight.delay(idx * 150)}
                                    layout={Layout.springify()}
                                    key={p.id}
                                    style={[styles.patientCard, isAlert && styles.patientCardAlert]}
                                    activeOpacity={0.8}
                                    onPress={() => router.push(`/(caregiver)/patient/${p.id}` as any)}
                                >
                                    {isAlert && (
                                        <View style={styles.alertTag}>
                                            <AlertTriangle size={12} color="#fff" />
                                            <Text style={styles.alertTagText}>MISSED DOSE</Text>
                                        </View>
                                    )}

                                    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                                        <View style={styles.patientAvatarWrap}>
                                            <Image
                                                source={{ uri: 'https://ui-avatars.com/api/?name=' + p.name + '&background=0f172a&color=fff' }}
                                                style={styles.patientAvatar}
                                            />
                                            <View style={[styles.scoreBadge, isAlert && styles.scoreBadgeAlert]}>
                                                <Text style={styles.scoreText}>{adherence}%</Text>
                                            </View>
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <View style={styles.patientHeaderRow}>
                                                <Text style={styles.patientName}>{p.name}</Text>
                                                <View style={[styles.statusPill, isAlert && styles.statusPillAlert]}>
                                                    <Text style={[styles.statusPillText, isAlert && styles.statusPillTextAlert]}>{statusText}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.statusDescRow}>
                                                {isAlert ? (
                                                    <AlertTriangle size={14} color="#ef4444" />
                                                ) : (
                                                    <CheckCircle2 size={14} color="#19e66f" />
                                                )}
                                                <Text style={[styles.statusDescText, isAlert && { color: '#ef4444' }]}>
                                                    {statusDesc}
                                                </Text>
                                            </View>

                                            <View style={styles.progressBarBg}>
                                                <View style={[styles.progressBarFill, { width: `${adherence}%` }, isAlert && { backgroundColor: '#ef4444' }]} />
                                            </View>

                                        </View>
                                    </View>
                                </Animated.TouchableOpacity>
                            );
                        })
                    )}

                    {/* Add New Patient */}
                    <TouchableOpacity
                        style={styles.addPatientCard}
                        onPress={() => router.push('/(caregiver)/addPatient')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.addPatientIcon}>
                            <Plus size={32} color="#19e66f" />
                        </View>
                        <Text style={styles.addPatientText}>Add New Patient</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Overall Adherence</Text>
                    <View style={styles.statsCard}>
                        <View>
                            <Text style={styles.statsBigValue}>{familyAdherence ?? 0}%</Text>
                            <Text style={styles.statsSubtitle}>Daily Family Average</Text>
                        </View>
                        <View style={styles.chartMock}>
                            <View style={[styles.chartBar, { height: '50%', opacity: 0.2 }]} />
                            <View style={[styles.chartBar, { height: '75%', opacity: 0.2 }]} />
                            <View style={[styles.chartBar, { height: '66%', opacity: 0.4 }]} />
                            <View style={[styles.chartBar, { height: '83%', opacity: 0.3 }]} />
                            <View style={[styles.chartBar, { height: '100%', opacity: 1 }]} />
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f8f7' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20,
        backgroundColor: 'rgba(246, 248, 247, 0.9)',
    },
    headerProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarBox: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: '#19e66f' },
    avatarImg: { width: '100%', height: '100%' },
    greeting: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    name: { fontSize: 20, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 },

    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    viewAllText: { fontSize: 14, fontWeight: '600', color: '#19e66f' },
    emptyText: { color: '#64748b', textAlign: 'center', marginVertical: 20 },
    patientsList: { gap: 16 },

    patientCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
    patientCardAlert: { borderColor: 'rgba(239, 68, 68, 0.3)', borderWidth: 2 },
    alertTag: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', borderBottomLeftRadius: 12, paddingHorizontal: 12, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
    alertTagText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    patientAvatarWrap: { position: 'relative' },
    patientAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: 'rgba(25, 230, 111, 0.3)' },
    scoreBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#19e66f', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, borderWidth: 2, borderColor: '#fff' },
    scoreBadgeAlert: { backgroundColor: '#ef4444' },
    scoreText: { color: '#fff', fontSize: 10, fontWeight: '700' },

    patientHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    patientName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
    statusPill: { backgroundColor: 'rgba(25, 230, 111, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    statusPillAlert: { backgroundColor: 'transparent' },
    statusPillText: { fontSize: 10, fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: 1 },
    statusPillTextAlert: { display: 'none' },

    statusDescRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    statusDescText: { fontSize: 12, color: '#64748b', fontWeight: '500' },

    progressBarBg: { width: '100%', height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginTop: 12, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#19e66f', borderRadius: 3 },

    addPatientCard: { backgroundColor: 'transparent', borderRadius: 20, padding: 24, borderWidth: 2, borderColor: '#cbd5e1', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8 },
    addPatientIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(25, 230, 111, 0.1)', alignItems: 'center', justifyContent: 'center' },
    addPatientText: { fontSize: 14, fontWeight: '600', color: '#64748b' },

    statsSection: { marginTop: 32 },
    statsCard: { backgroundColor: 'rgba(25, 230, 111, 0.05)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(25, 230, 111, 0.1)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 },
    statsBigValue: { fontSize: 36, fontWeight: '700', color: '#19e66f' },
    statsSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    chartMock: { flexDirection: 'row', gap: 8, height: 64, alignItems: 'flex-end' },
    chartBar: { width: 8, backgroundColor: '#19e66f', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
});
