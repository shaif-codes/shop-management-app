import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    leftIcon,
    rightIcon,
    disabled = false,
    autoCapitalize,
    style,
    inputStyle,
    containerStyle,
    inputContainerStyle,
}) => {
    return (
        <View style={[styles.container, containerStyle || style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[styles.inputContainer, inputContainerStyle, error && styles.inputError]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[styles.input, inputStyle, multiline && styles.multiline]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textDisabled}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    editable={!disabled}
                    autoCapitalize={autoCapitalize}
                />

                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: colors.textPrimary,
    },
    multiline: {
        height: 100,
        textAlignVertical: 'top',
        paddingVertical: spacing.sm,
    },
    inputError: {
        borderColor: colors.error,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        marginTop: spacing.xs,
    },
    leftIcon: {
        marginRight: spacing.sm,
    },
    rightIcon: {
        marginLeft: spacing.sm,
    },
});

export default Input;
