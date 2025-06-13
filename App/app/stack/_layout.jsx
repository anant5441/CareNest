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
                },
            }}
        >
            <Stack.Screen
                name="HomeChat"
                options={{
                    title: '',
                }}
            />
        </Stack>
    );
}