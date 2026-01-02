import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';

const Card = ({
    children,
    onPress,
    style,
    elevated = true,
}) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[
                styles.card,
                elevated && styles.elevated,
                style,
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
});

export default Card;
