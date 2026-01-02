import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { Button, Input, ScreenContainer } from '../../components';
import { colors, spacing, typography } from '../../theme';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        const result = await dispatch(login({ email, password }));
        if (login.rejected.match(result)) {
            Alert.alert('Login Failed', result.payload || 'Something went wrong');
        }
    };

    return (
        <ScreenContainer style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Login to your shop account</Text>

                <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                />

                <Button
                    title={loading ? 'Logging in...' : 'Login'}
                    onPress={handleLogin}
                    loading={loading}
                    fullWidth
                    style={styles.button}
                />

                <Button
                    title="Don't have an account? Register"
                    variant="text"
                    onPress={() => navigation.navigate('Register')}
                    fullWidth
                />
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
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
    },
});

export default LoginScreen;
