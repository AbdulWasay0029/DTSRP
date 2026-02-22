import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowRight, Clock, Users, ShieldPlus, AlertTriangle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const BG_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4EnGfDlW6iitlATZKouRD-7ESFHDS9_-zvUW6adF7wMkx01auksqlG_ssREjB8AqLOqfIDFYhs7Q-JeQ8-Pg4unviqvR3WCnxpeZEsRDaJBbUgAjZy-hNy4LT6ZgIXDUAzaBRo-aLjuT5v_Lce98mULJ3z4lLeXBrj0TvVuhOQcPh_4mxB16nl002HFAEAM11C4kBEtrW5ioQO-f0qVii5_bWl1HqK45tdFJfjAf4qb4SX37r4ZBOQ0dMefgPUo7c_ZgOL9O7usI';

const SLIDES = [
    {
        title: 'Smart Reminders',
        subtitle: 'Never forget your medication with timely, easy-to-read alerts.',
        badgeIcon: <Clock size={36} color="#19e66f" />,
    },
    {
        title: 'Family Connection',
        subtitle: 'Stay connected. Share your health updates with family for total peace of mind.',
        badgeIcon: <Users size={36} color="#19e66f" />,
    },
    {
        title: 'Health Safety',
        subtitle: 'Safety first. Instant emergency alerts and location sharing when you need it most.',
        centerIcon: <ShieldPlus size={64} color="#19e66f" />,
        badgeIcon: <AlertTriangle size={36} color="#ef4444" />,
    }
];

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(0);

    const finishOnboarding = async () => {
        await AsyncStorage.setItem('onboardingComplete', 'true');
        router.replace('/(auth)/login' as any);
    };

    const handleNext = () => {
        if (step < SLIDES.length - 1) {
            setStep(step + 1);
        } else {
            finishOnboarding();
        }
    };

    const currentSlide = SLIDES[step];

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Navigation */}
            <View style={styles.header}>
                <TouchableOpacity onPress={finishOnboarding} hitSlop={10}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content Area */}
            <View style={styles.content}>
                {/* Illustration Container */}
                <View style={styles.illustrationContainer}>
                    <View style={styles.glow} />

                    <View style={styles.imageBox}>
                        <Image
                            source={{ uri: BG_URL }}
                            style={styles.backgroundImage}
                            resizeMode="contain"
                        />

                        {currentSlide.centerIcon && (
                            <View style={styles.absoluteCenter}>
                                <View style={styles.centerIconWrapper}>
                                    {currentSlide.centerIcon}
                                </View>
                            </View>
                        )}

                        <View style={styles.badgeWrapper}>
                            {currentSlide.badgeIcon}
                        </View>
                    </View>
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{currentSlide.title}</Text>
                    <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
                </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.footer}>
                {/* Progress Indicators */}
                <View style={styles.progressRow}>
                    {SLIDES.map((_, i) => (
                        <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
                    ))}
                </View>

                {/* Primary Action */}
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleNext}
                    activeOpacity={0.9}
                >
                    <Text style={styles.primaryBtnText}>Next</Text>
                    <ArrowRight size={20} color="#0f172a" strokeWidth={3} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'flex-end',
        padding: 24,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748b',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    illustrationContainer: {
        width: '100%',
        maxWidth: 300,
        alignSelf: 'center',
        aspectRatio: 1,
        maxHeight: width * 0.7,
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    glow: {
        position: 'absolute',
        top: '10%', bottom: '10%', left: '10%', right: '10%',
        backgroundColor: 'rgba(25, 230, 111, 0.1)',
        borderRadius: 9999,
        transform: [{ scale: 0.9 }],
    },
    imageBox: {
        width: '100%',
        height: '100%',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    badgeWrapper: {
        position: 'absolute',
        bottom: -16,
        right: -8,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    absoluteCenter: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerIconWrapper: {
        width: 128,
        height: 128,
        backgroundColor: 'rgba(25, 230, 111, 0.2)',
        borderRadius: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 28,
        maxWidth: 320,
    },
    footer: {
        paddingHorizontal: 32,
        paddingBottom: 48,
        paddingTop: 24,
        gap: 32,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(25, 230, 111, 0.2)',
    },
    dotActive: {
        width: 24,
        backgroundColor: '#19e66f',
    },
    primaryBtn: {
        width: '100%',
        backgroundColor: '#19e66f',
        paddingVertical: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: 'rgba(25, 230, 111, 0.2)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 10,
    },
    primaryBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    }
});
