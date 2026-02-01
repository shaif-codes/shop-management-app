import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../theme';

const { width } = Dimensions.get('window');

const SalesChart = ({ data, interval }) => {
    if (!data || data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No sales data available for this period</Text>
            </View>
        );
    }

    // Prepare data for the chart
    const chartData = data
        .slice()
        .reverse()
        .map(item => {
            // Format label for better readability
            let displayLabel = item._id;
            if (interval === 'daily') {
                const date = new Date(item._id);
                displayLabel = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            } else if (interval === 'monthly') {
                const [year, month] = item._id.split('-');
                const date = new Date(year, month - 1);
                displayLabel = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            }

            return {
                value: item.totalSales || 0,
                label: displayLabel,
                dataPointText: `₹${(item.totalSales || 0).toLocaleString()}`,
                labelTextStyle: { color: colors.textSecondary, fontSize: 10 },
            };
        });

    // Calculate dynamic max value for better scaling
    const maxVal = Math.max(...chartData.map(d => d.value), 100);
    const maxValue = Math.ceil(maxVal * 1.2 / 100) * 100;

    return (
        <View style={styles.container}>
            <LineChart
                data={chartData}
                width={width - spacing.lg * 4}
                height={220}
                yAxisLabelWidth={45}
                maxValue={maxValue}
                stepValue={maxValue / 4}
                thickness={3}
                color={colors.primary}
                noOfSections={4}
                animateOnDataChange
                animationDuration={1000}
                areaChart
                LinearGradient={LinearGradient}
                startFillColor={colors.primary}
                startOpacity={0.3}
                endFillColor={colors.primaryLight}
                endOpacity={0.05}
                spacing={70}
                initialSpacing={20}
                endSpacing={20}
                rulesColor={colors.border}
                rulesType="solid"
                xAxisColor={colors.border}
                yAxisColor={colors.border}
                yAxisTextStyle={styles.axisText}
                xAxisLabelTextStyle={styles.axisText}
                dataPointsColor={colors.primaryDark}
                dataPointsRadius={4}
                focusEnabled
                showFractionalValues={false}
                roundToDigits={0}
                yAxisThickness={0}
                xAxisThickness={1}
                hideRules={false}
                pointerConfig={{
                    pointerStripColor: colors.primary,
                    pointerStripWidth: 2,
                    pointerColor: colors.primaryDark,
                    radius: 6,
                    pointerLabelComponent: (items) => {
                        return (
                            <View style={styles.pointerLabel}>
                                <Text style={styles.pointerText}>
                                    {items[0].label}
                                </Text>
                                <Text style={styles.pointerValue}>
                                    ₹{items[0].value.toLocaleString()}
                                </Text>
                            </View>
                        );
                    },
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.sm,
        paddingBottom: spacing.md,
        alignItems: 'center',
    },
    axisText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontSize: 10,
    },
    emptyContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    pointerLabel: {
        padding: spacing.xs,
        backgroundColor: colors.primary,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    pointerText: {
        color: colors.white || '#FFF',
        fontSize: 10,
        ...typography.caption,
    },
    pointerValue: {
        color: colors.white || '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    }
});

export default SalesChart;
