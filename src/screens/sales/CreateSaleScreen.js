import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    FlatList,
    Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenContainer, Input, Button, Card } from '../../components';
import { spacing, colors, typography } from '../../theme';
import { salesService } from '../../services/sales.service';
import { productService } from '../../services/product.service';
import { fetchCustomers } from '../../store/slices/customerSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CreateSaleScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { list: customers } = useSelector((state) => state.customers);
    const initialCustomerId = route.params?.customerId;

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState('0');
    const [paidAmount, setPaidAmount] = useState('0');
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [loading, setLoading] = useState(false);

    // For product search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchModalVisible, setSearchModalVisible] = useState(false);

    useEffect(() => {
        if (searchModalVisible && searchQuery.length === 0) {
            searchProducts('');
        }
    }, [searchModalVisible]);

    // For customer search
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [customerModalVisible, setCustomerModalVisible] = useState(false);

    const filteredCustomers = useMemo(() => {
        if (!customerSearchQuery) return customers;
        return customers.filter(c =>
            c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            c.phone.includes(customerSearchQuery)
        );
    }, [customers, customerSearchQuery]);

    useEffect(() => {
        dispatch(fetchCustomers());
    }, [dispatch]);

    useEffect(() => {
        if (initialCustomerId && customers.length > 0) {
            const customer = customers.find(c => (c._id || c.id) === initialCustomerId);
            if (customer) setSelectedCustomer(customer);
        }
    }, [initialCustomerId, customers]);

    const searchProducts = async (query) => {
        setSearchQuery(query);
        try {
            const res = await productService.getAll({ search: query });
            setSearchResults(res.data.products || []);
        } catch (error) {
            console.error('Search error', error);
        }
    };

    const addItem = (product) => {
        const existing = items.find(item => item.productId === (product._id || product.id));
        if (existing) {
            Alert.alert('Info', 'Product already added. Update quantity in the list.');
            return;
        }
        if (product.currentStock <= 0) {
            Alert.alert('Error', 'Product out of stock');
            return;
        }

        setItems([...items, {
            productId: product._id || product.id,
            productName: product.name,
            quantity: 1,
            rate: product.sellingPrice,
            maxStock: product.currentStock
        }]);
        setSearchModalVisible(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const updateItemQuantity = (index, qty) => {
        const newItems = [...items];
        const item = newItems[index];
        const quantity = parseInt(qty) || 0;

        if (quantity > item.maxStock) {
            Alert.alert('Warning', `Only ${item.maxStock} units available in stock`);
            item.quantity = item.maxStock;
        } else {
            item.quantity = quantity;
        }
        setItems(newItems);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const { grossAmount, netAmount, pendingAmount } = useMemo(() => {
        const gross = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        const disc = parseFloat(discount) || 0;
        const net = Math.max(0, gross - disc);
        const paid = parseFloat(paidAmount) || 0;
        const pending = Math.max(0, net - paid);
        return { grossAmount: gross, netAmount: net, pendingAmount: pending };
    }, [items, discount, paidAmount]);

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            Alert.alert('Error', 'Please select a customer');
            return;
        }
        if (items.length === 0) {
            Alert.alert('Error', 'Please add at least one item');
            return;
        }
        if (items.some(item => item.quantity <= 0)) {
            Alert.alert('Error', 'Quantity must be greater than 0');
            return;
        }

        setLoading(true);
        try {
            const saleData = {
                customerId: selectedCustomer._id || selectedCustomer.id,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    rate: item.rate
                })),
                grossAmount,
                discount: parseFloat(discount) || 0,
                netAmount,
                paidAmount: parseFloat(paidAmount) || 0,
                paymentMode,
            };

            await salesService.create(saleData);
            Alert.alert('Success', 'Sale created successfully', [
                { text: 'OK', onPress: () => navigation.popToTop() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to create sale');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Customer Selection */}
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Customer</Text>
                    {selectedCustomer ? (
                        <View style={styles.selectedCustomer}>
                            <View>
                                <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                                <Text style={styles.customerPhone}>{selectedCustomer.phone}</Text>
                            </View>
                            {!initialCustomerId && (
                                <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                                    <Icon name="close" size={24} color={colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setCustomerModalVisible(true)}
                        >
                            <Text style={styles.selectButtonText}>Select Customer</Text>
                            <Icon name="person-add" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </Card>

                {/* Items List */}
                <Card style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Items</Text>
                        <Button
                            title="Add Item"
                            size="small"
                            variant="outline"
                            onPress={() => setSearchModalVisible(true)}
                            icon={<Icon name="add" size={16} color={colors.primary} />}
                        />
                    </View>

                    {items.map((item, index) => (
                        <View key={item.productId} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.productName}</Text>
                                <Text style={styles.itemRate}>₹{item.rate} / unit</Text>
                            </View>
                            <View style={styles.itemActions}>
                                <Input
                                    value={item.quantity.toString()}
                                    onChangeText={(val) => updateItemQuantity(index, val)}
                                    keyboardType="numeric"
                                    containerStyle={styles.qtyContainer}
                                    inputContainerStyle={styles.smallInputContainer}
                                    inputStyle={styles.qtyTextInput}
                                />
                                <Text style={styles.itemTotal}>₹{item.quantity * item.rate}</Text>
                                <TouchableOpacity onPress={() => removeItem(index)}>
                                    <Icon name="delete-outline" size={20} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    {items.length === 0 && (
                        <Text style={styles.emptyText}>No items added yet</Text>
                    )}
                </Card>

                {/* Totals & Payment */}
                <Card style={styles.sectionCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Gross Amount</Text>
                        <Text style={styles.summaryValue}>₹{grossAmount}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Discount</Text>
                        <Input
                            value={discount}
                            onChangeText={setDiscount}
                            keyboardType="numeric"
                            containerStyle={styles.summaryInputContainer}
                            inputContainerStyle={styles.smallInputContainer}
                            inputStyle={styles.summaryTextInput}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.netLabel}>Net Amount</Text>
                        <Text style={styles.netValue}>₹{netAmount}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Paid Amount</Text>
                        <Input
                            value={paidAmount}
                            onChangeText={setPaidAmount}
                            keyboardType="numeric"
                            containerStyle={styles.summaryInputContainer}
                            inputContainerStyle={styles.smallInputContainer}
                            inputStyle={styles.summaryTextInput}
                        />
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Payment Mode</Text>
                        <View style={styles.modeContainer}>
                            {['CASH', 'UPI', 'CARD'].map(mode => (
                                <TouchableOpacity
                                    key={mode}
                                    style={[styles.modeButton, paymentMode === mode && styles.modeButtonActive]}
                                    onPress={() => setPaymentMode(mode)}
                                >
                                    <Text style={[styles.modeText, paymentMode === mode && styles.modeTextActive]}>{mode}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {pendingAmount > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.dueLabel}>Balance Due</Text>
                            <Text style={styles.dueValue}>₹{pendingAmount}</Text>
                        </View>
                    )}
                </Card>

                <Button
                    title={loading ? "Creating..." : "Complete Sale"}
                    onPress={handleSubmit}
                    loading={loading}
                    fullWidth
                    style={styles.submitButton}
                />
            </ScrollView>

            {/* Product Search Modal */}
            <Modal
                visible={searchModalVisible}
                animationType="slide"
                onRequestClose={() => setSearchModalVisible(false)}
            >
                <ScreenContainer>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
                            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChangeText={searchProducts}
                            containerStyle={styles.modalSearchInput}
                            autoFocus
                        />
                        <TouchableOpacity
                            onPress={() => {
                                setSearchModalVisible(false);
                                navigation.navigate('AddProduct');
                            }}
                            style={styles.modalAddButton}
                        >
                            <Icon name="add-box" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={searchResults}
                        keyExtractor={item => item._id || item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.searchResultItem} onPress={() => addItem(item)}>
                                <View>
                                    <Text style={styles.resultName}>{item.name}</Text>
                                    <Text style={styles.resultStock}>Stock: {item.currentStock} {item.unit}</Text>
                                </View>
                                <Text style={styles.resultPrice}>₹{item.sellingPrice}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <View style={styles.modalEmptyContainer}>
                                <Text style={styles.emptyText}>
                                    {searchQuery.length === 0 ? 'Loading products...' : 'No products found'}
                                </Text>
                                <Button
                                    title="Add New Product"
                                    onPress={() => {
                                        setSearchModalVisible(false);
                                        navigation.navigate('AddProduct');
                                    }}
                                    size="small"
                                    style={{ marginTop: spacing.md }}
                                />
                            </View>
                        )}
                    />
                </ScreenContainer>
            </Modal>

            {/* Customer Search Modal */}
            <Modal
                visible={customerModalVisible}
                animationType="slide"
                onRequestClose={() => setCustomerModalVisible(false)}
            >
                <ScreenContainer>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setCustomerModalVisible(false)}>
                            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Input
                            placeholder="Search customers..."
                            value={customerSearchQuery}
                            onChangeText={setCustomerSearchQuery}
                            containerStyle={styles.modalSearchInput}
                            autoFocus
                        />
                        <TouchableOpacity
                            onPress={() => {
                                setCustomerModalVisible(false);
                                navigation.navigate('AddCustomer');
                            }}
                            style={styles.modalAddButton}
                        >
                            <Icon name="person-add" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={filteredCustomers}
                        keyExtractor={item => item._id || item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.searchResultItem}
                                onPress={() => {
                                    setSelectedCustomer(item);
                                    setCustomerModalVisible(false);
                                    setCustomerSearchQuery('');
                                }}
                            >
                                <View>
                                    <Text style={styles.resultName}>{item.name}</Text>
                                    <Text style={styles.resultStock}>{item.phone}</Text>
                                </View>
                                <Icon name="chevron-right" size={24} color={colors.textDisabled} />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <View style={styles.modalEmptyContainer}>
                                <Text style={styles.emptyText}>No customers found</Text>
                                <Button
                                    title="Add New Customer"
                                    onPress={() => {
                                        setCustomerModalVisible(false);
                                        navigation.navigate('AddCustomer');
                                    }}
                                    size="small"
                                />
                            </View>
                        )}
                    />
                </ScreenContainer>
            </Modal>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    sectionCard: {
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    selectedCustomer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    customerName: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    customerPhone: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    selectButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        borderStyle: 'dashed',
    },
    selectButtonText: {
        ...typography.body,
        color: colors.primary,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    itemRate: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    qtyContainer: {
        width: 100,
        marginBottom: 0,
    },
    smallInputContainer: {
        paddingHorizontal: spacing.sm,
        height: 40,
    },
    qtyTextInput: {
        height: 40,
        paddingVertical: 0,
        textAlign: 'center',
        fontSize: 16,
        color: colors.textPrimary,
    },
    summaryInputContainer: {
        width: 120,
        marginBottom: 0,
    },
    summaryTextInput: {
        height: 40,
        paddingVertical: 0,
        textAlign: 'right',
        fontSize: 16,
        color: colors.textPrimary,
    },
    itemTotal: {
        ...typography.body,
        fontWeight: '700',
        width: 80,
        textAlign: 'right',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    summaryLabel: {
        ...typography.body,
        color: colors.textSecondary,
    },
    summaryValue: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
    },
    netLabel: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    netValue: {
        ...typography.h3,
        color: colors.primary,
    },
    dueLabel: {
        ...typography.body,
        color: colors.credit,
        fontWeight: '700',
    },
    dueValue: {
        ...typography.body,
        color: colors.credit,
        fontWeight: '700',
    },
    modeContainer: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    modeButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modeButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    modeText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    modeTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },
    submitButton: {
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
    emptyText: {
        ...typography.body,
        color: colors.textDisabled,
        textAlign: 'center',
        marginVertical: spacing.md,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalSearchInput: {
        flex: 1,
        marginBottom: 0,
    },
    searchResultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    resultName: {
        ...typography.body,
        fontWeight: '600',
    },
    resultStock: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    resultPrice: {
        ...typography.body,
        fontWeight: '700',
        color: colors.primary,
    },
    modalAddButton: {
        padding: spacing.xs,
    },
    modalEmptyContainer: {
        flex: 1,
        padding: spacing.xl,
        alignItems: 'center',
    },
});

export default CreateSaleScreen;
