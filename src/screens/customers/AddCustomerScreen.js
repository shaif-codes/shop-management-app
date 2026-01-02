import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { createCustomer, fetchCustomers } from '../../store/slices/customerSlice';
import { ScreenContainer, Input, Button } from '../../components';
import { spacing, colors } from '../../theme';

const AddCustomerScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        gstNumber: '',
    });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone) {
            Alert.alert('Error', 'Name and phone are required');
            return;
        }

        setLoading(true);
        try {
            await dispatch(createCustomer(formData)).unwrap();
            Alert.alert('Success', 'Customer added successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        dispatch(fetchCustomers());
                        navigation.goBack();
                    }
                }
            ]);
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to add customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <Input
                    label="Customer Name *"
                    value={formData.name}
                    onChangeText={(val) => handleInputChange('name', val)}
                    placeholder="Enter customer name"
                />

                <Input
                    label="Phone Number *"
                    value={formData.phone}
                    onChangeText={(val) => handleInputChange('phone', val)}
                    placeholder="Enter 10-digit phone number"
                    keyboardType="phone-pad"
                />

                <Input
                    label="Address"
                    value={formData.address}
                    onChangeText={(val) => handleInputChange('address', val)}
                    placeholder="Enter address"
                    multiline
                    numberOfLines={3}
                    style={styles.textArea}
                />

                <Input
                    label="GST Number"
                    value={formData.gstNumber}
                    onChangeText={(val) => handleInputChange('gstNumber', val)}
                    placeholder="Enter GST number (optional)"
                    autoCapitalize="characters"
                />

                <View style={styles.buttonContainer}>
                    <Button
                        title={loading ? 'Adding...' : 'Add Customer'}
                        onPress={handleSubmit}
                        loading={loading}
                        fullWidth
                    />
                </View>
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: spacing.xl,
    },
});

export default AddCustomerScreen;
