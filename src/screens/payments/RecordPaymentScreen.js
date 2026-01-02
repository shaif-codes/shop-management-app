import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, Alert, View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { paymentService } from '../../services/payment.service';
import { customerService } from '../../services/customer.service';
import { salesService } from '../../services/sales.service';
import { ScreenContainer, Input, Button, Card } from '../../components';
import { colors, spacing, typography } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RecordPaymentScreen = ({ route, navigation }) => {
    const { customerId, saleId } = route.params || {};
    const [customer, setCustomer] = useState(null);
    const [amount, setAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    // Bill Selection State
    const [pendingBills, setPendingBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [billModalVisible, setBillModalVisible] = useState(false);
    const [loadingBills, setLoadingBills] = useState(false);

    useEffect(() => {
        if (customerId) {
            loadCustomer();
            loadPendingBills();
        }
    }, [customerId, loadCustomer, loadPendingBills]);

    // Auto-select bill if saleId is passed
    useEffect(() => {
        if (saleId && pendingBills.length > 0) {
            const bill = pendingBills.find(b => b._id === saleId);
            if (bill) selectBill(bill);
        }
    }, [saleId, pendingBills]);

    const loadCustomer = useCallback(async () => {
        try {
            const response = await customerService.getById(customerId);
            setCustomer(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load customer details');
        }
    }, [customerId]);

    const loadPendingBills = useCallback(async () => {
        setLoadingBills(true);
        try {
            const response = await salesService.getAll({
                customerId,
                paymentStatus: 'PENDING'
            });
            setPendingBills(response.data.sales || []);
        } catch (error) {
            console.error('Failed to load pending bills', error);
        } finally {
            setLoadingBills(false);
        }
    }, [customerId]);

    const selectBill = (bill) => {
        setSelectedBill(bill);
        setAmount(bill.pendingAmount.toString());
        setBillModalVisible(false);
    };

    const handleSubmit = async () => {
        if (!customerId || !amount || !paymentMode) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if (pendingBills.length > 0 && !selectedBill) {
            Alert.alert('Required', 'Please select a bill to pay against.');
            return;
        }

        const paymentAmount = parseFloat(amount);
        if (paymentAmount <= 0) {
            Alert.alert('Error', 'Amount must be greater than 0');
            return;
        }

        if (selectedBill && paymentAmount > selectedBill.pendingAmount) {
            Alert.alert('Error', `Amount cannot exceed pending bill due (₹${selectedBill.pendingAmount})`);
            return;
        }

        if (customer && paymentAmount > customer.pendingDue) {
            Alert.alert('Error', 'Payment amount exceeds total pending due');
            return;
        }

        setLoading(true);
        try {
            await paymentService.create({
                customerId,
                saleId: selectedBill?._id, // Link payment to specific bill
                amount: paymentAmount,
                paymentMode,
                remarks,
            });

            Alert.alert('Success', 'Payment recorded successfully');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                {customer && (
                    <Card style={styles.customerCard}>
                        <Text style={styles.customerName}>{customer.name}</Text>
                        <View style={styles.dueContainer}>
                            <Text style={styles.dueLabel}>Total Due:</Text>
                            <Text style={styles.dueAmount}>
                                ₹{customer.pendingDue?.toLocaleString() || 0}
                            </Text>
                        </View>
                    </Card>
                )}

                {/* Bill Selection UI */}
                <Text style={styles.label}>Select Bill *</Text>
                <TouchableOpacity
                    style={styles.billSelector}
                    onPress={() => setBillModalVisible(true)}
                    disabled={pendingBills.length === 0}
                >
                    {selectedBill ? (
                        <View>
                            <View style={styles.selectedBillRow}>
                                <Text style={styles.billDate}>{new Date(selectedBill.saleDate).toLocaleDateString()}</Text>
                                <Text style={styles.billAmount}>Due: ₹{selectedBill.pendingAmount}</Text>
                            </View>
                            <Text style={styles.billNumber}>{selectedBill.invoiceNumber}</Text>
                        </View>
                    ) : (
                        <Text style={styles.placeholderText}>
                            {pendingBills.length === 0 ? 'No pending bills' : 'Select a bill to pay'}
                        </Text>
                    )}
                    <Icon name="arrow-drop-down" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                <Input
                    label="Payment Amount *"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Payment Mode *</Text>
                <View style={styles.paymentModes}>
                    {['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE'].map((mode) => (
                        <Button
                            key={mode}
                            title={mode.replace('_', ' ')}
                            variant={paymentMode === mode ? 'primary' : 'outline'}
                            onPress={() => setPaymentMode(mode)}
                            style={styles.modeButton}
                        />
                    ))}
                </View>

                <Input
                    label="Remarks"
                    value={remarks}
                    onChangeText={setRemarks}
                    placeholder="Add any notes (optional)"
                    multiline
                    numberOfLines={3}
                />

                <Button
                    title={loading ? 'Recording...' : 'Record Payment'}
                    onPress={handleSubmit}
                    loading={loading}
                    fullWidth
                    style={styles.button}
                />
            </ScrollView>

            {/* Bill Selection Modal */}
            <Modal
                visible={billModalVisible}
                animationType="slide"
                onRequestClose={() => setBillModalVisible(false)}
            >
                <ScreenContainer>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setBillModalVisible(false)}>
                            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select Pending Bill</Text>
                    </View>
                    <FlatList
                        data={pendingBills}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.billItem} onPress={() => selectBill(item)}>
                                <View style={styles.billLeft}>
                                    <Text style={styles.listBillDate}>{new Date(item.saleDate).toLocaleDateString()}</Text>
                                    <Text style={styles.listBillNumber}>{item.invoiceNumber}</Text>
                                </View>
                                <View style={styles.billRight}>
                                    <Text style={styles.listBillPending}>₹{item.pendingAmount}</Text>
                                    <Text style={styles.listBillTotal}>Total: ₹{item.netAmount}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No pending bills found.</Text>
                        }
                    />
                </ScreenContainer>
            </Modal>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    customerCard: {
        marginBottom: spacing.lg,
        padding: spacing.md,
    },
    customerName: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    dueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dueLabel: {
        ...typography.body,
        color: colors.textSecondary,
    },
    dueAmount: {
        ...typography.h2,
        color: colors.error,
        fontWeight: 'bold',
    },
    label: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    billSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: spacing.md,
        marginBottom: spacing.md,
        backgroundColor: '#FFF',
    },
    selectedBillRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 4,
    },
    billDate: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    billAmount: {
        ...typography.body,
        fontWeight: '700',
        color: colors.primary,
    },
    billNumber: {
        ...typography.caption,
        color: colors.textSecondary,
        fontSize: 12,
    },
    placeholderText: {
        ...typography.body,
        color: colors.textHint,
    },
    paymentModes: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.md,
    },
    modeButton: {
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    button: {
        marginTop: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: spacing.sm,
    },
    modalTitle: {
        ...typography.h3,
        marginLeft: spacing.md,
    },
    listContent: {
        padding: spacing.md,
    },
    billItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginBottom: spacing.md,
        backgroundColor: '#FFF',
    },
    billLeft: {
        justifyContent: 'center',
    },
    listBillDate: {
        ...typography.body,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    listBillNumber: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    billRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    listBillPending: {
        ...typography.h3,
        color: colors.primary,
        marginBottom: 4,
    },
    listBillTotal: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginTop: spacing.xl,
    },
});

export default RecordPaymentScreen;
