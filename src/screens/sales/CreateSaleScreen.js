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

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState('0');
    const [paidAmount, setPaidAmount] = useState('0');
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [loading, setLoading] = useState(false);
    const [expandedItemIndex, setExpandedItemIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [customerModalVisible, setCustomerModalVisible] = useState(false);

    const editMode = route.params?.editMode;
    const saleId = route.params?.saleId;
    const initialData = route.params?.initialData;
    const initialCustomerIdParam = route.params?.customerId;

    useEffect(() => {
        if (editMode && initialData) {
            setSelectedCustomer(initialData.customerId);
            setItems(initialData.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                rate: item.rate,
                maxStock: 9999 // In edit mode, stock levels are tricky, ideally we fetch current stock + old quantity
            })));
            setDiscount(initialData.discount.toString());
            setPaidAmount(initialData.paidAmount.toString());
            setPaymentMode(initialData.paymentMode);

            navigation.setOptions({ title: 'Edit Sale' });
        }
    }, [editMode, initialData, navigation]);

    // For customer search


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
        if (initialCustomerIdParam && customers.length > 0 && !editMode) {
            const customer = customers.find(c => (c._id || c.id) === initialCustomerIdParam);
            if (customer) setSelectedCustomer(customer);
        }
    }, [initialCustomerIdParam, customers, editMode]);

    useEffect(() => {
        if (searchModalVisible && searchQuery.length === 0) {
            searchProducts('');
        }
    }, [searchModalVisible, searchQuery]);

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

        // Allow empty string for better UX while typing
        if (qty === '') {
            item.quantity = '';
            setItems(newItems);
            return;
        }

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
        if (expandedItemIndex === index) setExpandedItemIndex(null);
    };

    const updateItemRate = (index, val) => {
        const newItems = [...items];

        if (val === '') {
            newItems[index].rate = '';
            setItems(newItems);
            return;
        }

        newItems[index].rate = parseFloat(val) || 0;
        setItems(newItems);
    };

    const toggleExpand = (index) => {
        setExpandedItemIndex(expandedItemIndex === index ? null : index);
    };

    const { grossAmount, netAmount, pendingAmount } = useMemo(() => {
        const gross = items.reduce((sum, item) => {
            const q = parseFloat(item.quantity) || 0;
            const r = parseFloat(item.rate) || 0;
            return sum + (q * r);
        }, 0);
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
        const paid = parseFloat(paidAmount) || 0;
        if (isNaN(paid) || paid < 0) {
            Alert.alert('Error', 'Please enter a valid paid amount');
            return;
        }

        if (paid > netAmount) {
            Alert.alert('Error', 'Paid amount cannot be greater than net amount');
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

            if (editMode) {
                await salesService.update(saleId, saleData);
                Alert.alert('Success', 'Sale updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                await salesService.create(saleData);
                Alert.alert('Success', 'Sale created successfully', [
                    { text: 'OK', onPress: () => navigation.popToTop() }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', error.message || `Failed to ${editMode ? 'update' : 'create'} sale`);
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
                            {!initialCustomerIdParam && (
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

                    {items.map((item, index) => {
                        const isExpanded = expandedItemIndex === index;
                        return (
                            <View key={item.productId} style={styles.itemContainer}>
                                <TouchableOpacity
                                    style={styles.itemHeader}
                                    onPress={() => toggleExpand(index)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName}>{item.productName}</Text>
                                        {!isExpanded && (
                                            <Text style={styles.itemRateText}>
                                                Qty: {item.quantity} x ₹{item.rate}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.headerRight}>
                                        <Text style={styles.itemTotal}>₹{item.quantity * item.rate}</Text>
                                        <Icon
                                            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                            size={24}
                                            color={colors.textSecondary}
                                        />
                                    </View>
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={styles.itemEditRow}>
                                        <View style={styles.editInputGroup}>
                                            <Text style={styles.inputLabel}>Rate</Text>
                                            <Input
                                                value={item.rate.toString()}
                                                onChangeText={(val) => updateItemRate(index, val)}
                                                keyboardType="numeric"
                                                leftIcon={<Text style={styles.currencySymbol}>₹</Text>}
                                                containerStyle={styles.editInputContainer}
                                                inputContainerStyle={styles.smallInputContainer}
                                                inputStyle={styles.editInput}
                                            />
                                        </View>
                                        <View style={styles.editInputGroup}>
                                            <Text style={styles.inputLabel}>Qty</Text>
                                            <Input
                                                value={item.quantity.toString()}
                                                onChangeText={(val) => updateItemQuantity(index, val)}
                                                keyboardType="numeric"
                                                containerStyle={styles.editInputContainer}
                                                inputContainerStyle={styles.smallInputContainer}
                                                inputStyle={styles.editInput}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            style={styles.itemDeleteBtn}
                                            onPress={() => removeItem(index)}
                                        >
                                            <Icon name="delete-outline" size={24} color={colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}
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
                    title={loading ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Update Sale" : "Complete Sale")}
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
    itemContainer: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: spacing.sm,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    itemRateText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    itemTotal: {
        ...typography.body,
        fontWeight: '700',
        color: colors.textPrimary,
        minWidth: 80,
        textAlign: 'right',
    },
    itemEditRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: spacing.sm,
        marginTop: spacing.sm,
        paddingBottom: spacing.xs,
    },
    editInputGroup: {
        flex: 1,
    },
    inputLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    editInputContainer: {
        marginBottom: 0,
    },
    editInput: {
        height: 40,
        paddingVertical: 0,
        fontSize: 15,
        color: colors.textPrimary,
    },
    currencySymbol: {
        fontSize: 14,
        color: colors.textSecondary,
        marginRight: 2,
    },
    itemDeleteBtn: {
        padding: spacing.xs,
        marginBottom: 5,
    },
    smallInputContainer: {
        paddingHorizontal: spacing.sm,
        height: 40,
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
