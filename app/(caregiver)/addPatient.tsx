import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, QrCode, Flashlight } from 'lucide-react-native';
import { useMedicineStore } from '../../libs/medicineStore';

export default function AddPatientScreen() {
    const router = useRouter();
    const { connectPatient } = useMedicineStore();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);

    // Refs for input focus management
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text.toUpperCase();
        setCode(newCode);

        // Auto advance
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleConnect = async () => {
        const fullCode = code.join('');
        if (fullCode.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-character code.');
            return;
        }
        setLoading(true);
        try {
            await connectPatient(fullCode);
            Alert.alert('Success', 'Connection request sent to patient.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ChevronLeft size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Connect Patient</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Instruction Text */}
                    <Text style={styles.instructionText}>
                        Ask your family member for their unique 6-digit code or scan their QR code to start monitoring.
                    </Text>

                    {/* Manual Entry Section */}
                    <View style={styles.manualEntrySection}>
                        <Text style={styles.sectionTitle}>ENTER INVITE CODE</Text>

                        <View style={styles.codeContainer}>
                            {code.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { inputRefs.current[index] = ref; }}
                                    style={[styles.codeInput, digit && styles.codeInputFilled]}
                                    value={digit}
                                    onChangeText={(text) => handleCodeChange(text.replace(/[^a-zA-Z0-9]/g, ''), index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    maxLength={1}
                                    autoCapitalize="characters"
                                    keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'default'}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* QR Scan Section */}
                    <View style={styles.qrSection}>
                        <Text style={styles.sectionTitle}>SCAN QR CODE</Text>

                        <View style={styles.qrScannerBox}>
                            <View style={styles.qrScannerBg}>
                                <QrCode size={64} color="#cbd5e1" />
                            </View>

                            {/* Scanning UI frame placeholder */}
                            <View style={styles.scanFrame}>
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />
                                <View style={styles.scanLine} />
                            </View>

                            <TouchableOpacity style={styles.flashBtn}>
                                <Flashlight size={20} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.qrHelperText}>Position the QR code within the frame</Text>
                    </View>
                </ScrollView>

                {/* Footer Action */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.connectBtn}
                        activeOpacity={0.9}
                        onPress={handleConnect}
                        disabled={loading}
                    >
                        <Text style={styles.connectBtnText}>{loading ? 'Connecting...' : 'Connect'}</Text>
                        {!loading && <ChevronRight size={24} color="#0f172a" />}
                    </TouchableOpacity>

                    <Text style={styles.supportText}>
                        Having trouble? <Text style={styles.supportLink}>Contact Support</Text>
                    </Text>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    scrollContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 120 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },

    instructionText: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 32, paddingHorizontal: 8 },

    manualEntrySection: { alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#19e66f', letterSpacing: 1, marginBottom: 16 },
    codeContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
    codeInput: {
        width: 48, height: 56,
        borderBottomWidth: 2, borderBottomColor: '#e2e8f0',
        fontSize: 24, fontWeight: '700', color: '#0f172a',
        textAlign: 'center',
    },
    codeInputFilled: { borderBottomColor: '#19e66f' },

    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 40 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#f1f5f9' },
    dividerText: { marginHorizontal: 16, fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 1 },

    qrSection: { alignItems: 'center' },
    qrScannerBox: {
        width: 256, height: 256, borderRadius: 16, backgroundColor: '#f8fafc',
        borderWidth: 2, borderColor: '#f1f5f9',
        overflow: 'hidden', position: 'relative',
        marginBottom: 16,
    },
    qrScannerBg: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', opacity: 0.6 },
    scanFrame: { position: 'absolute', top: 32, bottom: 32, left: 32, right: 32, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(25, 230, 111, 0.4)' },
    corner: { position: 'absolute', width: 24, height: 24, borderColor: '#19e66f' },
    topLeft: { top: -4, left: -4, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 6 },
    topRight: { top: -4, right: -4, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 6 },
    bottomLeft: { bottom: -4, left: -4, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 6 },
    bottomRight: { bottom: -4, right: -4, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 6 },
    scanLine: { position: 'absolute', top: '50%', left: 0, right: 0, height: 2, backgroundColor: '#19e66f', shadowColor: '#19e66f', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 },

    flashBtn: { position: 'absolute', bottom: 16, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.9)', alignItems: 'center', justifyContent: 'center' },

    qrHelperText: { fontSize: 12, fontWeight: '500', color: '#94a3b8' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
    connectBtn: {
        width: '100%', backgroundColor: '#19e66f', paddingVertical: 20, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        shadowColor: 'rgba(25, 230, 111, 0.2)', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 20, elevation: 8
    },
    connectBtnText: { fontSize: 18, fontWeight: '700', color: '#0f172a' },

    supportText: { textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8' },
    supportLink: { color: '#19e66f', textDecorationLine: 'underline' }
});
