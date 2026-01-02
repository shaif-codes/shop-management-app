import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { reportsService } from '../../services/reports.service';
import {
    ScreenContainer,
    Card,
    LoadingSpinner,
    Button,
} from '../../components';
import { colors, spacing, typography } from '../../theme';
import { formatShortDate } from '../../utils/date';

const SalesReportScreen = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [groupBy, setGroupBy] = useState('daily');

    useEffect(() => {
        loadReport();
    }, [loadReport]);

    const loadReport = useCallback(async () => {
        setLoading(true);
        try {
            const response = await reportsService.getSalesReport({ groupBy });
            // Handle different possible response structures defensively
            const data = response.data?.report || response.report || [];
            setReportData(data);
        } catch (error) {
            console.error('Report load error:', error);
            Alert.alert('Error', 'Failed to load sales report');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [groupBy]);

    const onRefresh = () => {
        setRefreshing(true);
        loadReport();
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.dateText}>
                    {groupBy === 'product' ? item._id : item._id}
                </Text>
                <Text style={styles.amountText}>
                    ₹{item.totalSales?.toLocaleString() || item.totalRevenue?.toLocaleString()}
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.subText}>
                    {groupBy === 'product' ? `Sold: ${item.totalQuantity}` : `Sales: ${item.count}`}
                </Text>
                {item.totalPaid !== undefined && (
                    <Text style={styles.paidText}>Paid: ₹{item.totalPaid.toLocaleString()}</Text>
                )}
            </View>
        </Card>
    );

    return (
        <ScreenContainer>
            <View style={styles.filterContainer}>
                {['daily', 'monthly', 'product'].map((mode) => (
                    <Button
                        key={mode}
                        title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                        variant={groupBy === mode ? 'primary' : 'outline'}
                        size="small"
                        onPress={() => setGroupBy(mode)}
                        style={styles.filterButton}
                        disabled={loading && groupBy !== mode}
                    />
                ))}
            </View>

            {loading && !refreshing ? (
                <View style={styles.loaderContainer}>
                    <LoadingSpinner />
                </View>
            ) : (
                <FlatList
                    data={reportData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No sales data found for this period</Text>
                        </View>
                    )}
                />
            )}
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterButton: {
        marginRight: spacing.sm,
        minWidth: 80,
    },
    listContainer: {
        padding: spacing.md,
    },
    card: {
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    dateText: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    amountText: {
        ...typography.h4,
        color: colors.primary,
        fontWeight: 'bold',
    },
    subText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    paidText: {
        ...typography.caption,
        color: colors.success,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
    },
});

export default SalesReportScreen;
