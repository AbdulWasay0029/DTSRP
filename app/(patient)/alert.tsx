import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BellRing, Pill, CheckCircle, Clock, XCircle, Info, Ban } from 'lucide-react-native';
import { useMedicineStore } from '../../libs/medicineStore';

export default function MedicineAlertScreen() {
    const router = useRouter();
    const { medicineId, timeStr } = useLocalSearchParams<{ medicineId: string, timeStr: string }>();
    const { medicines, markTaken } = useMedicineStore();

    const [med, setMed] = useState(medicines.find(m => m.id === medicineId));

    useEffect(() => {
        if (!med && medicineId) {
            setMed(medicines.find(m => m.id === medicineId));
        }
    }, [medicines, medicineId]);

    const handleAction = async (status: 'taken' | 'missed') => {
        if (medicineId && timeStr) {
            await markTaken(medicineId, status, timeStr);
        }
        router.back();
    };

    const handleSnooze = () => {
        // MVP: Just dismiss the alert, real snooze would re-trigger local notification
        router.back();
    };

    if (!med) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ textAlign: 'center', marginTop: 100 }}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.statusBadge}>
                    <BellRing size={20} color="#19e66f" />
                    <Text style={styles.statusText}>DUE NOW</Text>
                </View>
                <Text style={styles.title}>Time for your Medicine!</Text>
            </View>

            <View style={styles.mainContent}>
                <View style={styles.card}>
                    <View style={styles.imageHeader}>
                        <View style={styles.iconCircle}>
                            <Pill size={72} color="#19e66f" />
                        </View>
                    </View>
                    <View style={styles.cardBody}>
                        <Text style={styles.medName}>{med.name}</Text>
                        <Text style={styles.medDosage}>{med.dosage}</Text>

                        <View style={styles.infoRow}>
                            <Info size={18} color="#94a3b8" />
                            <Text style={styles.infoText}>{med.mealRelation || 'Take as directed'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.takenBtn} activeOpacity={0.9} onPress={() => handleAction('taken')}>
                    <CheckCircle size={32} color="#0f172a" strokeWidth={2.5} />
                    <Text style={styles.takenText}>Taken</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.snoozeBtn} activeOpacity={0.9} onPress={handleSnooze}>
                    <Clock size={24} color="#FFB800" />
                    <Text style={styles.snoozeText}>Snooze 10m</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipBtn} activeOpacity={0.6} onPress={() => handleAction('missed')}>
                    <Ban size={20} color="#94a3b8" />
                    <Text style={styles.skipText}>Skip this dose</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(25, 230, 111, 0.1)',
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: 9999, marginBottom: 16
    },
    statusText: { color: '#19e66f', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
    title: { fontSize: 28, fontWeight: '700', color: '#0f172a', textAlign: 'center', lineHeight: 36, marginTop: 16 },

    mainContent: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', paddingBottom: 32 },
    card: {
        backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden',
        borderWidth: 1, borderColor: '#f1f5f9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 30, elevation: 12,
        width: '100%',
    },
    imageHeader: {
        width: '100%', height: 160, backgroundColor: 'rgba(25, 230, 111, 0.05)',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative'
    },
    iconCircle: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 4, borderColor: 'rgba(25, 230, 111, 0.2)',
        shadowColor: '#fff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 4
    },
    cardBody: { padding: 24, alignItems: 'center' },
    medName: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
    medDosage: { fontSize: 18, fontWeight: '500', color: '#64748b' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24 },
    infoText: { fontSize: 14, color: '#94a3b8' },

    footer: { paddingHorizontal: 20, paddingBottom: 32, gap: 12, width: '100%' },
    takenBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
        backgroundColor: '#19e66f', width: '100%', height: 60, borderRadius: 12,
        shadowColor: 'rgba(25, 230, 111, 0.2)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 8
    },
    takenText: { fontSize: 20, fontWeight: '700', color: '#0f172a', letterSpacing: 0.5 },

    snoozeBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
        backgroundColor: 'rgba(255, 184, 0, 0.1)', borderWidth: 2, borderColor: 'rgba(255, 184, 0, 0.3)',
        width: '100%', height: 64, borderRadius: 12,
    },
    snoozeText: { fontSize: 18, fontWeight: '700', color: '#FFB800' },

    skipBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
        width: '100%', height: 56, backgroundColor: 'transparent',
    },
    skipText: { fontSize: 16, fontWeight: '600', color: '#94a3b8' }
});
