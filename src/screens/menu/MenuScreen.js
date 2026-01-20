import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logout } from '../../store/slices/authSlice';
import { ScreenContainer, Card } from '../../components';
import { colors, spacing, typography } from '../../theme';

const MenuScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const menuItems = [
        {
            title: 'Products',
            icon: 'inventory',
            subtitle: 'Manage your inventory',
            onPress: () => navigation.navigate('Products'),
            color: '#2196F3',
        },
        {
            title: 'Customers',
            icon: 'people',
            subtitle: 'Manage your client list',
            onPress: () => navigation.navigate('Customers'),
            color: '#4CAF50',
        },
        {
            title: 'Profile',
            icon: 'person',
            subtitle: 'Your personal and shop info',
            onPress: () => navigation.navigate('Profile'),
            color: '#FF9800',
        },
    ];

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <Card style={styles.headerCard}>
                    <TouchableOpacity
                        style={styles.profileInfo}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View style={styles.avatarCircle}>
                            <Icon name="store" size={30} color={colors.primary} />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.shopName}>{user?.tenantId?.shopName || 'My Shop'}</Text>
                            <Text style={styles.ownerName}>{user?.name || 'Owner'}</Text>
                            {user?.tenantId?.address && (
                                <Text style={styles.shopAddress}>{user.tenantId.address}</Text>
                            )}
                        </View>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                </Card>

                <View style={styles.menuGrid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                                <Icon name={item.icon} size={28} color={item.color} />
                            </View>
                            <View style={styles.menuTextContainer}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </View>
                            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" size={24} color={colors.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    headerCard: {
        marginBottom: spacing.lg,
        padding: spacing.md,
        backgroundColor: colors.surface,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        marginLeft: spacing.md,
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
    shopAddress: {
        ...typography.caption,
        color: colors.textHint,
        fontSize: 11,
    },
    menuGrid: {
        marginBottom: spacing.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    menuSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        backgroundColor: colors.error + '10',
        borderRadius: 12,
        marginTop: spacing.md,
    },
    logoutText: {
        ...typography.body,
        color: colors.error,
        marginLeft: spacing.sm,
        fontWeight: 'bold',
    },
    versionText: {
        ...typography.caption,
        textAlign: 'center',
        color: colors.textHint,
        marginTop: spacing.xl,
    },
});

export default MenuScreen;
