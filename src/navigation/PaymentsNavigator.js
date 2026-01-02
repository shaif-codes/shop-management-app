import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RecordPaymentScreen from '../screens/payments/RecordPaymentScreen';
import PaymentHistoryScreen from '../screens/payments/PaymentHistoryScreen';
import { colors, typography } from '../theme';

const Stack = createStackNavigator();

const PaymentsNavigator = () => {
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
                name="PaymentHistory"
                component={PaymentHistoryScreen}
                options={{ title: 'Payment History' }}
            />
            <Stack.Screen
                name="RecordPayment"
                component={RecordPaymentScreen}
                options={{ title: 'Record Payment' }}
            />
        </Stack.Navigator>
    );
};

export default PaymentsNavigator;
