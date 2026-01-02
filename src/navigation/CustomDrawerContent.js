import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logout } from '../store/slices/authSlice';
import { colors, spacing, typography } from '../theme';

const CustomDrawerContent = (props) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
            <View style={styles.header}>
                <View style={styles.avatarCircle}>
                    <Icon name="store" size={40} color={colors.primary} />
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.shopName}>{user?.tenantId?.shopName || 'My Shop'}</Text>
                    <Text style={styles.ownerName}>{user?.name || 'Owner'}</Text>
                </View>
            </View>

            <View style={styles.drawerItemsContainer}>
                <DrawerItemList {...props} />
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" size={24} color={colors.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        marginLeft: spacing.md,
        flex: 1,
    },
    shopName: {
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: 'bold',
    },
    ownerName: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    drawerItemsContainer: {
        flex: 1,
        paddingTop: spacing.sm,
    },
    footer: {
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    logoutText: {
        ...typography.body,
        color: colors.error,
        marginLeft: spacing.md,
        fontWeight: '600',
    },
});

export default CustomDrawerContent;
