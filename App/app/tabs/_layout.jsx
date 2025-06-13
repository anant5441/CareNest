// React libs
import {StatusBar, StyleSheet, View, TouchableOpacity} from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
//Custom Components
import CView from '../../Components/CView';
import Background from '../../Components/BackgoundWrapper';
//Constants
import Colors from "../../Constants/Colors";

const RootLayout = () => {
    const handleUserIconPress = () => {
        console.log('User icon pressed');
    };

    return (
        <CView safe={true} style={styles.container}>
            <StatusBar style="light" />
            <TouchableOpacity
                style={styles.userIcon}
                onPress={handleUserIconPress}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="person-outline"
                    size={30}
                    color={Colors.userIconColor}
                />
            </TouchableOpacity>
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
    userIcon: {
        position: 'absolute',
        height: 40,
        width: 40,
        borderRadius: 20,
        top: 10,
        right: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.userIconBackground,
        zIndex: 1,
    }
});

export default RootLayout;