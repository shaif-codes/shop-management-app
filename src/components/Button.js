import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, spacing } from '../theme';

const Button = ({
    title,
    onPress,
    variant = 'primary',  // 'primary' | 'secondary' | 'outline' | 'text'
    size = 'medium',      // 'small' | 'medium' | 'large'
    disabled = false,
    loading = false,
    icon,
    fullWidth = false,
    style,
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[variant],
                styles[size],
                fullWidth && styles.fullWidth,
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : '#FFFFFF'} />
            ) : (
                <>
                    {icon && <View style={styles.icon}>{icon}</View>}
                    <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingHorizontal: spacing.md,
    },

    // Variants
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    text: {
        backgroundColor: 'transparent',
    },

    // Sizes
    small: {
        height: 36,
        paddingHorizontal: spacing.sm,
    },
    medium: {
        height: 48,
    },
    large: {
        height: 56,
    },

    // States
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        width: '100%',
    },

    // Text styles
    primaryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    outlineText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    textText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },

    icon: {
        marginRight: spacing.xs,
    },
});

export default Button;
