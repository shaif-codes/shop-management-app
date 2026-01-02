import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import {
    ScreenContainer,
    Card,
    LoadingSpinner,
    EmptyState,
    Button,
} from '../../components';
import { colors, spacing, typography } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProductListItem = ({ product, onPress }) => {
    const isLowStock = product.currentStock <= product.minStockLevel;

    return (
        <Card onPress={onPress}>
            <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{product.sellingPrice}</Text>
                    <Text style={styles.unit}>per {product.unit}</Text>
                </View>
            </View>

            <View style={styles.stockContainer}>
                <Text style={[styles.stock, isLowStock && styles.lowStock]}>
                    Stock: {product.currentStock} {product.unit}
                </Text>
                {isLowStock && (
                    <View style={styles.lowStockBadge}>
                        <Icon name="warning" size={16} color={colors.warning} />
                        <Text style={styles.lowStockText}>Low Stock</Text>
                    </View>
                )}
            </View>
        </Card>
    );
};

const ProductListScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { list, loading } = useSelector((state) => state.products);
    const [refreshing, setRefreshing] = useState(false);

    const loadProducts = useCallback(async () => {
        await dispatch(fetchProducts());
    }, [dispatch]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    };

    const handleAddProduct = () => {
        navigation.navigate('AddProduct');
    };

    const handleProductPress = (product) => {
        navigation.navigate('ProductDetail', { productId: product._id || product.id });
    };

    if (loading && list.length === 0) return <LoadingSpinner />;

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Button
                    title="Low Stock"
                    onPress={() => navigation.navigate('LowStockAlerts')}
                    variant="outlined"
                    style={styles.lowStockButton}
                    textStyle={{ color: colors.warning }}
                />
                <Button
                    title="Add Product"
                    onPress={handleAddProduct}
                />
            </View>

            {list.length === 0 && !loading ? (
                <EmptyState
                    icon={<Icon name="inventory" size={64} color="#CCC" />}
                    title="No Products Yet"
                    message="Add your first product to get started"
                    actionLabel="Add Product"
                    onAction={handleAddProduct}
                />
            ) : (
                <FlatList
                    data={list}
                    renderItem={({ item }) => (
                        <ProductListItem
                            product={item}
                            onPress={() => handleProductPress(item)}
                        />
                    )}
                    keyExtractor={(item) => item._id || item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: spacing.md,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    list: {
        padding: spacing.md,
        paddingTop: 0,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    productCategory: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        ...typography.h3,
        color: colors.primary,
    },
    unit: {
        ...typography.small,
        color: colors.textSecondary,
    },
    stockContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    stock: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    lowStock: {
        color: colors.warning,
        fontWeight: '600',
    },
    lowStockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${colors.warning}20`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    lowStockText: {
        ...typography.small,
        color: colors.warning,
        marginLeft: 4,
        fontWeight: '600',
    },
    lowStockButton: {
        marginRight: spacing.sm,
    },
});

export default ProductListScreen;
