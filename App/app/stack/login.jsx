import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/AuthContext';
import Colors from '../../Constants/Colors';
import BackgoundWrapper from "../../Components/BackgoundWrapper";
import serverConfig from "../../Constants/serverConfig";

const Login = () => {
    const [username, setusername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            const url = serverConfig.BaseURL + '/api/auth/login';

            // Create form data for x-www-form-urlencoded
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login
                const token = data.token || data.access_token;

                if (token) {
                    const success = await login(token);

                    if (success) {
                        router.replace('/(tabs)/(Home)');
                    } else {
                        Alert.alert('Error', 'Failed to save login credentials');
                    }
                } else {
                    Alert.alert('Error', 'No token received from server');
                }
            } else {
                // Server returned an error
                const errorMessage = data.message || data.error || 'Invalid credentials';
                Alert.alert('Error', errorMessage);
            }
        } catch (error) {
            console.error('Login error:', error);

            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
                Alert.alert('Error', 'Network connection failed. Please check your internet connection.');
            } else {
                Alert.alert('Error', 'An error occurred during login. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BackgoundWrapper>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            placeholderTextColor={'#999'}
                            value={username}
                            onChangeText={setusername}
                            keyboardType="default"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={'#999'}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </BackgoundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.login.bg,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingBottom: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 40,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: Colors.login.inputField,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    loginButton: {
        backgroundColor: Colors.login.buttonLogin,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    demoContainer: {
        marginTop: 40,
        padding: 16,
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    demoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400E',
        marginBottom: 8,
        textAlign: 'center',
    },
    demoCredentials: {
        fontSize: 12,
        color: '#92400E',
        textAlign: 'center',
    },
});

export default Login;