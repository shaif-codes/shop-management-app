import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { checkAuthStatus } from '../store/slices/authSlice';
import { LoadingSpinner } from '../components';
import AnimatedSplashScreen from '../screens/auth/AnimatedSplashScreen';

const RootNavigator = () => {
    const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
    const [showSplash, setShowSplash] = React.useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(checkAuthStatus());
    }, [dispatch]);

    if (!isInitialized) {
        return <LoadingSpinner />;
    }

    if (showSplash) {
        return <AnimatedSplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default RootNavigator;
