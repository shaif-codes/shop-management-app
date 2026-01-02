import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { Button, Input, ScreenContainer } from '../../components';
import { colors, spacing, typography } from '../../theme';

const RegisterScreen = ({ navigation }) => {
    const [shopName, setShopName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    const handleRegister = async () => {
        if (!shopName || !ownerName || !email || !password) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const result = await dispatch(
            register({ shopName, ownerName, email, mobile, password })
        );

        if (register.rejected.match(result)) {
            Alert.alert('Registration Failed', result.payload || 'Something went wrong');
        }
    };

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Register your shop</Text>

                <Input
                    label="Shop Name *"
                    value={shopName}
                    onChangeText={setShopName}
                    placeholder="Enter shop name"
                />

                <Input
                    label="Owner Name *"
                    value={ownerName}
                    onChangeText={setOwnerName}
                    placeholder="Enter owner name"
                />

                <Input
                    label="Email *"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Input
                    label="Mobile"
                    value={mobile}
                    onChangeText={setMobile}
                    placeholder="Enter mobile number"
                    keyboardType="phone-pad"
                />

                <Input
                    label="Password *"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    secureTextEntry
                />

                <Button
                    title={loading ? 'Creating Account...' : 'Register'}
                    onPress={handleRegister}
                    loading={loading}
                    fullWidth
                    style={styles.button}
                />

                <Button
                    title="Already have an account? Login"
                    variant="text"
                    onPress={() => navigation.navigate('Login')}
                    fullWidth
                />
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    title: {
        ...typography.h1,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    button: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
});

export default RegisterScreen;
