import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { updateStock, fetchProducts } from '../../store/slices/productSlice';
import { ScreenContainer, Input, Button } from '../../components';
import { colors, spacing, typography } from '../../theme';

const AdjustmentTypeButton = ({ value, label, color, currentType, onSelect }) => (
    <TouchableOpacity
        style={[
            styles.typeButton,
            currentType === value && { backgroundColor: color, borderColor: color }
        ]}
        onPress={() => onSelect(value)}
    >
        <Text style={[
            styles.typeButtonText,
            currentType === value && styles.activeTypeText
        ]}>{label}</Text>
    </TouchableOpacity>
);

const StockAdjustmentScreen = ({ navigation, route }) => {
    const { productId, currentStock } = route.params;
    const [quantity, setQuantity] = useState('');
    const [type, setType] = useState('ADD'); // ADD, REMOVE, ADJUST
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
            Alert.alert('Error', 'Please enter a valid quantity');
            return;
        }

        setLoading(true);
        try {
            await dispatch(
                updateStock({
                    id: productId,
                    data: {
                        quantity: Number(quantity),
                        type,
                        remarks,
                    }
                })
            ).unwrap();

            Alert.alert('Success', 'Stock updated successfully');
            dispatch(fetchProducts());
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update stock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <View style={styles.container}>
                <Text style={styles.currentStock}>Current Stock: {currentStock}</Text>

                <Text style={styles.label}>Adjustment Type</Text>
                <View style={styles.typeContainer}>
                    <AdjustmentTypeButton
                        value="ADD"
                        label="Add Stock"
                        color={colors.secondary}
                        currentType={type}
                        onSelect={setType}
                    />
                    <AdjustmentTypeButton
                        value="REMOVE"
                        label="Remove Stock"
                        color={colors.error}
                        currentType={type}
                        onSelect={setType}
                    />
                    <AdjustmentTypeButton
                        value="ADJUST"
                        label="Set Exact"
                        color={colors.primary}
                        currentType={type}
                        onSelect={setType}
                    />
                </View>

                <Input
                    label="Quantity *"
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="Enter quantity"
                    keyboardType="numeric"
                />

                <Input
                    label="Remarks"
                    value={remarks}
                    onChangeText={setRemarks}
                    placeholder="Reason for adjustment"
                    multiline
                />

                <Button
                    title={loading ? 'Updating...' : 'Update Stock'}
                    onPress={handleSubmit}
                    loading={loading}
                    fullWidth
                    style={styles.button}
                />
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    currentStock: {
        ...typography.h3,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    label: {
        ...typography.caption,
        marginBottom: spacing.xs,
        color: colors.textSecondary,
    },
    typeContainer: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
    },
    typeButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        marginHorizontal: 2,
        borderRadius: 4,
    },
    typeButtonText: {
        ...typography.small,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    button: {
        marginTop: spacing.lg,
    },
    activeTypeText: {
        color: '#FFF',
    },
});

export default StockAdjustmentScreen;
