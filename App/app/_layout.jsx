import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../hooks/AuthContext';
import LoadingScreen from '../Components/LoadingScreen';

const AuthWrapper = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return; // Don't redirect while loading

        const inAuthGroup = segments[0] === '(tabs)';
        const inLoginFlow = segments[0] === 'stack' && segments[1] === 'login';

        if (!isAuthenticated && !inLoginFlow) {
            // Redirect to login if not authenticated and not already in login flow
            router.replace('/stack/entry');
        } else if (isAuthenticated && inLoginFlow) {
            // Redirect to main app if authenticated and in login flow
            router.replace('/(tabs)/(Home)');
        }
    }, [isAuthenticated, isLoading, segments]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return children;
};

export default function RootLayout() {
    return (
        <AuthProvider>
            <AuthWrapper>
                <Stack
                    screenOptions={{ headerShown: false }}
                >
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="stack" options={{ headerShown: false }} />
                </Stack>
            </AuthWrapper>
        </AuthProvider>
    );
}