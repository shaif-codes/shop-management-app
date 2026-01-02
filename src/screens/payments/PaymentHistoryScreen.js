import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { paymentService } from '../../services/payment.service';
import {
    ScreenContainer,
    Card,
    LoadingSpinner,
    EmptyState
} from '../../components';
import { colors, spacing, typography } from '../../theme';
import { formatDate } from '../../utils/date';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PaymentHistoryScreen = ({ navigation }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPayments = useCallback(async () => {
        try {
            const response = await paymentService.getAll();
            setPayments(response.data.payments);
        } catch (error) {
            Alert.alert('Error', 'Failed to load payment history');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    const onRefresh = () => {
        setRefreshing(true);
        loadPayments();
    };

    const renderPaymentItem = ({ item }) => (
        <Card style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
                <View>
                    <Text style={styles.customerName}>{item.customerId?.name || item.customerName}</Text>
                    <Text style={styles.paymentDate}>{formatDate(item.paymentDate)}</Text>
                </View>
                <Text style={styles.amount}>₹{item.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.paymentFooter}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.paymentMode}</Text>
                </View>
                {item.invoiceNumber && (
                    <Text style={styles.invoiceNumber}>Invoice: {item.invoiceNumber}</Text>
                )}
            </View>
            {item.remarks ? (
                <Text style={styles.remarks}>{item.remarks}</Text>
            ) : null}
        </Card>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <ScreenContainer>
            <FlatList
                data={payments}
                renderItem={renderPaymentItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <EmptyState
                        title="No payments found"
                        message="Record a payment to see history here."
                        icon={<Icon name="payments" size={64} color={colors.textDisabled} />}
                    />
                }
            />
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        padding: spacing.lg,
        flexGrow: 1,
    },
    paymentCard: {
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    customerName: {
        ...typography.h4,
        color: colors.textPrimary,
    },
    paymentDate: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    amount: {
        ...typography.h3,
        color: colors.success,
        fontWeight: 'bold',
    },
    paymentFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    badge: {
        backgroundColor: colors.primary + '20',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '600',
    },
    invoiceNumber: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    remarks: {
        ...typography.body,
        fontSize: 12,
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginTop: spacing.sm,
        paddingTop: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});

export default PaymentHistoryScreen;
