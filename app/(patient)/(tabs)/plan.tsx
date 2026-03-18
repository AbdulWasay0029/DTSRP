import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pill, Plus, Trash2, ChevronLeft } from 'lucide-react-native';
import { useMedicineStore, Medicine } from '../../../libs/medicineStore';

export default function MyMedicinesScreen() {
    const router = useRouter();
    const { medicines, deleteMedicine } = useMedicineStore();

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            "Remove Medicine",
            `Are you sure you want to remove ${name}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: () => deleteMedicine(id) }
            ]
        );
    };



    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Medicines</Text>
            </View>

            {medicines.length === 0 ? (
                <View style={styles.emptyContent}>
                    <Text style={styles.emptyTitle}>No Medicines Yet</Text>
                    <Text style={styles.emptySub}>Tap the + button to add your first medication and stay on track with your health.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {medicines.map((med) => (
                        <View key={med.id} style={styles.medCard}>
                            <View style={styles.medCardHeader}>
                                <View style={styles.medIconWrapper}>
                                    <Pill size={24} color="#19e66f" />
                                </View>
                                <View style={styles.medInfo}>
                                    <Text style={styles.medName}>{med.name}</Text>
                                    <Text style={styles.medDosage}>{med.dosage}</Text>
                                </View>
                            </View>

                            <View style={styles.medDetails}>
                                <Text style={styles.medTimesText}>
                                    {med.times.length} {med.times.length === 1 ? 'time' : 'times'} a day ({med.times.join(', ')})
                                </Text>
                                <Text style={styles.medInventoryText}>
                                    {med.frequency} until {new Date(med.endDate).toLocaleDateString()}
                                </Text>
                            </View>

                            <View style={styles.medActions}>

                                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(med.id, med.name)}>
                                    <Trash2 size={18} color="#ef4444" />
                                    <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.9}
                onPress={() => router.push('/(patient)/addMedicine')}
            >
                <Plus size={32} color="#0f172a" strokeWidth={3} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f8f7' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#f6f8f7'
    },
    headerBtn: { padding: 8, backgroundColor: 'rgba(25, 230, 111, 0.1)', borderRadius: 24 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 },

    // Empty State Styles
    emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 60 },
    illustrationContainer: {
        width: '100%', maxWidth: 280, aspectRatio: 1,
        marginBottom: 40, alignItems: 'center', justifyContent: 'center',
        position: 'relative'
    },
    glow: {
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(25, 230, 111, 0.15)',
        borderRadius: 9999, transform: [{ scale: 1.1 }],
    },
    imageBox: {
        width: '100%', height: '100%',
        backgroundColor: '#fff', borderRadius: 32,
        padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.1, shadowRadius: 30, elevation: 15,
        position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9'
    },
    gridBox: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 12, opacity: 0.4 },
    gridCell: { width: '45%', aspectRatio: 1, backgroundColor: '#f1f5f9', borderRadius: 12 },
    centeredPill: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center', justifyContent: 'center',
        zIndex: 10
    },
    emptyTitle: { fontSize: 26, fontWeight: '700', color: '#0f172a', marginBottom: 12, textAlign: 'center' },
    emptySub: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, maxWidth: 260, marginBottom: 40 },
    addBtn: {
        width: '100%', maxWidth: 320, backgroundColor: '#19e66f',
        paddingVertical: 18, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        shadowColor: 'rgba(25, 230, 111, 0.3)', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1, shadowRadius: 16, elevation: 8,
    },
    addBtnText: { fontSize: 18, fontWeight: '700', color: '#0f172a' },

    // List Styles
    listContent: { padding: 24, paddingBottom: 120, gap: 16 },
    medCard: {
        backgroundColor: '#fff', padding: 20, borderRadius: 20,
        borderWidth: 1, borderColor: '#f1f5f9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    },
    medCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    medIconWrapper: {
        width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(25, 230, 111, 0.15)',
        alignItems: 'center', justifyContent: 'center'
    },
    medInfo: { marginLeft: 16, flex: 1 },
    medName: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
    medDosage: { fontSize: 14, fontWeight: '500', color: '#64748b', marginTop: 4 },
    medDetails: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 16 },
    medTimesText: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 4 },
    medInventoryText: { fontSize: 12, color: '#94a3b8' },
    medActions: { flexDirection: 'row', gap: 12 },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9'
    },
    deleteBtn: { backgroundColor: '#fee2e2' },
    actionBtnText: { fontSize: 14, fontWeight: '600', color: '#475569' },

    fab: {
        position: 'absolute', bottom: 24, right: 24,
        width: 64, height: 64, borderRadius: 32, backgroundColor: '#19e66f',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: 'rgba(25, 230, 111, 0.4)', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1, shadowRadius: 16, elevation: 8,
        borderWidth: 4, borderColor: '#ffffff',
    }
});
