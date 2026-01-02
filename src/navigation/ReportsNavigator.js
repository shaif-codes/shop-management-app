import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SalesReportScreen from '../screens/reports/SalesReportScreen';
import CreditReportScreen from '../screens/reports/CreditReportScreen';
import StockReportScreen from '../screens/reports/StockReportScreen';
import { colors, typography } from '../theme';

const Stack = createStackNavigator();

const ReportsNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.white,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                },
                headerTitleStyle: {
                    ...typography.h3,
                    color: colors.textPrimary,
                },
                headerTintColor: colors.primary,
            }}
        >
            <Stack.Screen
                name="SalesReport"
                component={SalesReportScreen}
                options={{ title: 'Sales Report' }}
            />
            <Stack.Screen
                name="CreditReport"
                component={CreditReportScreen}
                options={{ title: 'Credit Report' }}
            />
            <Stack.Screen
                name="StockReport"
                component={StockReportScreen}
                options={{ title: 'Stock Report' }}
            />
        </Stack.Navigator>
    );
};

export default ReportsNavigator;
