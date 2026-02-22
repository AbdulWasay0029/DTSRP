import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, User, Users, CheckCircle2, Circle } from 'lucide-react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore, Role } from '../../libs/store';

export default function Register() {
    const router = useRouter();
    const { register, loading } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('patient');

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            await register(email, password, name, role);
            // Layout AuthGuard will automatically redirect authenticated users
        } catch (e: any) {
            Alert.alert('Register Error', e.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.backButton} />
                    <Text style={styles.headerTitle}>Sign Up</Text>
                    <View style={{ width: 48 }} />
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Join HealthSync</Text>
                    <Text style={styles.subtitle}>Start managing health and monitoring your family's wellbeing today.</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        placeholder="e.g. John Doe"
                        onChangeText={setName}
                    />
                    <Input
                        label="Email or Phone"
                        placeholder="name@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        onChangeText={setEmail}
                    />
                    <Input
                        label="Password"
                        placeholder="••••••••"
                        secureTextEntry
                        onChangeText={setPassword}
                    />
                </View>

                <View style={styles.roleSection}>
                    <Text style={styles.roleLabel}>Select your account type</Text>
                    <View style={styles.roleGrid}>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.roleCard, role === 'patient' && styles.roleCardActive, { borderColor: role === 'patient' ? '#19e66f' : '#e2e8f0' }]}
                            onPress={() => setRole('patient')}
                        >
                            <View style={[styles.roleIconBox, role === 'patient' && styles.roleIconBoxActive]}>
                                <User size={28} color={role === 'patient' ? '#fff' : '#475569'} />
                            </View>
                            <Text style={styles.roleCardTitle}>Loved One</Text>
                            <Text style={styles.roleCardDesc}>Manage my health</Text>
                            <View style={styles.roleCheck}>
                                {role === 'patient' ? (
                                    <CheckCircle2 color="#19e66f" size={20} />
                                ) : (
                                    <Circle color="#cbd5e1" size={20} />
                                )}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.roleCard, role === 'caregiver' && styles.roleCardActive, { borderColor: role === 'caregiver' ? '#19e66f' : '#e2e8f0' }]}
                            onPress={() => setRole('caregiver')}
                        >
                            <View style={[styles.roleIconBox, role === 'caregiver' && styles.roleIconBoxActive]}>
                                <Users size={28} color={role === 'caregiver' ? '#fff' : '#475569'} />
                            </View>
                            <Text style={styles.roleCardTitle}>Guardian</Text>
                            <Text style={styles.roleCardDesc}>Protect my family</Text>
                            <View style={styles.roleCheck}>
                                {role === 'caregiver' ? (
                                    <CheckCircle2 color="#19e66f" size={20} />
                                ) : (
                                    <Circle color="#cbd5e1" size={20} />
                                )}
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Create Account"
                        onPress={handleRegister}
                        loading={loading}
                        icon={<ArrowRight size={20} color="#0f172a" />}
                    />

                    <Text style={styles.switchText}>
                        Already have an account?{' '}
                        <Text style={styles.switchLink} onPress={() => router.replace('/(auth)/login')}>
                            Log in
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { flexGrow: 1, paddingBottom: 40 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
    },
    backButton: { width: 48, height: 48, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    titleContainer: { paddingHorizontal: 24, paddingVertical: 16 },
    title: { fontSize: 28, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#64748b', lineHeight: 24 },
    form: { paddingHorizontal: 24, paddingTop: 8 },

    roleSection: { paddingHorizontal: 24, paddingVertical: 24 },
    roleLabel: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 16, marginLeft: 4 },
    roleGrid: { flexDirection: 'row', gap: 16 },
    roleCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    roleCardActive: {
        borderColor: '#19e66f',
        backgroundColor: '#e8fdf1',
    },
    roleIconBox: {
        width: 56, height: 56,
        borderRadius: 28,
        backgroundColor: '#f1f5f9',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
    },
    roleIconBoxActive: {
        backgroundColor: '#19e66f',
    },
    roleCardTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
    roleCardDesc: { fontSize: 10, color: '#64748b', marginTop: 4, textAlign: 'center' },
    roleCheck: { marginTop: 12 },
    footer: { marginTop: 'auto', paddingHorizontal: 24, paddingTop: 16 },
    switchText: { textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: 14 },
    switchLink: { color: '#19e66f', fontWeight: '600', textDecorationLine: 'underline' }
});
