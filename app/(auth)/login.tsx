import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldPlus } from 'lucide-react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../libs/store';

export default function Login() {
    const router = useRouter();
    const { login, loading, resetPassword } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            await login(email, password);
            // Layout AuthGuard handles routing automatically
        } catch (e: any) {
            Alert.alert('Login Error', e.message);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Forgot Password', 'Please enter your email address first.');
            return;
        }
        try {
            await resetPassword(email);
            Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.topGradient} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.titleContainer}>
                    <View style={styles.iconBox}>
                        <ShieldPlus size={36} color="#ffffff" strokeWidth={2} />
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Log in to your health dashboard</Text>
                </View>

                <View style={styles.form}>
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

                    <TouchableOpacity style={styles.forgotPass} onPress={handleForgotPassword}>
                        <Text style={styles.forgotPassText}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Log In"
                        onPress={handleLogin}
                        loading={loading}
                    />

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.googleBtn}
                        onPress={async () => {
                            try {
                                const mockEmail = `caregiver_${Date.now()}@google.mock`;
                                await login(mockEmail, 'googlemockpass');
                            } catch (e: any) {
                                Alert.alert('Google Sign-In Error', "Cannot find simulated account. Please register first.");
                            }
                        }}
                        disabled={loading}
                    >
                        <Text style={styles.googleBtnText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <Text style={styles.switchText}>
                        Don&apos;t have an account?{' '}
                        <Text style={styles.switchLink} onPress={() => router.replace('/(auth)/register')}>
                            Sign up
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60, // approx for safe area + header
        paddingBottom: 16,
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    titleContainer: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 24,
    },
    iconBox: {
        width: 64,
        height: 64,
        backgroundColor: '#19e66f',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#19e66f',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 24,
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        backgroundColor: '#f0f9ff',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
    },
    form: {
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    forgotPass: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    forgotPassText: {
        color: '#19e66f',
        fontWeight: '600',
        fontSize: 14,
    },
    footer: {
        marginTop: 'auto',
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    googleBtn: {
        width: '100%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleBtnText: {
        color: '#334155',
        fontWeight: '600',
        fontSize: 16,
    },
    switchText: {
        textAlign: 'center',
        marginTop: 24,
        color: '#64748b',
        fontSize: 14,
    },
    switchLink: {
        color: '#19e66f',
        fontWeight: '600',
        textDecorationLine: 'underline',
    }
});
