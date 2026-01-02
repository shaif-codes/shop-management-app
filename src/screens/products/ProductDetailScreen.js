import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { productService } from '../../services/product.service'; // Direct service for details or use check list
import { ScreenContainer, Button, LoadingSpinner } from '../../components';
import { colors, spacing, typography } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchProducts } from '../../store/slices/productSlice';

const ProductDetailScreen = ({ navigation, route }) => {
    const { productId } = route.params;
    const dispatch = useDispatch();
    // We can select from list or fetch fresh. Fetching fresh is better for details.
    // But for now, let's find in store first.
    const productFromStore = useSelector(state => state.products.list.find(p => p._id === productId || p.id === productId));
    const [product, setProduct] = useState(productFromStore);
    const [loading, setLoading] = useState(!productFromStore);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const res = await productService.getById(productId);
                setProduct(res.data);
            } catch (error) {
                Alert.alert('Error', 'Failed to load product details');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [productId, navigation]);

    // Also listen to store updates (e.g. after stock adjustment)
    useEffect(() => {
        if (productFromStore) {
            setProduct(productFromStore);
        }
    }, [productFromStore]);

    const handleAdjustStock = () => {
        navigation.navigate('StockAdjustment', {
            productId: product._id || product.id,
            currentStock: product.currentStock
        });
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await productService.delete(product._id || product.id);
                            dispatch(fetchProducts()); // Refresh list
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete product');
                        }
                    }
                }
            ]
        );
    };

    if (loading || !product) return <LoadingSpinner />;

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.name}>{product.name}</Text>
                        <Text style={styles.category}>{product.category}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>₹{product.sellingPrice}</Text>
                        <Text style={styles.unit}>per {product.unit}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stock Information</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Current Stock:</Text>
                        <Text style={styles.value}>{product.currentStock} {product.unit}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Minimum Level:</Text>
                        <Text style={styles.value}>{product.minStockLevel} {product.unit}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Purchase Price:</Text>
                        <Text style={styles.value}>₹{product.purchasePrice}</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <Button
                        title="Adjust Stock"
                        onPress={handleAdjustStock}
                        icon={<Icon name="edit" size={20} color="#FFF" />}
                        style={styles.actionButton}
                    />
                    <Button
                        title="Delete Product"
                        onPress={handleDelete}
                        variant="outlined"
                        style={[styles.actionButton, styles.deleteButton]}
                        textStyle={{ color: colors.error }}
                    />
                </View>
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    name: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    category: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: 4,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        ...typography.h2,
        color: colors.primary,
    },
    unit: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing.xl,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: 8,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.md,
        color: colors.textPrimary,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    label: {
        ...typography.body,
        color: colors.textSecondary,
    },
    value: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    actions: {
        gap: spacing.md,
    },
    actionButton: {
        marginBottom: spacing.md,
    },
    deleteButton: {
        borderColor: colors.error,
    }
});

export default ProductDetailScreen;
