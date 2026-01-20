import React, { useState, useCallback, useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Alert, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { salesService } from '../../services/sales.service';
import { invoiceService } from '../../services/invoice.service';
import { ScreenContainer, LoadingSpinner, Card, Button } from '../../components';
import { spacing, colors, typography } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SaleDetailScreen = ({ route, navigation }) => {
    const { saleId } = route.params;
    const { user } = useSelector((state) => state.auth);
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSale = useCallback(async () => {
        try {
            const res = await salesService.getById(saleId);
            setSale(res.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load sale details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    }, [saleId, navigation]);

    useFocusEffect(
        useCallback(() => {
            fetchSale();
        }, [fetchSale])
    );

    const [menuVisible, setMenuVisible] = useState(false);

    const handleShare = useCallback(async () => {
        setMenuVisible(false);
        if (!sale) return;
        await invoiceService.shareInvoice(sale, user);
    }, [sale, user]);

    const handleEdit = () => {
        setMenuVisible(false);
        navigation.navigate('CreateSale', {
            saleId: sale._id,
            editMode: true,
            initialData: sale
        });
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={{ marginRight: 15, padding: 5 }}
                >
                    <Icon name="more-vert" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleDelete = async () => {
        setMenuVisible(false);
        Alert.alert(
            'Delete Sale',
            'Are you sure you want to delete this sale? This will reverse stock changes and customer totals. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await salesService.delete(saleId);
                            Alert.alert('Success', 'Sale deleted successfully');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', error.message || 'Failed to delete sale');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <LoadingSpinner />;
    if (!sale) return null;

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Invoice Header */}
                <View style={styles.header}>
                    <Text style={styles.shopName}>{sale?.tenantId?.shopName || user?.tenantId?.shopName || 'MY SHOP'}</Text>
                    {(sale?.tenantId?.mobile || user?.tenantId?.mobile) && (
                        <Text style={styles.shopDetails}>Mob: {sale?.tenantId?.mobile || user?.tenantId?.mobile}</Text>
                    )}
                    {(sale?.tenantId?.address || user?.tenantId?.address) && (
                        <Text style={styles.shopDetails}>{sale?.tenantId?.address || user?.tenantId?.address}</Text>
                    )}
                    <Text style={styles.invoiceTitle}>INVOICE</Text>
                </View>

                <View style={styles.infoSection}>
                    <View>
                        <Text style={styles.label}>Bill To:</Text>
                        <Text style={styles.customerName}>{sale.customerName || 'Walking Customer'}</Text>
                        {sale.customerId?.phone && <Text style={styles.customerDetail}>{sale.customerId.phone}</Text>}
                        {sale.customerId?.address && <Text style={styles.customerDetail}>{sale.customerId.address}</Text>}
                    </View>
                    <View style={styles.rightInfo}>
                        <Text style={styles.invoiceNo}>{sale.invoiceNumber}</Text>
                        <Text style={styles.date}>{new Date(sale.saleDate).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.column, styles.colName]}>Item</Text>
                        <Text style={[styles.column, styles.colQty]}>Qty</Text>
                        <Text style={[styles.column, styles.colRate]}>Rate</Text>
                        <Text style={[styles.column, styles.colTotal]}>Total</Text>
                    </View>

                    {sale.items.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.column, styles.colName]}>{item.productName}</Text>
                            <Text style={[styles.column, styles.colQty]}>{item.quantity}</Text>
                            <Text style={[styles.column, styles.colRate]}>₹{item.rate}</Text>
                            <Text style={[styles.column, styles.colTotal]}>₹{item.lineTotal}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals Summary */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Gross Total</Text>
                        <Text style={styles.summaryValue}>₹{sale.grossAmount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Discount</Text>
                        <Text style={styles.summaryValue}>- ₹{sale.discount}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.netRow]}>
                        <Text style={styles.netLabel}>Net Amount</Text>
                        <Text style={styles.netValue}>₹{sale.netAmount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Paid Amount</Text>
                        <Text style={styles.summaryValue}>₹{sale.paidAmount}</Text>
                    </View>
                    {sale.pendingAmount > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.dueLabel}>Balance Due</Text>
                            <Text style={styles.dueValue}>₹{sale.pendingAmount}</Text>
                        </View>
                    )}
                </View>

                {/* Payment History */}
                {sale.payments && sale.payments.length > 0 && (
                    <View style={styles.paymentHistory}>
                        <Text style={styles.historyTitle}>Payment History</Text>
                        <View style={styles.historyHeader}>
                            <Text style={styles.phDate}>Date</Text>
                            <Text style={styles.phMode}>Mode</Text>
                            <Text style={styles.phAmount}>Amount</Text>
                        </View>
                        {sale.payments.map((payment, index) => (
                            <View key={index} style={styles.historyRow}>
                                <Text style={styles.phDate}>{new Date(payment.paymentDate).toLocaleDateString()}</Text>
                                <Text style={styles.phMode}>{payment.paymentMode}</Text>
                                <Text style={styles.phAmount}>₹{payment.amount}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.thanks}>Thank you for your business!</Text>
                </View>
            </ScrollView>

            <View style={styles.screenActions}>
                {sale.pendingAmount > 0 ? (
                    <Button
                        title="Record Payment"
                        onPress={() => navigation.navigate('RecordPayment', {
                            customerId: sale.customerId?._id || sale.customerId,
                            saleId: sale._id
                        })}
                        variant="primary"
                        style={styles.actionBtn}
                        icon={<Icon name="payment" size={20} color="#FFF" />}
                    />
                ) : (
                    <View style={styles.paidBadge}>
                        <Icon name="check-circle" size={20} color={colors.success} />
                        <Text style={styles.paidText}>FULLY PAID</Text>
                    </View>
                )}
                <Button
                    title="Print Invoice"
                    onPress={() => Alert.alert('Info', 'Print functionality coming soon')}
                    variant="outline"
                    style={styles.actionBtn}
                    icon={<Icon name="print" size={20} color={colors.primary} />}
                />
            </View>

            {/* Action Menu Modal */}
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                            <Icon name="edit" size={22} color={colors.primary} />
                            <Text style={styles.menuText}>Edit Sale</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
                            <Icon name="share" size={22} color={colors.primary} />
                            <Text style={styles.menuText}>Share Invoice</Text>
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                            <Icon name="delete-outline" size={22} color={colors.error} />
                            <Text style={[styles.menuText, { color: colors.error }]}>Delete Sale</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        backgroundColor: '#FFF',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        paddingBottom: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    shopName: {
        ...typography.h2,
        color: colors.primary,
        textTransform: 'uppercase',
    },
    shopDetails: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    invoiceTitle: {
        ...typography.h3,
        color: colors.textSecondary,
        letterSpacing: 4,
        marginTop: 4,
    },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    rightInfo: {
        alignItems: 'flex-end',
    },
    label: {
        ...typography.small,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    customerName: {
        ...typography.body,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    customerDetail: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    invoiceNo: {
        ...typography.body,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    date: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    table: {
        marginBottom: spacing.xl,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    column: {
        ...typography.small,
        color: colors.textPrimary,
    },
    colName: { flex: 3 },
    colQty: { flex: 1, textAlign: 'center' },
    colRate: { flex: 1.5, textAlign: 'right' },
    colTotal: { flex: 1.5, textAlign: 'right' },
    summaryContainer: {
        alignSelf: 'flex-end',
        width: '60%',
        marginBottom: spacing.xl,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    summaryLabel: {
        ...typography.small,
        color: colors.textSecondary,
    },
    summaryValue: {
        ...typography.small,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    netRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    netLabel: {
        ...typography.body,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    netValue: {
        ...typography.body,
        fontWeight: '700',
        color: colors.primary,
    },
    dueLabel: {
        ...typography.body,
        fontWeight: '700',
        color: colors.credit,
    },
    dueValue: {
        ...typography.body,
        fontWeight: '700',
        color: colors.credit,
    },
    paymentHistory: {
        marginBottom: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.md,
    },
    historyTitle: {
        ...typography.body,
        fontWeight: '700',
        marginBottom: spacing.sm,
        color: colors.textPrimary,
    },
    historyHeader: {
        flexDirection: 'row',
        paddingVertical: 4,
        marginBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    historyRow: {
        flexDirection: 'row',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    phDate: { flex: 2, ...typography.small, color: colors.textSecondary },
    phMode: { flex: 1, ...typography.small, color: colors.textSecondary, textAlign: 'center' },
    phAmount: { flex: 1, ...typography.small, color: colors.textPrimary, textAlign: 'right', fontWeight: '600' },
    footer: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    paymentInfo: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    thanks: {
        ...typography.body,
        fontStyle: 'italic',
        color: colors.textSecondary,
    },
    screenActions: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.md,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
    },
    actionBtn: {
        flex: 1,
    },
    paidBadge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${colors.success}15`,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    paidText: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.success,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 50, // Approximate header height
        paddingRight: 10,
    },
    menuContainer: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: spacing.xs,
        width: 180,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    menuText: {
        ...typography.body,
        color: colors.textPrimary,
    },
    menuDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.xs,
    },
});

export default SaleDetailScreen;
