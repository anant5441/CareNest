import React from 'react';
import {Text, StyleSheet, View, TouchableOpacity} from 'react-native';
import CView from '../../../Components/CView';
import Background from '../../../Components/BackgoundWrapper';
import Colors from "../../../Constants/Colors";
import {router} from "expo-router";

function handleMythBuster() {
    router.push('../../stack/MythBuster');
}

const App = () => {

    const handleDietPlanner = ()=>{
        console.log('handleDietPlanner');
    }

    return (
        <CView style={styles.wrapper} safe={true}>
            <Background>
                <CView style={styles.container}>
                    <View style={styles.growthCard}>
                        <View style={styles.growthHeader}>
                            <Text style={styles.growthTitle}>Growth at week 15</Text>
                            <Text style={styles.growthSubtitle}>Your baby is a size of apple</Text>
                        </View>
                        <View style={styles.appleIcon}>
                            <Text style={styles.appleEmoji}>🍎</Text>
                        </View>
                    </View>


                    <View style={styles.featureCardsContainer}>
                        <TouchableOpacity style={styles.featureCard}>
                            <View style={styles.featureIcon}>
                                <Text style={styles.iconText}>📊</Text>
                            </View>
                            <Text style={styles.featureTitle}>AI-Powered</Text>
                            <Text style={styles.featureSubtitle}>ANC Schedule Tracker</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.featureCard}>
                            <View style={styles.featureIcon}>
                                <Text style={styles.iconText}>💚</Text>
                            </View>
                            <Text style={styles.featureTitle}>Mental Health</Text>
                            <Text style={styles.featureSubtitle}>Emotional Support</Text>
                        </TouchableOpacity>
                    </View>


                    <View style={styles.menuContainer}>
                        <TouchableOpacity style={[{ backgroundColor: Colors.menuItemBackgroundPrimary}, styles.menuItem]}>
                            <View style={styles.menuIconContainer}>
                                <Text style={styles.menuIcon}>🩺</Text>
                            </View>
                            <Text style={styles.menuText}>Symptom Checker</Text>
                            <Text style={styles.arrow}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleMythBuster}
                            style={[{ backgroundColor: Colors.menuItemBackgroundSecondary }, styles.menuItem]}>
                            <View style={styles.menuIconContainer}>
                                <Text style={styles.menuIcon}>📚</Text>
                            </View>
                            <Text style={styles.menuText}>Myth Buster & Education Companion</Text>
                            <Text style={styles.arrow}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleDietPlanner} style={[{ backgroundColor: Colors.menuItemBackgroundPrimary }, styles.menuItem]}
                        >
                            <View style={styles.menuIconContainer}>
                                <Text style={styles.menuIcon}>🍽️</Text>
                            </View>
                            <Text style={styles.menuText}>Diet Planner</Text>
                            <Text style={styles.arrow}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[{ backgroundColor: Colors.menuItemBackgroundSecondary }, styles.menuItem]}
                        >
                            <View style={styles.menuIconContainer}>
                                <Text style={styles.menuIcon}>🚨</Text>
                            </View>
                            <Text style={styles.menuText}>Emergency Bot</Text>
                            <Text style={styles.arrow}>›</Text>
                        </TouchableOpacity>
                    </View>
                </CView>
            </Background>
        </CView>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        marginTop: '15%'
    },
    growthCard: {
        backgroundColor: Colors.upperGreetContainer,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    growthHeader: {
        flex: 1,
    },
    growthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    growthSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    appleIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appleEmoji: {
        fontSize: 24,
    },
    featureCardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    featureCard: {
        backgroundColor: Colors.primaryOptionContainer,
        borderRadius: 16,
        padding: 20,
        width: '48%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    featureIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#FFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconText: {
        fontSize: 20,
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.featuredText,
        textAlign: 'center',
        marginBottom: 4,
    },
    featureSubtitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    menuContainer: {
        flex: 1,
    },
    menuItem: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderRadius:50,
        boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)'
    },
    menuIconContainer: {
        width: 32,
        height: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuIcon: {
        fontSize: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    arrow: {
        fontSize: 18,
        color: '#666',
        fontWeight: 'bold',
    },
});

export default App;