import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, UserPlus, Info } from 'lucide-react-native';
import { useMedicineStore } from '../../libs/medicineStore';

export default function LinkFamilyScreen() {
    const router = useRouter();
    const { connectPatient } = useMedicineStore();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        if (code.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-character code.');
            return;
        }
        setLoading(true);
        try {
            await connectPatient(code.toUpperCase());
            Alert.alert('Success', 'Successfully linked with your family member!', [
                { text: 'View Dashboard', onPress: () => router.replace('/(caregiver)/(tabs)') }
            ]);
        } catch (e: any) {
            Alert.alert('Linking Failed', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ChevronLeft size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Family Member</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.iconBox}>
                        <UserPlus size={48} color="#19e66f" />
                    </View>

                    <Text style={styles.title}>Enter Invite Code</Text>
                    <Text style={styles.subtitle}>
                        Ask your family member for their 6-digit invite code located in their app's Settings.
                    </Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.codeInput}
                            placeholder="ABC123"
                            placeholderTextColor="#cbd5e1"
                            value={code}
                            onChangeText={(t) => setCode(t.toUpperCase().trim())}
                            maxLength={8} // Allow some extra just in case but we expect 6
                            autoCapitalize="characters"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.infoBox}>
                        <Info size={18} color="#64748b" />
                        <Text style={styles.infoText}>
                            Linking allows you to see their medicine schedule, adherence status, and get alerts for missed doses.
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.connectBtn, (!code || loading) && styles.connectBtnDisabled]}
                        onPress={handleConnect}
                        disabled={loading || !code}
                    >
                        {loading ? (
                            <ActivityIndicator color="#0f172a" />
                        ) : (
                            <>
                                <Text style={styles.connectBtnText}>Link Family Member</Text>
                                <ChevronRight size={20} color="#0f172a" />
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    scrollContent: { padding: 32, alignItems: 'center' },
    iconBox: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
    subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
    inputWrapper: { width: '100%', marginBottom: 32 },
    codeInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 2, borderColor: '#e2e8f0',
        borderRadius: 20,
        padding: 24,
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
        textAlign: 'center',
        letterSpacing: 4,
    },
    infoBox: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, gap: 12, marginBottom: 40, width: '100%' },
    infoText: { flex: 1, fontSize: 13, color: '#64748b', lineHeight: 18 },
    connectBtn: {
        width: '100%', backgroundColor: '#19e66f', paddingVertical: 20, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        shadowColor: '#19e66f', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4
    },
    connectBtnDisabled: { opacity: 0.6, backgroundColor: '#e2e8f0', shadowOpacity: 0 },
    connectBtnText: { fontSize: 18, fontWeight: '700', color: '#0f172a' }
});
