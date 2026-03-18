import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, LogOut, User, Share as ShareIcon, Copy } from 'lucide-react-native';
import { useAuthStore } from '../store';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function SettingsScreen() {
    const router = useRouter();
    const { profile, logout } = useAuthStore();

    const [name, setName] = useState(profile?.name || '');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty.');
            return;
        }
        if (!profile?.id) return;

        setLoading(true);
        try {
            await updateDoc(doc(db, 'Users', profile.id), { name: name.trim() });
            Alert.alert('Success', 'Profile updated successfully.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            // Small delay for firestore listener to catch up if needed
            setTimeout(() => setLoading(false), 500);
        }
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive', onPress: async () => {
                    await logout();
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: `https://ui-avatars.com/api/?name=${profile?.name}&background=19e66f&color=fff&size=120` }}
                            style={styles.avatar}
                        />
                        <View style={styles.editBadge}>
                            <User size={14} color="#fff" />
                        </View>
                    </View>
                    <Text style={styles.profileEmail}>{profile?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{profile?.role === 'patient' ? 'Family Member' : 'Family Guardian'}</Text>
                    </View>
                </View>

                {/* Edit Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ACCOUNT INFORMATION</Text>
                    <View style={styles.inputGroup}>
                        <View style={styles.inputIcon}>
                            <User size={20} color="#64748b" />
                        </View>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Full Name"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                        onPress={handleUpdateProfile}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                    </TouchableOpacity>
                </View>

                {/* Invite Code Section */}
                {profile?.role === 'patient' && (
                    <View style={[styles.section, { marginTop: 24 }]}>
                        <Text style={styles.sectionLabel}>YOUR INVITE CODE</Text>
                        <TouchableOpacity 
                            style={styles.inviteCodeBox} 
                            onPress={() => {
                                if (profile?.inviteCode) {
                                    require('react-native').Clipboard.setString(profile.inviteCode);
                                    Alert.alert('Copied!', 'Invite code copied to clipboard.');
                                }
                            }}
                        >
                            <Text style={styles.inviteCodeText}>{profile?.inviteCode}</Text>
                            <View style={styles.copyBadge}>
                                <Copy size={16} color="#64748b" />
                                <Text style={styles.copyText}>Tap to copy</Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: -8, marginBottom: 16 }}>
                            Share this with guardians so they can monitor you.
                        </Text>
                    </View>
                )}

                {/* Logout Section */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>HealthSync v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f8f7' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },

    content: { padding: 24, paddingBottom: 60 },

    profileHeader: { alignItems: 'center', marginBottom: 32 },
    avatarWrapper: { position: 'relative', marginBottom: 16 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#fff' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#19e66f', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#f6f8f7' },
    profileEmail: { fontSize: 14, color: '#64748b', marginBottom: 8 },
    roleBadge: { backgroundColor: 'rgba(25, 230, 111, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    roleText: { fontSize: 11, fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5 },

    section: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, marginBottom: 16 },

    inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 12, marginBottom: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: 50, fontSize: 16, color: '#0f172a', fontWeight: '500' },

    saveBtn: { backgroundColor: '#19e66f', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: 'rgba(25, 230, 111, 0.2)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: '#0f172a' },

    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 40, paddingVertical: 16, backgroundColor: '#fee2e2', borderRadius: 16 },
    logoutText: { fontSize: 16, fontWeight: '700', color: '#ef4444' },

    versionText: { textAlign: 'center', marginTop: 24, fontSize: 12, color: '#cbd5e1', fontWeight: '500' },

    inviteCodeBox: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    inviteCodeText: { fontSize: 32, fontWeight: '800', color: '#0f172a', letterSpacing: 8 },
    copyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(15, 23, 42, 0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
    copyText: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
});
