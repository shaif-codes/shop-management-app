import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import { colors, spacing, typography } from '../theme';

const DashboardCard = ({
    title,
    value,
    icon,
    color = colors.primary,
    onPress,
}) => {
    return (
        <Card onPress={onPress} style={styles.card}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    {icon}
                </View>
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.value, { color }]}>{value}</Text>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        minWidth: '45%',
    },
    header: {
        marginBottom: spacing.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    value: {
        ...typography.h2,
    },
});

export default DashboardCard;
