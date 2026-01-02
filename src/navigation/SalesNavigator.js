import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SalesListScreen from '../screens/sales/SalesListScreen';
import CreateSaleScreen from '../screens/sales/CreateSaleScreen';
import SaleDetailScreen from '../screens/sales/SaleDetailScreen';
import RecordPaymentScreen from '../screens/payments/RecordPaymentScreen';
import AddCustomerScreen from '../screens/customers/AddCustomerScreen';
import AddProductScreen from '../screens/products/AddProductScreen';

const Stack = createStackNavigator();

const SalesNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { elevation: 0, shadowOpacity: 0 }, headerTitleAlign: 'center' }}>
            <Stack.Screen name="SalesList" component={SalesListScreen} options={{ title: 'Sales' }} />
            <Stack.Screen name="CreateSale" component={CreateSaleScreen} options={{ title: 'New Sale' }} />
            <Stack.Screen name="SaleDetail" component={SaleDetailScreen} options={{ title: 'Invoice' }} />
            <Stack.Screen name="RecordPayment" component={RecordPaymentScreen} options={{ title: 'Record Payment' }} />
            <Stack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ title: 'Add Customer' }} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Add Product' }} />
        </Stack.Navigator>
    );
};

export default SalesNavigator;
