import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { reportsService } from '../../services/reports.service';
import {
    Button,
    ScreenContainer,
    DashboardCard,
    LoadingSpinner,
    Card,
    SalesChart,
} from '../../components';
import { colors, spacing, typography } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEffect } from 'react';

const DashboardScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [chartInterval, setChartInterval] = useState('daily');
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadDashboard();
            loadChartData(chartInterval);
        }, [chartInterval])
    );

    const loadChartData = async (interval) => {
        setChartLoading(true);
        try {
            const response = await reportsService.getSalesReport({ groupBy: interval });
            setChartData(response.data?.report || response.report || []);
        } catch (error) {
            console.error('Failed to load chart data:', error);
        } finally {
            setChartLoading(false);
        }
    };

    const loadDashboard = async () => {
        try {
            const response = await reportsService.getDashboard();
            setDashboardData(response.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboard();
        loadChartData(chartInterval);
    };



    if (loading) return <LoadingSpinner />;

    return (
        <ScreenContainer>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard</Text>
                </View>

                <View style={styles.cardsContainer}>
                    <DashboardCard
                        title="Today's Sales"
                        value={`₹${dashboardData?.todaySales?.toLocaleString() || 0}`}
                        icon={<Icon name="trending-up" size={24} color={colors.primary} />}
                        color={colors.primary}
                        onPress={() => navigation.navigate('Reports', { screen: 'SalesReport' })}
                    />
                    <DashboardCard
                        title="Pending Dues"
                        value={`₹${dashboardData?.totalOutstanding?.toLocaleString() || 0}`}
                        icon={<Icon name="account-balance-wallet" size={24} color={colors.error} />}
                        color={colors.error}
                        onPress={() => navigation.navigate('Reports', { screen: 'CreditReport' })}
                    />
                    <DashboardCard
                        title="Recovered"
                        value={`₹${dashboardData?.totalRecovered?.toLocaleString() || 0}`}
                        icon={<Icon name="check-circle" size={24} color={colors.success} />}
                        color={colors.success}
                    />
                    <DashboardCard
                        title="Low Stock"
                        value={dashboardData?.lowStockCount || 0}
                        icon={<Icon name="inventory" size={24} color={colors.warning} />}
                        color={colors.warning}
                        onPress={() => navigation.navigate('Menu', {
                            screen: 'Products',
                            params: { screen: 'LowStockAlerts' }
                        })}
                    />
                </View>

                <Card style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.sectionTitle}>Sales Overview</Text>
                        <View style={styles.intervalButtons}>
                            {['daily', 'monthly', 'yearly'].map((interval) => (
                                <Button
                                    key={interval}
                                    title={interval.charAt(0).toUpperCase()}
                                    variant={chartInterval === interval ? 'primary' : 'outline'}
                                    size="small"
                                    onPress={() => setChartInterval(interval)}
                                    style={styles.intervalButton}
                                />
                            ))}
                        </View>
                    </View>
                    {chartLoading ? (
                        <View style={styles.chartLoader}>
                            <LoadingSpinner />
                        </View>
                    ) : (
                        <SalesChart data={chartData} interval={chartInterval} />
                    )}
                </Card>

                {dashboardData?.topCreditCustomers?.length > 0 && (
                    <Card style={styles.topCustomersCard}>
                        <Text style={styles.sectionTitle}>Top Credit Customers</Text>
                        {dashboardData.topCreditCustomers.map((customer, index) => (
                            <View key={customer.customerId} style={styles.customerRow}>
                                <View style={styles.customerInfo}>
                                    <Text style={styles.customerName}>{customer.name}</Text>
                                    <Text style={styles.customerPhone}>{customer.phone}</Text>
                                </View>
                                <Text style={styles.customerDue}>
                                    ₹{customer.pendingDue.toLocaleString()}
                                </Text>
                            </View>
                        ))}
                    </Card>
                )}
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    topCustomersCard: {
        marginTop: spacing.md,
        padding: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    customerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        ...typography.body,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    customerPhone: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    customerDue: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.error,
    },
    chartCard: {
        marginBottom: spacing.lg,
        padding: spacing.md,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    intervalButtons: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    intervalButton: {
        minWidth: 40,
        height: 30,
        paddingHorizontal: spacing.xs,
    },
    chartLoader: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DashboardScreen;
