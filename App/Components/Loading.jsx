import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const Loader = () => {
    // Text animation - all non-native since letterSpacing can't use native driver
    const textTranslateX = useRef(new Animated.Value(0)).current;
    const textLetterSpacing = useRef(new Animated.Value(1)).current;

    // Load element animation - width can't use native driver
    const loadWidth = useRef(new Animated.Value(16)).current;
    const loadTranslateX = useRef(new Animated.Value(64)).current;

    // Load before element animation - width can't use native driver
    const loadBeforeWidth = useRef(new Animated.Value(16)).current;
    const loadBeforeTranslateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createAnimation = () => {
            return Animated.parallel([
                // Text animation - all non-native
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(textLetterSpacing, {
                            toValue: 2,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                        Animated.timing(textTranslateX, {
                            toValue: 26,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(textLetterSpacing, {
                            toValue: 1,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                        Animated.timing(textTranslateX, {
                            toValue: 32,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(textLetterSpacing, {
                            toValue: 2,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                        Animated.timing(textTranslateX, {
                            toValue: 0,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(textLetterSpacing, {
                            toValue: 1,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                        Animated.timing(textTranslateX, {
                            toValue: 0,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                    ]),
                ]),

                // Load element animation - width non-native, transform non-native
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(loadWidth, {
                            toValue: 80,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                        Animated.timing(loadTranslateX, {
                            toValue: 0,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(loadWidth, {
                            toValue: 16,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                        Animated.timing(loadTranslateX, {
                            toValue: 64,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(loadWidth, {
                            toValue: 80,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                        Animated.timing(loadTranslateX, {
                            toValue: 0,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(loadWidth, {
                            toValue: 16,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                        Animated.timing(loadTranslateX, {
                            toValue: 0,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                    ]),
                ]),

                // Load before element animation - width non-native, transform non-native
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(loadBeforeWidth, {
                            toValue: 64,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                        Animated.timing(loadBeforeTranslateX, {
                            toValue: 0,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(loadBeforeWidth, {
                            toValue: 80,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                        Animated.timing(loadBeforeTranslateX, {
                            toValue: 0,
                            duration: 1400,
                            useNativeDriver: false,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(loadBeforeWidth, {
                            toValue: 64,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                        Animated.timing(loadBeforeTranslateX, {
                            toValue: 15,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(loadBeforeWidth, {
                            toValue: 16,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                        Animated.timing(loadBeforeTranslateX, {
                            toValue: 0,
                            duration: 350,
                            useNativeDriver: false,
                        }),
                    ]),
                ]),
            ]);
        };

        const runAnimation = () => {
            // Reset values
            textTranslateX.setValue(0);
            textLetterSpacing.setValue(1);
            loadWidth.setValue(16);
            loadTranslateX.setValue(64);
            loadBeforeWidth.setValue(16);
            loadBeforeTranslateX.setValue(0);

            createAnimation().start(() => {
                // Loop the animation
                runAnimation();
            });
        };

        runAnimation();

        return () => {
            // Clean up animations on unmount
            textTranslateX.stopAnimation();
            textLetterSpacing.stopAnimation();
            loadWidth.stopAnimation();
            loadTranslateX.stopAnimation();
            loadBeforeWidth.stopAnimation();
            loadBeforeTranslateX.stopAnimation();
        };
    }, []);

    return (
        <View style={styles.loader}>
            <Animated.Text
                style={[
                    styles.loaderText,
                    {
                        transform: [{ translateX: textTranslateX }],
                        letterSpacing: textLetterSpacing,
                    },
                ]}
            >
                loading
            </Animated.Text>
            <Animated.View
                style={[
                    styles.load,
                    {
                        width: loadWidth,
                        transform: [{ translateX: loadTranslateX }],
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.loadBefore,
                        {
                            width: loadBeforeWidth,
                            transform: [{ translateX: loadBeforeTranslateX }],
                        },
                    ]}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    loader: {
        width: 80,
        height: 50,
        position: 'relative',
    },
    loaderText: {
        position: 'absolute',
        top: 0,
        padding: 0,
        margin: 0,
        color: '#C8B6FF',
        fontSize: 12.8,
        letterSpacing: 1,
    },
    load: {
        backgroundColor: '#9A79FF',
        borderRadius: 25,
        height: 16,
        width: 16,
        position: 'absolute',
        bottom: 0,
    },
    loadBefore: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#D1C2FF',
        borderRadius: 25,
    },
});

export default Loader;