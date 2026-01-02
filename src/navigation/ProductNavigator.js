import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProductListScreen from '../screens/products/ProductListScreen';
import AddProductScreen from '../screens/products/AddProductScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import StockAdjustmentScreen from '../screens/products/StockAdjustmentScreen';
import LowStockAlertsScreen from '../screens/products/LowStockAlertsScreen';

const Stack = createStackNavigator();

const ProductNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ProductList"
                component={ProductListScreen}
                options={{ title: 'Products' }}
            />
            <Stack.Screen
                name="AddProduct"
                component={AddProductScreen}
                options={{ title: 'Add Product' }}
            />
            <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{ title: 'Product Details' }}
            />
            <Stack.Screen
                name="StockAdjustment"
                component={StockAdjustmentScreen}
                options={{ title: 'Adjust Stock' }}
            />
            <Stack.Screen
                name="LowStockAlerts"
                component={LowStockAlertsScreen}
                options={{ title: 'Low Stock Alerts' }}
            />
        </Stack.Navigator>
    );
};

export default ProductNavigator;
