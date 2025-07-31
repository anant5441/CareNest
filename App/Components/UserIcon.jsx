import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from "../Constants/Colors";

const { width: screenWidth } = Dimensions.get('window');

const UserIcon = ({ onLogout, username = "User" }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const animationValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;

    const toggleExpansion = () => {
        const toValue = isExpanded ? 0 : 1;

        Animated.timing(animationValue, {
            toValue,
            duration: 200,
            useNativeDriver: false,
        }).start();

        setIsExpanded(!isExpanded);
    };

    const handleCancel = () => {
        if (isExpanded) {
            toggleExpansion();
        }
    };

    const handleLogout = () => {
        if (isExpanded) {
            setIsExpanded(false);
            onLogout();
        }
    };

    // Enhanced interpolations
    const containerHeight = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 180],
    });

    const buttonsOpacity = animationValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    // Truncate username if too long
    const displayUsername = username.length > 6 ? `${username.substring(0, 6)}...` : username;

    return (
        <Animated.View style={[styles.container, { height: containerHeight }]}>
            {!isExpanded ? (
                <TouchableOpacity
                    style={styles.userIcon}
                    onPress={toggleExpansion}
                    activeOpacity={0.8}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name="person-outline"
                        size={24}
                        color={Colors.userIconColor}
                    />
                </TouchableOpacity>
            ) : (
                <Animated.View
                    style={[
                        styles.expandedContainer,
                        { opacity: buttonsOpacity }
                    ]}
                >
                    {/* Cancel Button */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleCancel}
                        activeOpacity={0.8}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                        <View style={styles.cancelButton}>
                            <Ionicons
                                name="close"
                                size={18}
                                color={Colors.userIconColor}
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Username Display */}
                    <View style={styles.usernameContainer}>
                        <Text style={styles.usernameText} numberOfLines={1}>
                            {displayUsername}
                        </Text>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={18}
                            color={'#FF6B6B'}
                        />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        alignItems: 'center',
        width: 50, // Fixed width to prevent horizontal shift
    },
    userIcon: {
        height: 50,
        width: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.userIconBackground,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    expandedContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        paddingVertical: 10,
        width: 50, // Same width as container to prevent shift
    },
    actionButton: {
        height: 45,
        width: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.userIconBackground,
        marginVertical: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cancelButton: {
        borderWidth: 1.5,
        borderColor: Colors.userIconColor,
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    usernameContainer: {
        backgroundColor: Colors.userIconBackground,
        paddingHorizontal: 0,
        paddingVertical: 6,
        borderRadius: 15,
        minWidth: 50,
        maxWidth: 60,
    },
    usernameText: {
        color: Colors.userIconColor,
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    logoutButton: {
        backgroundColor:'rgba(255, 107, 107, 0.1)',
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
});

export default UserIcon;