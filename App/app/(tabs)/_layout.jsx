// React libs
import {StatusBar, StyleSheet, Alert} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
//Custom Components
import CView from '../../Components/CView';
import Background from '../../Components/BackgoundWrapper';
import UserIcon from '../../Components/UserIcon';
//Constants
import Colors from "../../Constants/Colors";
// Auth
import {useAuth} from "../../hooks/AuthContext";
import {getUserDetails} from "../../Helper/general";



async function getUserName(authToken) {
    let user = await getUserDetails(authToken)
    return user.username;
}

const RootLayout = () => {
    const { authToken, logout } = useAuth();
    const router = useRouter();
    const [Username, setUsername] = useState("User");

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                let name = await getUserName(authToken);
                setUsername(name);
            } catch (e) {
                await logout();
            }
        };
        fetchUserName();
    }, [authToken]);

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/stack/login');
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
        }
    };

    return (
        <CView safe={true} style={styles.container}>
            <StatusBar style="auto" />
            <UserIcon
                onLogout={handleLogout}
                username={Username}
            />
            <Background>
                <Tabs
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: styles.navBar,
                        tabBarShowLabel: false,
                        tabBarInactiveTintColor: Colors.tabBarInactiveTintColor,
                        tabBarActiveTintColor: Colors.tabBarActiveTintColor,
                        tabBarItemStyle : styles.navBarItem,
                    }}
                >
                    <Tabs.Screen
                        name="(Home)/index"
                        options={{
                            title: "Home",
                            tabBarIcon: ({ color, size ,focused}) => (
                                <Ionicons name={focused?"home":"home-outline"} size={size} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="(Nutrition)/Nutrition"
                        options={{
                            title: "Nutrition",
                            tabBarIcon: ({ color, size  , focused}) => (
                                <Ionicons name={focused?"restaurant":"restaurant-outline"} size={size} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="(NewBorn)/NewBorn"
                        options={{
                            title: "Newborn",
                            tabBarIcon: ({ color, size,focused }) => (
                                <Ionicons name={focused?"accessibility":"accessibility-outline"} size={size} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="(Women)/Women"
                        options={{
                            title: "Women",
                            tabBarIcon: ({ color, size,focused }) => (
                                <Ionicons name={focused?"female":"female-outline"} size={size} color={color} />
                            ),
                        }}
                    />
                </Tabs>
            </Background>
        </CView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navBar: {
        position: 'absolute',
        height: '5%',
        width: '60%',
        bottom: 15,
        marginLeft: '20%',
        paddingBottom: 2,
        borderRadius: 25,
        boxShadow: '0px 5px 6.3px 0px rgba(0, 0, 0, 0.32)'
    },
    navBarItem: {
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'solid',
    },
});

export default RootLayout;