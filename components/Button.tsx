import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'outline' | 'ghost';
    icon?: React.ReactNode;
}

export const Button = ({ title, loading, variant = 'primary', icon, style, ...props }: ButtonProps) => {
    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[
                styles.base,
                isPrimary && styles.primary,
                isOutline && styles.outline,
                style,
                props.disabled && styles.disabled,
            ]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={isPrimary ? '#0f172a' : '#19e66f'} />
            ) : (
                <>
                    <Text style={[
                        styles.textBase,
                        isPrimary && styles.textPrimary,
                        isOutline && styles.textOutline,
                    ]}>
                        {title}
                    </Text>
                    {icon}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 24,
    },
    primary: {
        backgroundColor: '#19e66f',
        shadowColor: '#19e66f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    disabled: {
        opacity: 0.6,
    },
    textBase: {
        fontSize: 18,
        fontWeight: '700',
    },
    textPrimary: {
        color: '#0f172a',
    },
    textOutline: {
        color: '#334155',
    }
});
