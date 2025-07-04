import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import BackgoundWrapper from "../../Components/BackgoundWrapper";
import Colors from "../../Constants/Colors";

const Entry = () => {
    return (
        <BackgoundWrapper>
            <View style={styles.container}>
                <Text style={styles.title}>CareNest</Text>

                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../assets/Entry/baby mom vector.jpeg')}
                        style={styles.placeholderImage}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                        <Text style={styles.registerButtonText}>Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BackgoundWrapper>
    );
};

export default Entry;

function handleLogin() {
    router.push('../stack/login');
    console.log("Go login")
}

function handleRegister() {
    router.push('../stack/login');
    console.log("Go register")
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.entry.bg,
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 20,
    },
    title: {
        fontSize: 45,
        fontWeight: "semibold",
        color: '#333333',
        marginBottom: 20,
        letterSpacing: 3,
    },
    imageContainer: {
        width: '100%',
        maxWidth: 400,
        height: '67%',
        borderRadius: 140,
        overflow: 'hidden',
        marginBottom: '4%'
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    loginButton: {
        width: '70%',
        paddingVertical: 16,
        backgroundColor: Colors.entry.buttonLogin,
        borderRadius: 25,
        alignItems: 'center',
        boxShadow: ' 0px 6px 4.3px -2px rgba(0, 0, 0, 0.25)'
    },
    loginButtonText: {
        color: '#4A2C5A',
        fontSize: 18,
        fontWeight: '600',
    },
    registerButton: {
        width: '70%',
        paddingVertical: 16,
        backgroundColor: Colors.entry.buttonRegister,
        borderRadius: 25,
        alignItems: 'center',
        boxShadow: ' 0px 6px 4.3px -2px rgba(0, 0, 0, 0.25)',
    },
    registerButtonText: {
        color: '#7D6608',
        fontSize: 18,
        fontWeight: '600',
    },
});