import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SalesNavigator from './SalesNavigator';
import PaymentsNavigator from './PaymentsNavigator';
import ReportsNavigator from './ReportsNavigator';
import MenuNavigator from './MenuNavigator';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                headerShown: false,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="dashboard" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="SalesTab"
                component={SalesNavigator}
                options={{
                    title: 'Sales',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="shopping-cart" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Payments"
                component={PaymentsNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="payments" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Reports"
                component={ReportsNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="assessment" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Menu"
                component={MenuNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="menu" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;
