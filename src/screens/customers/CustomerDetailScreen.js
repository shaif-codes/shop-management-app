import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text, Alert, FlatList } from 'react-native';
import { useDispatch } from 'react-redux';
import { customerService } from '../../services/customer.service';
import { salesService } from '../../services/sales.service';
import { ScreenContainer, LoadingSpinner, Card, Button } from '../../components';
import { spacing, colors, typography } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomerDetailScreen = ({ route, navigation }) => {
    const { customerId } = route.params;
    const [customer, setCustomer] = useState(null);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [customerRes, salesRes] = await Promise.all([
                customerService.getById(customerId),
                salesService.getAll({ customerId }),
            ]);
            setCustomer(customerRes.data);
            setSales(salesRes.data.sales || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load customer details');
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    const handleDelete = () => {
        Alert.alert(
            'Delete Customer',
            'Are you sure you want to delete this customer?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await customerService.remove(customerId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete customer');
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <LoadingSpinner />;
    if (!customer) return null;

    return (
        <ScreenContainer>
            <ScrollView>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.name}>{customer.name}</Text>
                    <Text style={styles.phone}>{customer.phone}</Text>
                    {customer.address && <Text style={styles.address}>{customer.address}</Text>}
                </View>

                <View style={styles.statsContainer}>
                    <Card style={[styles.statCard, { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
                        <Text style={styles.statLabel}>Total Purchase</Text>
                        <Text style={styles.statValue}>₹{customer.totalPurchase.toLocaleString()}</Text>
                    </Card>
                    <Card style={[styles.statCard, { borderLeftColor: colors.credit, borderLeftWidth: 4 }]}>
                        <Text style={styles.statLabel}>Pending Due</Text>
                        <Text style={styles.statValue}>₹{customer.pendingDue.toLocaleString()}</Text>
                    </Card>
                </View>

                <View style={styles.actionRow}>
                    <Button
                        title="Edit"
                        onPress={() => navigation.navigate('AddCustomer', { customer })}
                        variant="outline"
                        style={styles.actionButton}
                        icon={<Icon name="edit" size={18} color={colors.primary} />}
                    />
                    <Button
                        title="Delete"
                        onPress={handleDelete}
                        variant="outline"
                        style={styles.actionButton}
                        color={colors.error}
                        icon={<Icon name="delete" size={18} color={colors.error} />}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Sales</Text>
                    {sales.length === 0 ? (
                        <Text style={styles.emptyText}>No sales recorded yet.</Text>
                    ) : (
                        sales.map((sale) => (
                            <Card
                                key={sale._id || sale.id}
                                style={styles.saleItem}
                                onPress={() => navigation.navigate('SaleDetail', { saleId: sale._id || sale.id })}
                            >
                                <View style={styles.saleRow}>
                                    <View>
                                        <Text style={styles.invoiceNo}>{sale.invoiceNumber}</Text>
                                        <Text style={styles.saleDate}>{new Date(sale.saleDate).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={styles.amountWrap}>
                                        <Text style={styles.saleAmount}>₹{sale.netAmount.toLocaleString()}</Text>
                                        <Text style={[
                                            styles.paymentStatus,
                                            { color: sale.pendingAmount > 0 ? colors.credit : colors.paid }
                                        ]}>
                                            {sale.pendingAmount > 0 ? 'Pending' : 'Paid'}
                                        </Text>
                                    </View>
                                </View>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {customer.pendingDue > 0 && (
                    <Button
                        title="Record Payment"
                        onPress={() => navigation.navigate('RecordPayment', { customerId: customer._id || customer.id })}
                        variant="secondary"
                        style={{ marginBottom: spacing.sm }}
                        icon={<Icon name="payment" size={20} color="#FFF" />}
                    />
                )}
                <Button
                    title="Create New Sale"
                    onPress={() => navigation.navigate('CreateSale', { customerId: customer._id || customer.id })}
                    fullWidth
                    icon={<Icon name="add-shopping-cart" size={20} color="#FFF" />}
                />
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        ...typography.h1,
        color: colors.primary,
    },
    name: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    phone: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: 4,
    },
    address: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
    },
    statLabel: {
        ...typography.small,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    actionButton: {
        flex: 1,
    },
    section: {
        padding: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.md,
        color: colors.textPrimary,
    },
    saleItem: {
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    saleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    invoiceNo: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    saleDate: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    amountWrap: {
        alignItems: 'flex-end',
    },
    saleAmount: {
        ...typography.body,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    paymentStatus: {
        ...typography.small,
        fontWeight: '600',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    footer: {
        padding: spacing.md,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});

export default CustomerDetailScreen;
