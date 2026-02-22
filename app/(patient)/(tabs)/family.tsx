import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, Image, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../../libs/store';
import { useMedicineStore, Connection } from '../../../libs/medicineStore';
import { Users, CheckCircle, XCircle, ShieldCheck, X, Heart } from 'lucide-react-native';

export default function FamilyScreen() {
    const { profile } = useAuthStore();
    const { connections, approveConnection } = useMedicineStore();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [selectedPending, setSelectedPending] = useState<Connection | null>(null);

    const pendingConnections = connections.filter(c => c.status === 'pending');
    const approvedConnections = connections.filter(c => c.status === 'approved');

    const handleApprove = async (id: string) => {
        setLoadingId(id);
        try {
            await approveConnection(id);
            setSelectedPending(null);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoadingId(null);
        }
    };

    const handleDecline = (id: string) => {
        // In full MVP we would delete the connection document.
        // For now just close modal.
        setSelectedPending(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Family & Guardians</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.inviteCodeCard}>
                    <Text style={styles.inviteTitle}>Your Invite Code</Text>
                    <Text style={styles.inviteDesc}>Share this code with your guardian so they can monitor your health stats.</Text>
                    <View style={styles.codeBox}>
                        <Text style={styles.codeText}>{profile?.inviteCode}</Text>
                    </View>
                </View>

                {pendingConnections.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pending Requests</Text>
                        {pendingConnections.map(c => (
                            <TouchableOpacity
                                key={c.id}
                                style={styles.connCard}
                                onPress={() => setSelectedPending(c)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.iconBox}>
                                    <Users size={24} color="#3b82f6" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={styles.connName}>Guardian ID: {c.caregiverId.slice(0, 6)}</Text>
                                    <Text style={styles.connStatus}>Wants to connect with you</Text>
                                </View>
                                <View style={styles.reviewBadge}>
                                    <Text style={styles.reviewText}>Review</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Connected Guardians</Text>
                    {approvedConnections.length === 0 && (
                        <Text style={styles.emptyText}>No guardians connected yet.</Text>
                    )}
                    {approvedConnections.map(c => (
                        <View key={c.id} style={styles.connCard}>
                            <View style={[styles.iconBox, { backgroundColor: '#e8fdf1' }]}>
                                <CheckCircle size={24} color="#19e66f" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={styles.connName}>Guardian ID: {c.caregiverId.slice(0, 6)}</Text>
                                <Text style={styles.connStatus}>Connected</Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>

            {/* Approval Modal */}
            <Modal
                visible={!!selectedPending}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedPending(null)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    {/* Top App Bar */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedPending(null)}>
                            <X size={28} color="#0f172a" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Connection Request</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <View style={styles.modalContent}>
                        {/* Profile Section */}
                        <View style={styles.profileSection}>
                            <View style={styles.avatarWrapper}>
                                <Image
                                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIHII2xCciG14QPK9h7LSUa1PzVugr6JeoNfw2GVQjgyXP3OPomf-XXrERgYWZTm_itJX49Z5XUcUXP2DavTY9BcFwKbsCqzqIVAsV-qbcXG28GJwAT_fgXF2G2CiIsFdC5XuLpWo13MczVZwbq6Ml0Sgt9tyr-qiK8SZbyomA3JDlRyhfg3U1NYD6hjxIiUhMyVNtG1rk5GZxXSc-7f5Dzi62RsN6xBRkWswc9wNbnACneNAw-qzMWN88cGpyZbGHF8GHkN2OLPk' }}
                                    style={styles.avatar}
                                />
                                <View style={styles.avatarBadge}>
                                    <Heart size={20} color="#0f172a" fill="#0f172a" />
                                </View>
                            </View>

                            <View style={styles.profileInfo}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.profileName}>Guardian {selectedPending?.caregiverId.slice(0, 4)}</Text>
                                    <View style={styles.roleTag}>
                                        <Text style={styles.roleTagText}>Family</Text>
                                    </View>
                                </View>
                                <Text style={styles.profileDesc}>
                                    This guardian wants to connect to monitor your health and help coordinate your care.
                                </Text>
                            </View>
                        </View>

                        {/* Info Message */}
                        <View style={styles.infoBanner}>
                            <ShieldCheck size={24} color="#19e66f" style={{ marginTop: 2 }} />
                            <Text style={styles.infoBannerText}>
                                By allowing this connection, they will be able to view your daily health stats and receive alerts if you need assistance.
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons Footer */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.allowBtn}
                            activeOpacity={0.9}
                            onPress={() => selectedPending && handleApprove(selectedPending.id)}
                            disabled={!!loadingId}
                        >
                            {loadingId === selectedPending?.id ? (
                                <ActivityIndicator color="#0f172a" />
                            ) : (
                                <Text style={styles.allowBtnText}>Allow Connection</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.declineBtn}
                            activeOpacity={0.9}
                            onPress={() => selectedPending && handleDecline(selectedPending.id)}
                            disabled={!!loadingId}
                        >
                            <Text style={styles.declineBtnText}>Decline</Text>
                        </TouchableOpacity>

                        <View style={styles.footerNoteRow}>
                            <Text style={styles.footerNoteText}>Secure connection link.</Text>
                        </View>
                        <Text style={styles.footerNoteSub}>You can change this at any time in your privacy settings.</Text>

                        <View style={styles.homeIndicator} />
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f8f7' },
    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
    content: { padding: 24, paddingBottom: 120 },

    inviteCodeCard: { backgroundColor: '#19e66f', borderRadius: 24, padding: 24, marginBottom: 32 },
    inviteTitle: { color: '#0f172a', fontSize: 18, fontWeight: '700', marginBottom: 8 },
    inviteDesc: { color: 'rgba(15, 23, 42, 0.8)', fontSize: 14, marginBottom: 24, lineHeight: 22 },
    codeBox: { backgroundColor: '#fff', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    codeText: { fontSize: 32, fontWeight: '800', color: '#0f172a', letterSpacing: 8 },

    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
    emptyText: { color: '#64748b', fontStyle: 'italic' },

    connCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    connName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
    connStatus: { fontSize: 13, color: '#64748b', marginTop: 4 },

    reviewBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
    reviewText: { color: '#3b82f6', fontWeight: '700', fontSize: 13 },

    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: '#ffffff' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },

    modalContent: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', paddingBottom: 40 },
    profileSection: { alignItems: 'center', marginBottom: 32 },
    avatarWrapper: { position: 'relative', marginBottom: 24 },
    avatar: { width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: '#19e66f' },
    avatarBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#19e66f', padding: 8, borderRadius: 999, borderWidth: 4, borderColor: '#fff' },
    profileInfo: { alignItems: 'center' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    profileName: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
    roleTag: { backgroundColor: 'rgba(25, 230, 111, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
    roleTagText: { color: '#047857', fontWeight: '700', fontSize: 14 },
    profileDesc: { fontSize: 18, color: '#64748b', textAlign: 'center', lineHeight: 28, paddingHorizontal: 16 },

    infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: 'rgba(25, 230, 111, 0.1)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(25, 230, 111, 0.2)' },
    infoBannerText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#334155', lineHeight: 22 },

    modalFooter: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    allowBtn: { width: '100%', backgroundColor: '#19e66f', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: 'rgba(25, 230, 111, 0.2)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 6 },
    allowBtnText: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    declineBtn: { width: '100%', backgroundColor: '#f1f5f9', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    declineBtnText: { fontSize: 18, fontWeight: '700', color: '#ef4444' },

    footerNoteRow: { alignItems: 'center', marginBottom: 4 },
    footerNoteText: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
    footerNoteSub: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 16 },

    homeIndicator: { width: 80, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, alignSelf: 'center' }
});
