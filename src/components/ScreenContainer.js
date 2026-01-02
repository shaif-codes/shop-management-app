import React from 'react';
import { SafeAreaView, StyleSheet, View, StatusBar } from 'react-native';
import { colors } from '../theme';

const ScreenContainer = ({ children, style }) => {
    return (
        <SafeAreaView style={[styles.container, style]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <View style={styles.content}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
});

export default ScreenContainer;
