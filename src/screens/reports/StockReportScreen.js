import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { reportsService } from '../../services/reports.service';
import {
    ScreenContainer,
    Card,
    LoadingSpinner,
} from '../../components';
import { colors, spacing, typography } from '../../theme';

const StockReportScreen = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        try {
            const response = await reportsService.getStockReport();
            setReportData(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load stock report');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadReport();
    };

    const renderItem = ({ item }) => (
        <Card style={[styles.card, item.isLowStock && styles.lowStockCard]}>
            <View style={styles.row}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={[styles.stockText, item.isLowStock && styles.lowStockText]}>
                    {item.currentStock} {item.unit}
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.categoryText}>{item.category}</Text>
                <Text style={styles.valueText}>Value: ₹{item.stockValue.toLocaleString()}</Text>
            </View>
            {item.isLowStock && (
                <Text style={styles.warningText}>Low Stock (Min: {item.minStockLevel})</Text>
            )}
        </Card>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <ScreenContainer>
            <View style={styles.headerCards}>
                <Card style={styles.headerCard}>
                    <Text style={styles.headerLabel}>Total Items</Text>
                    <Text style={styles.headerValue}>{reportData?.totalProducts || 0}</Text>
                </Card>
                <Card style={[styles.headerCard, { backgroundColor: colors.warning + '20' }]}>
                    <Text style={styles.headerLabel}>Low Stock</Text>
                    <Text style={[styles.headerValue, { color: colors.warning }]}>{reportData?.lowStockCount || 0}</Text>
                </Card>
            </View>
            <View style={styles.valueCardContainer}>
                <Card style={styles.totalValueCard}>
                    <Text style={styles.totalValueLabel}>Total Stock Value</Text>
                    <Text style={styles.totalValueAmount}>₹{reportData?.totalStockValue?.toLocaleString() || 0}</Text>
                </Card>
            </View>

            <FlatList
                data={reportData?.products || []}
                renderItem={renderItem}
                keyExtractor={(item) => item.productId}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    headerCards: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.md,
    },
    headerCard: {
        flex: 1,
        padding: spacing.md,
        alignItems: 'center',
    },
    headerLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    headerValue: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: 'bold',
    },
    valueCardContainer: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    totalValueCard: {
        padding: spacing.md,
        backgroundColor: colors.primary + '10',
        alignItems: 'center',
    },
    totalValueLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    totalValueAmount: {
        ...typography.h2,
        color: colors.primary,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: spacing.md,
    },
    card: {
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    lowStockCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.error,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    productName: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    stockText: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.success,
    },
    lowStockText: {
        color: colors.error,
    },
    categoryText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    valueText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    warningText: {
        ...typography.caption,
        color: colors.error,
        marginTop: spacing.xs,
        fontStyle: 'italic',
    },
});

export default StockReportScreen;
