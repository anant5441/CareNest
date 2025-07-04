import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: 'transparent',
                },
                headerTintColor: '#000000',
                headerTitle: '',
                headerBackTitleVisible: false,
                headerTransparent: true,
                contentStyle: {
                    backgroundColor: '#F3F4F6',
                }
            }}
        >
            <Stack.Screen
                name="login"
                options={{
                    title: '',
                    headerShown: false, // Hide header for login screen
                }}
            />
            <Stack.Screen
                name="HomeChat"
                options={{
                    title: '',
                }}
            />
            <Stack.Screen
                name="GenMeal"
                options={{
                    title: '',
                }}
            />
            <Stack.Screen
                name="NearbyHospitals"
                options={{
                    title: '',
                }}
            />
            <Stack.Screen
                name="VaccTracker"
                options={{
                    title: '',
                }}
            />
        </Stack>
    );
}