import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated , ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Heart, Pill } from 'lucide-react-native';
import { useAuthStore } from '../libs/store';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();
    const { initialized, user, profile } = useAuthStore();
    const progress = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate progress bar
        Animated.timing(progress, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: false,
        }).start();

        const initializeApp = async () => {
            // Artificial delay to show the splash screen
            await new Promise(resolve => setTimeout(resolve, 2500));

            if (!initialized) return;

            const hasOnboarded = await AsyncStorage.getItem('onboardingComplete');

            if (user && profile) {
                if (profile.role === 'patient') {
                    router.replace('/(patient)/(tabs)');
                } else if (profile.role === 'caregiver') {
                    router.replace('/(caregiver)/(tabs)');
                }
            } else {
                if (hasOnboarded === 'true') {
                    router.replace('/(auth)/login');
                } else {
                    router.replace('/(auth)/onboarding');
                }
            }
        };

        initializeApp();
    }, [initialized, user, profile, router]);

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <View style={styles.topSpacer} />

            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <View style={styles.glow} />
                    <View style={styles.iconBox}>
                        <Heart size={64} color="#2dd4bf" strokeWidth={1.5} fill="#2dd4bf" />
                        <View style={styles.pillBadge}>
                            <Pill size={32} color="#19e66f" />
                        </View>
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        Health<Text style={styles.titlePrimary}>Sync</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Never miss a dose.{'\n'}Stay connected.
                    </Text>
                </View>
            </View>

            <View style={styles.progressSection}>
                <Text style={styles.progressText}>Initializing health dashboard...</Text>
                <View style={styles.progressBarBg}>
                    <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
                </View>
            </View>

            {/* Decorative bottom element */}
            <View style={styles.decorativeBottom} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f9ff',
    },
    topSpacer: {
        height: 60,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    logoContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    glow: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(25, 230, 111, 0.1)',
        borderRadius: 100,
        transform: [{ scale: 1.5 }],
    },
    iconBox: {
        width: 80,
        height: 80,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(25, 230, 111, 0.15)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 10,
        position: 'relative',
    },
    pillBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#fff',
        padding: 4,
        borderRadius: 20,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#0f172a',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    titlePrimary: {
        color: '#19e66f',
    },
    subtitle: {
        fontSize: 18,
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 26,
    },
    progressSection: {
        width: '100%',
        paddingHorizontal: 40,
        paddingBottom: 80,
    },
    progressText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#19e66f',
        borderRadius: 4,
    },
    decorativeBottom: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '25%',
        backgroundColor: 'rgba(25, 230, 111, 0.02)',
    }
});
