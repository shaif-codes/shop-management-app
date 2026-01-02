import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { salesService } from '../../services/sales.service';
import { ScreenContainer, LoadingSpinner, EmptyState, Card } from '../../components';
import { spacing, colors, typography } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SalesListScreen = ({ navigation }) => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await salesService.getAll();
            setSales(res.data.sales || []);
        } catch (error) {
            console.error('Failed to fetch sales', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSales();
    };

    const renderSaleItem = ({ item }) => {
        const isPending = item.pendingAmount > 0;

        return (
            <Card
                style={styles.saleCard}
                onPress={() => navigation.navigate('SaleDetail', { saleId: item._id || item.id })}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.invoiceNo}>{item.invoiceNumber}</Text>
                    <Text style={[styles.status, isPending ? styles.statusPending : styles.statusPaid]}>
                        {isPending ? 'Partially Paid' : 'Paid'}
                    </Text>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Icon name="person" size={16} color={colors.textSecondary} />
                        <Text style={styles.customerName}>{item.customerName || 'Walking Customer'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="calendar-today" size={16} color={colors.textSecondary} />
                        <Text style={styles.dateText}>{new Date(item.saleDate).toLocaleDateString()}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.amountLabel}>Total Amount</Text>
                        <Text style={styles.amountValue}>₹{item.netAmount.toLocaleString()}</Text>
                    </View>
                    {isPending && (
                        <View style={styles.pendingWrap}>
                            <Text style={styles.pendingLabel}>Due</Text>
                            <Text style={styles.pendingValue}>₹{item.pendingAmount.toLocaleString()}</Text>
                        </View>
                    )}
                </View>
            </Card>
        );
    };

    if (loading && !refreshing) return <LoadingSpinner />;

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text style={styles.title}>Recent Sales</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CreateSale')}
                >
                    <Icon name="add-shopping-cart" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={sales}
                renderItem={renderSaleItem}
                keyExtractor={item => item._id || item.id}
                contentContainerStyle={styles.listContent}
                onRefresh={onRefresh}
                refreshing={refreshing}
                ListEmptyComponent={() => (
                    <EmptyState
                        icon={<Icon name="receipt" size={64} color={colors.textDisabled} />}
                        title="No Sales Yet"
                        message="Your sales records will appear here"
                        actionLabel="Create First Sale"
                        onAction={() => navigation.navigate('CreateSale')}
                    />
                )}
            />
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    addButton: {
        padding: spacing.xs,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    saleCard: {
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    invoiceNo: {
        ...typography.body,
        fontWeight: '700',
        color: colors.primary,
    },
    status: {
        ...typography.caption,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusPaid: {
        backgroundColor: colors.paid + '20', // Add transparency
        color: colors.paid,
    },
    statusPending: {
        backgroundColor: colors.credit + '20',
        color: colors.credit,
    },
    cardBody: {
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    customerName: {
        ...typography.body,
        color: colors.textPrimary,
    },
    dateText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.sm,
    },
    amountLabel: {
        ...typography.small,
        color: colors.textSecondary,
    },
    amountValue: {
        ...typography.body,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    pendingWrap: {
        alignItems: 'flex-end',
    },
    pendingLabel: {
        ...typography.small,
        color: colors.credit,
    },
    pendingValue: {
        ...typography.body,
        fontWeight: '700',
        color: colors.credit,
    },
});

export default SalesListScreen;
