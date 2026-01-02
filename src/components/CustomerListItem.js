import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../theme';

const CustomerListItem = ({ customer, onPress }) => {
    const hasDue = customer.pendingDue > 0;

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.content}>
                <Text style={styles.name}>{customer.name}</Text>
                <Text style={styles.phone}>{customer.phone}</Text>
            </View>

            <View style={styles.amountContainer}>
                {hasDue ? (
                    <>
                        <Text style={styles.dueLabel}>Due</Text>
                        <Text style={styles.dueAmount}>₹{customer.pendingDue.toLocaleString()}</Text>
                    </>
                ) : (
                    <Text style={styles.paidText}>No Dues</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    content: {
        flex: 1,
    },
    name: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    phone: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    dueLabel: {
        ...typography.small,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    dueAmount: {
        ...typography.body,
        fontWeight: '700',
        color: colors.credit,
    },
    paidText: {
        ...typography.caption,
        color: colors.paid,
        fontWeight: '600',
    },
});

export default CustomerListItem;
