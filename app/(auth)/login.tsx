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
            Alert.alert('Email Required', 'Please enter your email address in the field above to receive a reset link.');
            return;
        }
        try {
            await resetPassword(email);
            Alert.alert(
                'Reset Email Sent',
                `A password reset link has been sent to ${email}. If you don't see it, please check your spam folder.`
            );
        } catch (e: any) {
            Alert.alert('Reset Failed', e.message);
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
        paddingHorizontal: 24,
        paddingTop: 24,
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
