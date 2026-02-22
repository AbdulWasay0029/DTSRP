import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Filter, Clock, Pill } from 'lucide-react-native';

export default function CaregiverScheduleScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Schedule</Text>
                    <Text style={styles.headerSubtitle}>Upcoming doses for patients</Text>
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={20} color="#19e66f" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Timeline Container */}
                <View style={styles.timeline}>
                    <View style={styles.timelineLine} />

                    {/* Morning Block */}
                    <View style={styles.timeBlock}>
                        <View style={styles.timeHeader}>
                            <View style={styles.timeDot} />
                            <Text style={styles.timeText}>08:00 AM</Text>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.patientInfo}>
                                    <Image source={{ uri: 'https://ui-avatars.com/api/?name=Martha+Stewart&background=0f172a&color=fff' }} style={styles.avatar} />
                                    <Text style={styles.patientName}>Martha Stewart</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: '#e8fdf1' }]}>
                                    <Text style={[styles.statusText, { color: '#19e66f' }]}>Taken</Text>
                                </View>
                            </View>
                            <View style={styles.medicationRow}>
                                <View style={styles.medIconBox}><Pill size={16} color="#64748b" /></View>
                                <View style={styles.medDetails}>
                                    <Text style={styles.medName}>Atorvastatin</Text>
                                    <Text style={styles.medDosage}>20mg • After Food</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Afternoon Block */}
                    <View style={styles.timeBlock}>
                        <View style={styles.timeHeader}>
                            <View style={[styles.timeDot, { backgroundColor: '#fcfaf8', borderColor: '#f59e0b' }]} />
                            <Text style={[styles.timeText, { color: '#f59e0b' }]}>01:00 PM (Upcoming)</Text>
                        </View>

                        <View style={[styles.card, { borderColor: '#fef3c7', backgroundColor: '#fdfbf7' }]}>
                            <View style={styles.cardHeader}>
                                <View style={styles.patientInfo}>
                                    <Image source={{ uri: 'https://ui-avatars.com/api/?name=Robert+Brown&background=0f172a&color=fff' }} style={styles.avatar} />
                                    <Text style={styles.patientName}>Robert Brown</Text>
                                </View>
                            </View>
                            <View style={styles.medicationRow}>
                                <View style={[styles.medIconBox, { backgroundColor: '#fef3c7' }]}><Pill size={16} color="#f59e0b" /></View>
                                <View style={styles.medDetails}>
                                    <Text style={styles.medName}>Metformin</Text>
                                    <Text style={styles.medDosage}>500mg • With Food</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.card, { borderColor: '#fef3c7', backgroundColor: '#fdfbf7', marginTop: 12 }]}>
                            <View style={styles.cardHeader}>
                                <View style={styles.patientInfo}>
                                    <Image source={{ uri: 'https://ui-avatars.com/api/?name=Martha+Stewart&background=0f172a&color=fff' }} style={styles.avatar} />
                                    <Text style={styles.patientName}>Martha Stewart</Text>
                                </View>
                            </View>
                            <View style={styles.medicationRow}>
                                <View style={[styles.medIconBox, { backgroundColor: '#fef3c7' }]}><Pill size={16} color="#f59e0b" /></View>
                                <View style={styles.medDetails}>
                                    <Text style={styles.medName}>Lisinopril</Text>
                                    <Text style={styles.medDosage}>10mg • Before Food</Text>
                                </View>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 24, paddingTop: 40, backgroundColor: '#fff', zIndex: 10 },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#0f172a' },
    headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    filterBtn: { padding: 12, backgroundColor: '#e8fdf1', borderRadius: 24 },

    content: { padding: 24, paddingBottom: 100 },

    timeline: { position: 'relative', marginTop: 8 },
    timelineLine: { position: 'absolute', left: 5, top: 12, bottom: 0, width: 2, backgroundColor: '#e2e8f0', zIndex: 0 },

    timeBlock: { marginBottom: 32, paddingLeft: 24, position: 'relative' },
    timeHeader: { flexDirection: 'row', alignItems: 'center', position: 'absolute', left: 0, top: 2, zIndex: 1 },
    timeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#cbd5e1', borderWidth: 3, borderColor: '#f6f8f7', left: 0 },
    timeText: { fontSize: 14, fontWeight: '700', color: '#64748b', marginLeft: 16 },

    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 32, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    patientInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 32, height: 32, borderRadius: 16 },
    patientName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    medicationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    medIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
    medDetails: { flex: 1 },
    medName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
    medDosage: { fontSize: 13, color: '#64748b', marginTop: 2 }
});
