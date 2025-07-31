import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import Colors from "../Constants/Colors";
import BackgoundWrapper from "./BackgoundWrapper";

const { width } = Dimensions.get('window');

const GeneralLoadingScreen = () => {
    const [dots, setDots] = useState('');
    const [currentSubtextIndex, setCurrentSubtextIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const floatAnim1 = useRef(new Animated.Value(0)).current;
    const floatAnim2 = useRef(new Animated.Value(0)).current;
    const floatAnim3 = useRef(new Animated.Value(0)).current;
    const floatAnim4 = useRef(new Animated.Value(0)).current;

    // Array of rotating subtexts for general data processing
    const subtexts = [
        "Asking robots for your data",
        "Cooking with your data",
        "Teaching algorithms about your preferences",
        "Summoning digital assistants",
        "Processing your request through AI networks",
        "Consulting with our electronic brain trust",
        "Feeding data to hungry algorithms",
        "Waking up the computational wizards",
        "Translating human needs into robot language",
        "Optimizing results with machine intelligence",
        "Almost done talking to the machines",
        "Finalizing your personalized results"
    ];

    // Animated dots effect
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Pulse animation for main icon
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // Spinner animation
    useEffect(() => {
        const spin = Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        );
        spin.start();
        return () => spin.stop();
    }, []);

    // Floating animations for tech icons
    useEffect(() => {
        const createFloatAnimation = (animValue, delay = 0) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(animValue, {
                        toValue: -10,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const animations = [
            createFloatAnimation(floatAnim1, 0),
            createFloatAnimation(floatAnim2, 500),
            createFloatAnimation(floatAnim3, 1000),
            createFloatAnimation(floatAnim4, 1500),
        ];

        animations.forEach(anim => anim.start());

        return () => animations.forEach(anim => anim.stop());
    }, []);

    // Rotating subtext effect with fade animation
    useEffect(() => {
        const rotateSubtext = () => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                // Change text
                setCurrentSubtextIndex(prev => (prev + 1) % subtexts.length);

                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        };

        const interval = setInterval(rotateSubtext, 3000);
        return () => clearInterval(interval);
    }, [fadeAnim]);

    const spinInterpolate = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const FloatingIcon = ({ children, animValue, style }) => (
        <Animated.View
            style={[
                styles.floatingIcon,
                style,
                {
                    transform: [{ translateY: animValue }],
                    opacity: 0.6
                }
            ]}
        >
            {children}
        </Animated.View>
    );

    return (
        <BackgoundWrapper>
            <View style={styles.container}>
                <View style={styles.loadingCard}>
                    {/* Floating tech icons */}
                    <View style={styles.iconsContainer}>
                        <FloatingIcon animValue={floatAnim1} style={styles.icon1}>
                            <Text style={styles.iconText}>🤖</Text>
                        </FloatingIcon>
                        <FloatingIcon animValue={floatAnim2} style={styles.icon2}>
                            <Text style={styles.iconText}>⚡</Text>
                        </FloatingIcon>
                        <FloatingIcon animValue={floatAnim3} style={styles.icon3}>
                            <Text style={styles.iconText}>🔮</Text>
                        </FloatingIcon>
                        <FloatingIcon animValue={floatAnim4} style={styles.icon4}>
                            <Text style={styles.iconText}>💫</Text>
                        </FloatingIcon>
                    </View>

                    {/* Main icon with pulse animation */}
                    <Animated.View
                        style={[
                            styles.mainIconContainer,
                            { transform: [{ scale: pulseAnim }] }
                        ]}
                    >
                        <View style={styles.mainIcon}>
                            <Text style={styles.mainIconText}>🧠</Text>
                        </View>
                        <View style={styles.pulseRing} />
                    </Animated.View>

                    {/* Spinner */}
                    <View style={styles.spinnerContainer}>
                        <Animated.View
                            style={[
                                styles.spinner,
                                { transform: [{ rotate: spinInterpolate }] }
                            ]}
                        >
                            <View style={styles.spinnerInner}>
                                <Text style={styles.processingIcon}>⚙️</Text>
                            </View>
                        </Animated.View>
                    </View>

                    {/* Main loading text */}
                    <Text style={styles.loadingText}>
                        Processing your request{dots}
                    </Text>

                    {/* Animated subtext */}
                    <Animated.View style={[styles.subtextContainer, { opacity: fadeAnim }]}>
                        <Text style={styles.loadingSubtext}>
                            {subtexts[currentSubtextIndex]}
                        </Text>
                    </Animated.View>

                    {/* Progress indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(((currentSubtextIndex + 1) / subtexts.length) * 100, 100)}%`
                                    }
                                ]}
                            />
                        </View>
                        <View style={styles.progressTextContainer}>
                            <Text style={styles.progressLabel}>
                                AI systems working...
                            </Text>
                            <Text style={styles.progressPercentage}>
                                {Math.round(((currentSubtextIndex + 1) / subtexts.length) * 100)}%
                            </Text>
                        </View>
                    </View>

                    {/* Status indicators */}
                    <View style={styles.statusContainer}>
                        <View style={styles.statusItem}>
                            <View style={[styles.statusDot, styles.greenDot]} />
                            <Text style={styles.statusText}>AI Online</Text>
                        </View>
                        <View style={styles.statusItem}>
                            <View style={[styles.statusDot, styles.blueDot]} />
                            <Text style={styles.statusText}>Data Flowing</Text>
                        </View>
                    </View>
                </View>
            </View>
        </BackgoundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingCard: {
        backgroundColor: Colors.locLoadBox,
        borderRadius: 20,
        padding: 40,
        maxWidth: 320,
        width: '100%',
        alignItems: 'center',
    },
    iconsContainer: {
        position: 'relative',
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    floatingIcon: {
        position: 'absolute',
    },
    icon1: {
        top: -10,
        left: -10,
    },
    icon2: {
        top: -5,
        right: -15,
    },
    icon3: {
        bottom: 10,
        left: -15,
    },
    icon4: {
        bottom: 5,
        right: -10,
    },
    iconText: {
        fontSize: 20,
    },
    mainIconContainer: {
        position: 'relative',
        marginBottom: 30,
    },
    mainIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.locMainIcon,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.locMainIconAura,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    mainIconText: {
        fontSize: 32,
    },
    pulseRing: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#23dc10',
        opacity: 0.3,
    },
    spinnerContainer: {
        marginBottom: 20,
    },
    spinner: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 4,
        borderColor: Colors.locProgressBarEmpty,
        borderTopColor: Colors.locProgressBarFill,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinnerInner: {
        position: 'absolute',
    },
    processingIcon: {
        fontSize: 20,
    },
    loadingText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 15,
        textAlign: 'center',
    },
    subtextContainer: {
        marginBottom: 30,
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingSubtext: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    progressContainer: {
        width: '100%',
        marginBottom: 30,
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: Colors.locProgressBarEmpty,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.locProgressBarFill,
        borderRadius: 4,
    },
    progressTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressLabel: {
        fontSize: 12,
        color: '#9ca3af',
    },
    progressPercentage: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.locProgressBarFill,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    greenDot: {
        backgroundColor: '#10b981',
    },
    blueDot: {
        backgroundColor: '#3b82f6',
    },
    statusText: {
        fontSize: 12,
        color: '#6b7280',
    },
});

export default GeneralLoadingScreen;