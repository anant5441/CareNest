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
    ActivityIndicator,
    ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/AuthContext';
import Colors from '../../Constants/Colors';
import BackgoundWrapper from "../../Components/BackgoundWrapper";
import serverConfig from "../../Constants/serverConfig";

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [hasBaby, setHasBaby] = useState(false);
    const [babyName, setBabyName] = useState('');
    const [babyDateOfBirth, setBabyDateOfBirth] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        // Validation
        if (!username || !email || !mobile || !password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (hasBaby && !babyName) {
            Alert.alert('Error', 'Please fill in baby details');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        // Mobile validation (basic)
        if (mobile.length < 10) {
            Alert.alert('Error', 'Please enter a valid mobile number');
            return;
        }

        setIsLoading(true);

        try {
            const url = serverConfig.BaseURL + '/api/auth/register';

            // Create form data for x-www-form-urlencoded
            let formData = {
                "username": username,
                "email": email,
                "mobile": mobile,
                "password": password
            }


            if (hasBaby) {
                formData = {
                    "username": username,
                    "email": email,
                    "mobile": mobile,
                    "password": password,
                    "baby_name": babyName,
                    "baby_date_of_birth": babyDateOfBirth.toString().split('T')[0]
                }
            }
            console.log(formData);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Successful registration
                const token = data.token || data.access_token;

                if (token) {
                    const success = await login(token);

                    if (success) {
                        Alert.alert('Success', 'Registration successful!', [
                            { text: 'OK', onPress: () => router.replace('/(tabs)/(Home)') }
                        ]);
                    } else {
                        Alert.alert('Error', 'Failed to save login credentials');
                    }
                } else {
                    Alert.alert('Success', 'Registration successful! Please login.', [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                }
            } else {
                // Server returned an error
                const errorMessage = data.message || data.error || 'Registration failed';
                Alert.alert('Error', errorMessage);
            }
        } catch (error) {
            console.error('Registration error:', error);

            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
                Alert.alert('Error', 'Network connection failed. Please check your internet connection.');
            } else {
                Alert.alert('Error', 'An error occurred during registration. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || babyDateOfBirth;
        setShowDatePicker(Platform.OS === 'ios');
        setBabyDateOfBirth(currentDate);
    };

    const formatDisplayDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        const diffTime = Math.abs(today - birth);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} days old`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months > 1 ? 's' : ''} old`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} year${years > 1 ? 's' : ''} old`;
        }
    };

    return (
        <BackgoundWrapper>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join our parenting community</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor={'#999'}
                                value={username}
                                onChangeText={setUsername}
                                keyboardType="default"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={'#999'}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Mobile Number"
                                placeholderTextColor={'#999'}
                                value={mobile}
                                onChangeText={setMobile}
                                keyboardType="phone-pad"
                                autoComplete="tel"
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
                                autoComplete="new-password"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor={'#999'}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                autoComplete="new-password"
                            />
                        </View>

                        {/* Improved Baby Toggle Section */}
                        <View style={styles.babyToggleContainer}>
                            <TouchableOpacity
                                style={[styles.babyToggle, hasBaby && styles.babyToggleActive]}
                                onPress={() => setHasBaby(!hasBaby)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.babyToggleContent}>
                                    <View style={styles.babyIconContainer}>
                                        <Text style={styles.babyToggleEmoji}>👶</Text>
                                    </View>
                                    <View style={styles.babyToggleTextContainer}>
                                        <Text style={[styles.babyToggleText, hasBaby && styles.babyToggleTextActive]}>
                                            I have a little one
                                        </Text>
                                        <Text style={[styles.babyToggleSubtext, hasBaby && styles.babyToggleSubtextActive]}>
                                            Get personalized content for your baby
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.checkbox, hasBaby && styles.checkboxActive]}>
                                    {hasBaby && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Improved Baby Details Section */}
                        {hasBaby && (
                            <View style={styles.babyDetailsContainer}>
                                <View style={styles.babyDetailsHeader}>
                                    <Text style={styles.babyDetailsTitle}>✨ Tell us about your little one</Text>
                                    <Text style={styles.babyDetailsSubtitle}>
                                        This helps us provide age-appropriate content and milestones
                                    </Text>
                                </View>

                                <View style={styles.babyForm}>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Baby's Name</Text>
                                        <TextInput
                                            style={[styles.input, styles.babyInput]}
                                            placeholder="What's your baby's name?"
                                            placeholderTextColor={'#A78BFA'}
                                            value={babyName}
                                            onChangeText={setBabyName}
                                            autoCapitalize="words"
                                        />
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Date of Birth</Text>
                                        <TouchableOpacity
                                            style={[styles.input, styles.datePickerButton]}
                                            onPress={() => setShowDatePicker(true)}
                                        >
                                            <View style={styles.datePickerContent}>
                                                <Text style={styles.datePickerText}>
                                                    {formatDisplayDate(babyDateOfBirth)}
                                                </Text>
                                                <Text style={styles.datePickerIcon}>📅</Text>
                                            </View>
                                        </TouchableOpacity>

                                        {babyName && (
                                            <View style={styles.babyAgeContainer}>
                                                <Text style={styles.babyAgeText}>
                                                    🎂 {babyName} is {calculateAge(babyDateOfBirth)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {showDatePicker && (
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={babyDateOfBirth}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                        maximumDate={new Date()}
                                        minimumDate={new Date(2020, 0, 1)}
                                    />
                                )}
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.registerButtonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => router.replace('/stack/login')}
                        >
                            <Text style={styles.loginLinkText}>
                                Already have an account? <Text style={styles.loginLinkTextBold}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </BackgoundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.login.bg,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 50,
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
    babyToggleContainer: {
        marginBottom: 20,
    },
    babyToggle: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    babyToggleActive: {
        backgroundColor: '#F3E8FF',
        borderColor: '#8B5CF6',
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.3,
    },
    babyToggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    babyIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    babyToggleEmoji: {
        fontSize: 24,
    },
    babyToggleTextContainer: {
        flex: 1,
    },
    babyToggleText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '600',
        marginBottom: 2,
    },
    babyToggleTextActive: {
        color: '#6B46C1',
    },
    babyToggleSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    babyToggleSubtextActive: {
        color: '#A78BFA',
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    checkmark: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    babyDetailsContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    babyDetailsHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    babyDetailsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
        textAlign: 'center',
    },
    babyDetailsSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
    },
    babyForm: {
        gap: 4,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    babyInput: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1.5,
    },
    datePickerButton: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1.5,
        justifyContent: 'center',
    },
    datePickerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    datePickerText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    datePickerIcon: {
        fontSize: 20,
    },
    babyAgeContainer: {
        marginTop: 12,
        backgroundColor: '#EDE9FE',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    babyAgeText: {
        fontSize: 14,
        color: '#6B46C1',
        fontWeight: '600',
    },
    registerButton: {
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
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginLinkText: {
        fontSize: 16,
        color: '#6B7280',
    },
    loginLinkTextBold: {
        fontWeight: '600',
        color: Colors.login.buttonLogin,
    },
});

export default Register;