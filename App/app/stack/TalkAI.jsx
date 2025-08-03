import { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Alert,
    Animated,
    Dimensions,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import {
    useAudioRecorder,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorderState,
} from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import serverConfig from "../../Constants/serverConfig";
import BackgoundWrapper from "../../Components/BackgoundWrapper";
import {router} from "expo-router";

const { width, height } = Dimensions.get('window');



function redirect(idx) {
    switch (idx) {
        case 0:
            router.push('./HomeChat');
            break;
        case 1:
            router.push('./NearbyHospitals');
            break;
        case 2:
            router.push('./NearbyHospitalsPage');
            break;
        case 3:
            router.navigate('../(tabs)/(Nutrition)/Nutrition');
            break;
        case 4:
            router.push('./VaccTracker');
            break;
        case 5:
            router.push('./GenMeal');
            break;
        case 6:
            router.push('./MythBuster');
            break;
        case 7:
            router.push('./GenMealWomen');
            break;
        default:
            alert("Unable to recognise ur request");
            break;
    }
}

export default function App() {
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);
    const [isUploading, setIsUploading] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [permissionGranted, setPermissionGranted] = useState(false);

    // Animation values
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const waveAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Timer for recording duration
    const timerRef = useRef(null);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const stopPulseAnimation = () => {
        pulseAnim.stopAnimation();
        Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const startWaveAnimation = () => {
        Animated.loop(
            Animated.timing(waveAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    };

    const stopWaveAnimation = () => {
        waveAnim.stopAnimation();
        Animated.timing(waveAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const record = async () => {
        try {
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();

            // Start animations and timer
            startPulseAnimation();
            startWaveAnimation();
            setRecordingDuration(0);

            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

            // Fade in recording UI
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

        } catch (error) {
            console.error('Error starting recording:', error);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        try {
            await audioRecorder.stop();

            // Stop animations and timer
            stopPulseAnimation();
            stopWaveAnimation();
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            // Fade out recording UI
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            const recordingUri = audioRecorder.uri;
            if (recordingUri) {
                await uploadRecording(recordingUri);
            } else {
                Alert.alert('Error', 'No recording found');
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
            Alert.alert('Error', 'Failed to stop recording');
        }
    };

    const uploadRecording = async (uri) => {
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', {
                uri: uri,
                type: 'audio/m4a',
                name: 'recording.m4a',
            });

            let url = serverConfig.BaseURL + '/api/voice/speech-to-text';
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const responseData = await response.json();
            console.log('API Response:', responseData);

            if (response.ok) {
                redirect(responseData["feature_idx"]);
            } else {
                Alert.alert('Error', `Server error: ${response.status}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload recording');
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert('Permission Required', 'Permission to access microphone was denied');
                setPermissionGranted(false);
            } else {
                setPermissionGranted(true);
            }

            setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            });
        })();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    if (!permissionGranted) {
        return (
            <View style={styles.permissionContainer}>
                <StatusBar barStyle="light-content" backgroundColor="rgba(139, 69, 139, 0.9)" />
                <Ionicons name="mic-off" size={80} color="#FF6B9D" />
                <Text style={styles.permissionTitle}>Microphone Access Required</Text>
                <Text style={styles.permissionText}>
                    This app needs microphone access to record audio. Please enable it in your device settings.
                </Text>
            </View>
        );
    }

    return (
        <BackgoundWrapper>
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="rgba(139, 69, 139, 0.9)" />

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Voice Recorder</Text>
                    <Text style={styles.headerSubtitle}>
                        {isUploading ? 'Uploading...' : 'Tap to start recording'}
                    </Text>
                </View>

                <Animated.View style={[styles.recordingIndicator, { opacity: fadeAnim }]}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>Recording</Text>
                    <Text style={styles.durationText}>{formatTime(recordingDuration)}</Text>
                </Animated.View>

                <View style={styles.waveContainer}>
                    {[...Array(5)].map((_, index) => (
                        <Animated.View
                            key={index}
                            style={[
                                styles.wave,
                                {
                                    opacity: recorderState.isRecording ? 1 : 0.4,
                                    transform: [
                                        {
                                            scaleY: recorderState.isRecording
                                                ? waveAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.5, 2 + Math.random()],
                                                })
                                                : 0.5,
                                        },
                                    ],
                                },
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.recordButton,
                            recorderState.isRecording && styles.recordButtonActive,
                            isUploading && styles.recordButtonDisabled,
                        ]}
                        onPress={recorderState.isRecording ? stopRecording : record}
                        disabled={isUploading}
                        activeOpacity={0.7}
                    >
                        <Animated.View
                            style={[
                                styles.recordButtonInner,
                                { transform: [{ scale: pulseAnim }] },
                            ]}
                        >
                            {isUploading ? (
                                <ActivityIndicator size="large" color="#fff" />
                            ) : (
                                <Ionicons
                                    name={recorderState.isRecording ? "stop" : "mic"}
                                    size={40}
                                    color="#fff"
                                />
                            )}
                        </Animated.View>
                    </TouchableOpacity>

                    <Text style={styles.buttonLabel}>
                        {isUploading
                            ? 'Processing...'
                            : recorderState.isRecording
                                ? 'Tap to Stop'
                                : 'Tap to Record'
                        }
                    </Text>
                </View>

                <View style={styles.statusContainer}>
                    <View style={styles.statusItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#9D4EDD" />
                        <Text style={styles.statusText}>Ready to record</Text>
                    </View>
                </View>
            </View>
        </BackgoundWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(26,26,46,0.1)',
        paddingHorizontal: 20,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: 'rgba(139, 69, 139, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    permissionText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 24,
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textShadowColor: 'rgba(157, 78, 221, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF6B9D',
        marginRight: 8,
    },
    recordingText: {
        fontSize: 16,
        color: '#FF6B9D',
        fontWeight: '600',
        marginRight: 12,
    },
    durationText: {
        fontSize: 18,
        color: '#fff',
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    waveContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 120,
        marginBottom: 60,
    },
    wave: {
        width: 4,
        height: 60,
        backgroundColor: '#9D4EDD',
        marginHorizontal: 2,
        borderRadius: 2,
    },
    buttonContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    recordButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#9D4EDD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    recordButtonActive: {
        backgroundColor: '#FF6B9D',
        shadowColor: '#FF6B9D',
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    recordButtonDisabled: {
        backgroundColor: 'rgba(157, 78, 221, 0.5)',
        shadowColor: 'rgba(157, 78, 221, 0.5)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    recordButtonInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 60,
    },
    buttonLabel: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    statusContainer: {
        alignItems: 'center',
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        color: '#9D4EDD',
        marginLeft: 8,
        fontWeight: '500',
    },
});