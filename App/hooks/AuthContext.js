import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Storage helper functions
const storageHelper = {
    async getItem(key) {
        if (Platform.OS === 'web') {
            // Use localStorage for web/Windows
            return localStorage.getItem(key);
        } else {
            // Use SecureStore for mobile
            return await SecureStore.getItemAsync(key);
        }
    },

    async setItem(key, value) {
        if (Platform.OS === 'web') {
            // Use localStorage for web/Windows
            localStorage.setItem(key, value);
        } else {
            // Use SecureStore for mobile
            await SecureStore.setItemAsync(key, value);
        }
    },

    async removeItem(key) {
        if (Platform.OS === 'web') {
            // Use localStorage for web/Windows
            localStorage.removeItem(key);
        } else {
            // Use SecureStore for mobile
            await SecureStore.deleteItemAsync(key);
        }
    }
};

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on app startup
    useEffect(() => {
        checkAuthToken();
    }, []);

    const checkAuthToken = async () => {
        try {
            const token = await storageHelper.getItem('authToken');
            if (token) {
                setAuthToken(token);
            }
        } catch (error) {
            console.error('Error checking auth token:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (token) => {
        try {
            await storageHelper.setItem('authToken', token);
            setAuthToken(token);
            return true;
        } catch (error) {
            console.error('Error storing auth token:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await storageHelper.removeItem('authToken');
            setAuthToken(null);
        } catch (error) {
            console.error('Error removing auth token:', error);
        }
    };

    const value = {
        authToken,
        isAuthenticated: !!authToken,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};