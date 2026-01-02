import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { productService } from '../../services/product.service';
import {
    ScreenContainer,
    Card,
    LoadingSpinner,
    EmptyState,
    Button
} from '../../components';
import { colors, spacing, typography } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LowStockAlertsScreen = ({ navigation }) => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLowStock();
    }, []);

    const loadLowStock = async () => {
        try {
            setLoading(true);
            const res = await productService.getLowStock();
            setList(res.data.products);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjust = (product) => {
        navigation.navigate('StockAdjustment', {
            productId: product._id || product.id,
            currentStock: product.currentStock
        });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <ScreenContainer>
            {list.length === 0 ? (
                <EmptyState
                    icon={<Icon name="check-circle" size={64} color={colors.success} />}
                    title="All Good!"
                    message="No low stock items found"
                />
            ) : (
                <FlatList
                    data={list}
                    keyExtractor={(item) => item._id || item.id}
                    renderItem={({ item }) => (
                        <Card>
                            <View style={styles.header}>
                                <View>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <View style={styles.badge}>
                                        <Icon name="warning" size={12} color={colors.warning} />
                                        <Text style={styles.badgeText}>Low Stock</Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.stock}>
                                        {item.currentStock} / {item.minStockLevel} {item.unit}
                                    </Text>
                                    <Text style={styles.label}>Current / Min</Text>
                                </View>
                            </View>

                            <Button
                                title="Restock"
                                onPress={() => handleAdjust(item)}
                                style={styles.button}
                                size="small"
                            />
                        </Card>
                    )}
                    contentContainerStyle={styles.list}
                />
            )}
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    list: {
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    name: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    stock: {
        ...typography.h3,
        color: colors.warning,
    },
    label: {
        ...typography.small,
        color: colors.textSecondary,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    badgeText: {
        ...typography.small,
        color: colors.warning,
        marginLeft: 4,
    },
    button: {
        marginTop: spacing.sm,
    }
});

export default LowStockAlertsScreen;
