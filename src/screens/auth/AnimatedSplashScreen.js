import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    Easing,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.3);
    const logoTranslateY = useSharedValue(0);

    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);

    const backgroundScale = useSharedValue(1);

    useEffect(() => {
        // Logo entrance
        logoOpacity.value = withTiming(1, { duration: 800 });
        logoScale.value = withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.back(1.5))
        });

        // Text entrance
        textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
        textTranslateY.value = withDelay(600, withTiming(0, {
            duration: 800,
            easing: Easing.out(Easing.exp)
        }));

        // Finish animation and call onFinish
        const timer = setTimeout(() => {
            // Subtle exit transition
            logoTranslateY.value = withTiming(-20, { duration: 600 });
            textTranslateY.value = withTiming(-20, { duration: 600 });
            logoOpacity.value = withTiming(0, { duration: 600 });
            textOpacity.value = withTiming(0, { duration: 600 });

            setTimeout(() => {
                onFinish();
            }, 600);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    const animatedLogoStyle = useAnimatedStyle(() => {
        return {
            opacity: logoOpacity.value,
            transform: [
                { scale: logoScale.value },
                { translateY: logoTranslateY.value }
            ],
        };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            opacity: textOpacity.value,
            transform: [{ translateY: textTranslateY.value }],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
                <Animated.Image
                    source={require('../../../icon.png')}
                    style={styles.logoImage}
                />
            </Animated.View>

            <Animated.View style={[styles.textContainer, animatedTextStyle]}>
                <Text style={styles.appName}>MunshiApp</Text>
                <Text style={styles.tagline}>Smart Shop Management</Text>
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.version}>v1.0.0</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoImage: {
        width: 120,
        height: 120,
        borderRadius: 30,
    },
    textContainer: {
        alignItems: 'center',
    },
    appName: {
        ...typography.h1,
        color: 'white',
        fontSize: 42,
        letterSpacing: 1.5,
    },
    tagline: {
        ...typography.body,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 5,
        fontSize: 14,
        letterSpacing: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    version: {
        ...typography.small,
        color: 'rgba(255, 255, 255, 0.5)',
    }
});

export default SplashScreen;
