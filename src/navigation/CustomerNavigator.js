import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerListScreen from '../screens/customers/CustomerListScreen';
import AddCustomerScreen from '../screens/customers/AddCustomerScreen';
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';
import SaleDetailScreen from '../screens/sales/SaleDetailScreen'; // Support navigation to sale detail
import CreateSaleScreen from '../screens/sales/CreateSaleScreen';
import RecordPaymentScreen from '../screens/payments/RecordPaymentScreen';

const Stack = createStackNavigator();

const CustomerNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { elevation: 0, shadowOpacity: 0 }, headerTitleAlign: 'center' }}>
            <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Customers' }} />
            <Stack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ title: 'Add Customer' }} />
            <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer Details' }} />
            <Stack.Screen name="SaleDetail" component={SaleDetailScreen} options={{ title: 'Invoice' }} />
            <Stack.Screen name="CreateSale" component={CreateSaleScreen} options={{ title: 'New Sale' }} />
            <Stack.Screen name="RecordPayment" component={RecordPaymentScreen} options={{ title: 'Record Payment' }} />
        </Stack.Navigator>
    );
};

export default CustomerNavigator;
