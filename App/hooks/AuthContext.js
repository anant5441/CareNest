import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
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
            const token = await SecureStore.getItemAsync('authToken');
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
            await SecureStore.setItemAsync('authToken', token);
            setAuthToken(token);
            return true;
        } catch (error) {
            console.error('Error storing auth token:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('authToken');
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