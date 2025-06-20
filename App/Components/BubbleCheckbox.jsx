import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Animated,
    StyleSheet,
    Dimensions,
    Text,
} from 'react-native';

const BubbleSwitch = ({
                          onValueChange,
                          defaultValue = false,
                          title,
                          titlePosition = 'right',
                          titleStyle
                      }) => {
    const [isChecked, setIsChecked] = useState(defaultValue);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const pressAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Floating animation
        const floatingAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: -1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        floatingAnimation.start();

        return () => floatingAnimation.stop();
    }, []);

    const handlePress = () => {
        const newValue = !isChecked;
        setIsChecked(newValue);
        onValueChange?.(newValue);

        // Press animation
        Animated.sequence([
            Animated.parallel([
                Animated.timing(pressAnim, {
                    toValue: 0.8,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(pressAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    };

    const handlePressIn = () => {
        Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const floatingTransform = floatAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-3, 0, 3],
    });

    const renderBubble = () => (
        <Animated.View
            style={[
                styles.bubbleContainer,
                {
                    transform: [
                        { translateX: floatingTransform },
                        { translateY: floatingTransform },
                    ],
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <Animated.View
                    style={[
                        styles.bubble,
                        isChecked ? styles.bubbleChecked : styles.bubbleUnchecked,
                        {
                            transform: [
                                { scale: scaleAnim },
                                { scaleX: pressAnim },
                                { scaleY: pressAnim },
                            ],
                        },
                    ]}
                >
                    {/* Inner circle/indicator */}
                    <Animated.View
                        style={[
                            styles.indicator,
                            isChecked ? styles.indicatorChecked : styles.indicatorUnchecked,
                        ]}
                    />

                    {/* Shadow layer */}
                    <View style={styles.shadowLayer} />
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderTitle = () => {
        if (!title) return null;

        return (
            <Text style={[styles.title, titleStyle]}>
                {title}
            </Text>
        );
    };

    return (
        <View style={styles.container}>
            {titlePosition === 'left' && renderTitle()}
            {renderBubble()}
            {titlePosition === 'right' && renderTitle()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubbleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubble: {
        width: 60,
        height: 60,
        borderRadius: 30,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        // Base bubble styling
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    bubbleUnchecked: {
        backgroundColor: '#FF6B6B',
        // Simulating the radial gradients with a solid color
        // In React Native, complex gradients require third-party libraries
    },
    bubbleChecked: {
        backgroundColor: '#4ECDC4',
    },
    indicator: {
        position: 'absolute',
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    indicatorUnchecked: {
        width: 30,
        height: 30,
    },
    indicatorChecked: {
        width: 10,
        height: 30,
        borderRadius: 5,
    },
    shadowLayer: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        bottom: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: -1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginHorizontal: 12,
    },
});

export default BubbleSwitch;