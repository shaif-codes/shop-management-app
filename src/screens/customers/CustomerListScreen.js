import React, { useState, useCallback } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCustomers } from '../../store/slices/customerSlice';
import {
    ScreenContainer,
    CustomerListItem,
    LoadingSpinner,
    EmptyState,
    Button,
} from '../../components';
import { spacing, colors, typography } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomerListScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { list, loading, error } = useSelector((state) => state.customers);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchCustomers());
        }, [dispatch])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchCustomers());
        setRefreshing(false);
    };

    const handleAddCustomer = () => {
        navigation.navigate('AddCustomer');
    };

    const handleCustomerPress = (customer) => {
        navigation.navigate('CustomerDetail', { customerId: customer._id || customer.id });
    };

    if (loading && !refreshing && list.length === 0) return <LoadingSpinner />;

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text style={styles.title}>Customers</Text>
                <Button
                    title="Add Customer"
                    onPress={handleAddCustomer}
                    icon={<Icon name="add" size={20} color="#FFF" />}
                    size="small"
                />
            </View>

            {list.length === 0 && !loading ? (
                <EmptyState
                    icon={<Icon name="people" size={64} color={colors.textSecondary} />}
                    title="No Customers Yet"
                    message="Add your first customer to get started"
                    actionLabel="Add Customer"
                    onAction={handleAddCustomer}
                />
            ) : (
                <FlatList
                    data={list}
                    renderItem={({ item }) => (
                        <CustomerListItem
                            customer={item}
                            onPress={() => handleCustomerPress(item)}
                        />
                    )}
                    keyExtractor={(item) => item._id || item.id}
                    contentContainerStyle={styles.listContent}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                />
            )}
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    listContent: {
        paddingBottom: spacing.xl,
    },
});

export default CustomerListScreen;
