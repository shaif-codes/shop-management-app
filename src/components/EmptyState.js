import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import Button from './Button';

const EmptyState = ({ icon, title, message, actionLabel, onAction }) => {
    return (
        <View style={styles.container}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {actionLabel && onAction && (
                <Button title={actionLabel} onPress={onAction} style={styles.button} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    icon: {
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    button: {
        marginTop: spacing.md,
    },
});

export default EmptyState;
