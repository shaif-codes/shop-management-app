import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SalesNavigator from './SalesNavigator';
import PaymentsNavigator from './PaymentsNavigator';
import ReportsNavigator from './ReportsNavigator';
import MenuNavigator from './MenuNavigator';
import { colors, spacing } from '../theme';

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
    <TouchableOpacity
        style={styles.customButtonContainer}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={styles.customButton}>
            {children}
        </View>
    </TouchableOpacity>
);

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
                    marginBottom: 5,
                },
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 5,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    backgroundColor: '#FFFFFF',
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
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
                name="Payments"
                component={PaymentsNavigator}
                options={{
                    title: 'Payments',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="payments" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="SalesTab"
                component={SalesNavigator}
                options={{
                    title: 'Sales',
                    tabBarButton: (props) => (
                        <CustomTabBarButton {...props}>
                            <Icon name="shopping-cart" size={30} color="#FFF" />
                        </CustomTabBarButton>
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

const styles = StyleSheet.create({
    customButtonContainer: {
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        elevation: 5,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
});

export default MainTabNavigator;
