import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { reportsService } from '../../services/reports.service';
import {
    ScreenContainer,
    Card,
    LoadingSpinner,
} from '../../components';
import { colors, spacing, typography } from '../../theme';

const CreditReportScreen = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        try {
            const response = await reportsService.getCreditReport();
            setReportData(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load credit report');
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
        <Card style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.customerName}>{item.name}</Text>
                <Text style={styles.dueAmount}>₹{item.pendingDue.toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.phoneText}>{item.phone}</Text>
                <Text style={styles.statsText}>
                    Paid: ₹{item.totalPaid.toLocaleString()} / Total: ₹{item.totalPurchase.toLocaleString()}
                </Text>
            </View>
        </Card>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <ScreenContainer>
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryLabel}>Total Outstanding Credit</Text>
                <Text style={styles.summaryValue}>₹{reportData?.totalCredit?.toLocaleString() || 0}</Text>
            </View>

            <FlatList
                data={reportData?.customers || []}
                renderItem={renderItem}
                keyExtractor={(item) => item.customerId}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    summaryContainer: {
        padding: spacing.xl,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    summaryLabel: {
        ...typography.body,
        color: colors.white,
        opacity: 0.8,
        marginBottom: spacing.xs,
    },
    summaryValue: {
        ...typography.h1,
        color: colors.white,
        fontWeight: 'bold',
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
    customerName: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    dueAmount: {
        ...typography.h4,
        color: colors.error,
        fontWeight: 'bold',
    },
    phoneText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    statsText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
});

export default CreditReportScreen;
