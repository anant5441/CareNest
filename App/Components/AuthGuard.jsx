import React from 'react';
import { useAuth } from '../hooks/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import LoadingScreen from './LoadingScreen';

const AuthGuard = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/stack/login');
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return null; // Will redirect to login via useEffect
    }

    return children;
};

export default AuthGuard;