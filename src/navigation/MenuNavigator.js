import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MenuScreen from '../screens/menu/MenuScreen';
import ProductNavigator from './ProductNavigator';
import CustomerNavigator from './CustomerNavigator';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors } from '../theme';

const Stack = createStackNavigator();

const MenuNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerTintColor: colors.primary,
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen
                name="MenuHome"
                component={MenuScreen}
                options={{ title: 'More Options' }}
            />
            <Stack.Screen
                name="Products"
                component={ProductNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Customers"
                component={CustomerNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'My Profile' }}
            />
        </Stack.Navigator>
    );
};

export default MenuNavigator;
