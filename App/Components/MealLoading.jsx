import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import BackgoundWrapper from "./BackgoundWrapper";

const LoadingScreen = () => {
    const [dots, setDots] = useState('');
    const [currentSubtextIndex, setCurrentSubtextIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Array of rotating subtexts like Discord
    const subtexts = [
        "Figuring out what your tummy really needs",
        "Making sure you’re eating enough (not too much!)",
        "Digging up some classic recipe gems",
        "Keeping things balanced — just like grandma’s Sunday dinners",
        "Swapping things out for your picky-eater quirks",
        "Making sure you don’t eat the same thing every dang day",
        "Checking what’s in the fridge — no last-minute store runs",
        "Right-sizing portions so you don’t waste or go hungry",
        "Throwing in a seasonal twist, just like Grandma would",
        "Double-checking everything for the perfect meal plan",
        "Just about ready to dish it out!",
        "Putting a little love on top — the final touch"
    ];


    // Animated dots effect
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
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

        const interval = setInterval(rotateSubtext, 3000); // Change every 2 seconds
        return () => clearInterval(interval);
    }, [fadeAnim]);

    return (
        <BackgoundWrapper>
            <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <Text style={styles.loadingEmoji}>🍽️</Text>
                    <ActivityIndicator size="large" color="#FF6B6B" style={styles.spinner} />
                    <Text style={styles.loadingText}>Generating your meal plan{dots}</Text>

                    <Animated.View style={[styles.subtextContainer, { opacity: fadeAnim }]}>
                        <Text style={styles.loadingSubtext}>
                            {subtexts[currentSubtextIndex]}
                        </Text>
                    </Animated.View>

                    {/* Optional progress indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, {
                                width: `${((currentSubtextIndex + 1) / subtexts.length) * 100}%`
                            }]} />
                        </View>
                        <Text style={styles.progressText}>
                            {Math.round(((currentSubtextIndex + 1) / subtexts.length) * 100)}%
                        </Text>
                    </View>
                </View>
            </View>
        </BackgoundWrapper>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: 'rgba(248,249,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContent: {
        alignItems: 'center',
        padding: 40,
        maxWidth: 320,
    },
    loadingEmoji: {
        fontSize: 60,
        marginBottom: 20,
    },
    spinner: {
        marginVertical: 20,
    },
    loadingText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#2D3748',
        marginTop: 20,
        textAlign: 'center',
    },
    subtextContainer: {
        marginTop: 12,
        minHeight: 20, // Prevents layout shift during transitions
    },
    loadingSubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    progressContainer: {
        marginTop: 30,
        width: '100%',
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF6B6B',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
});

export default LoadingScreen;