import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, typography } from '../theme';

const ErrorMessage = ({ message, style }) => {
    if (!message) return null;

    return (
        <View style={[styles.container, style]}>
            <Icon name="error-outline" size={16} color={colors.error} style={styles.icon} />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.error + '15', // 15 is hex for ~8% opacity
        padding: spacing.sm,
        borderRadius: 8,
        marginTop: -spacing.xs,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    icon: {
        marginRight: spacing.xs,
    },
    text: {
        ...typography.caption,
        color: colors.error,
        fontWeight: '500',
        flex: 1,
    },
});

export default ErrorMessage;
