import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ScreenContainer, Input, Button, Card, LoadingSpinner } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { updateProfile } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        mobile: user?.mobile || '',
        shopName: user?.tenantId?.shopName || '',
        address: user?.tenantId?.address || '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                mobile: user.mobile || '',
                shopName: user.tenantId?.shopName || '',
                address: user.tenantId?.address || '',
            });
        }
    }, [user]);

    const handleUpdate = async () => {
        try {
            await dispatch(updateProfile(formData)).unwrap();
            Alert.alert('Success', 'Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', error || 'Failed to update profile');
        }
    };

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Icon name="account-circle" size={100} color={colors.primary} />
                    </View>
                    <Text style={styles.emailText}>{user?.email}</Text>
                    <Text style={styles.roleBadge}>{user?.role}</Text>
                </View>

                <Card style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>
                        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                            <Icon name={isEditing ? "close" : "edit"} size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChangeText={(val) => setFormData({ ...formData, name: val })}
                        disabled={!isEditing}
                    />

                    <Input
                        label="Mobile Number"
                        value={formData.mobile}
                        onChangeText={(val) => setFormData({ ...formData, mobile: val })}
                        disabled={!isEditing}
                        keyboardType="phone-pad"
                    />

                    <Input
                        label="Shop Name"
                        value={formData.shopName}
                        onChangeText={(val) => setFormData({ ...formData, shopName: val })}
                        disabled={!isEditing}
                    />

                    <Input
                        label="Shop Address"
                        value={formData.address}
                        onChangeText={(val) => setFormData({ ...formData, address: val })}
                        disabled={!isEditing}
                        multiline
                    />

                    {isEditing && (
                        <Button
                            title="Save Changes"
                            onPress={handleUpdate}
                            loading={loading}
                            style={styles.saveButton}
                        />
                    )}
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Account Info</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Member Since</Text>
                        <Text style={styles.infoValue}>{new Date(user?.createdAt).toLocaleDateString()}</Text>
                    </View>
                </Card>
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatarContainer: {
        marginBottom: spacing.md,
    },
    emailText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    roleBadge: {
        ...typography.caption,
        backgroundColor: colors.primary + '20',
        color: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: spacing.xs,
        overflow: 'hidden',
        fontWeight: 'bold',
    },
    card: {
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    infoLabel: {
        ...typography.body,
        color: colors.textSecondary,
    },
    infoValue: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    saveButton: {
        marginTop: spacing.md,
    },
});

export default ProfileScreen;
