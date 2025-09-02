import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import {
    useAudioRecorder,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorderState,
} from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import BackgoundWrapper from "../../Components/BackgoundWrapper";
import serverConfig from "../../Constants/serverConfig";

const { width, height } = Dimensions.get('window');

const Symptom = () => {
    // State management
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Welcome to CareNest. How can I help you today?",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    // Audio recording setup with proper configuration
    const audioRecorder = useAudioRecorder({
        ...RecordingPresets.HIGH_QUALITY,
        android: {
            extension: '.m4a',
            outputFormat: 'mpeg4',
            audioEncoder: 'aac',
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
        },
        ios: {
            extension: '.m4a',
            outputFormat: '.m4a',
            audioQuality: 'high',
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
        web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
        },
    });
    const recorderState = useAudioRecorderState(audioRecorder);

    // Animation and timer refs
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const waveAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const timerRef = useRef(null);
    const scrollViewRef = useRef(null);

    // Format recording time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Animation functions
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

    // Add message to chat
    const addMessage = (text, isUser = false, additionalData = null) => {
        const newMessage = {
            id: Date.now(),
            text,
            isUser,
            timestamp: new Date(),
            ...additionalData
        };
        setMessages(prev => [...prev, newMessage]);

        // Auto scroll to bottom
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    // Send text message
    const sendTextMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage = inputText.trim();
        setInputText('');
        addMessage(userMessage, true);
        setIsLoading(true);

        try {
            const response = await fetch(serverConfig.BaseURL + '/api/symptom/medical/rag-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    query: userMessage,
                    max_results: 3
                })
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
                addMessage(responseData.answer, false, {
                    sources: responseData.source_documents
                });
            } else {
                addMessage("I apologize, but I'm having trouble processing your request right now. Please try again.", false);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            addMessage("Sorry, there was an error connecting to the server. Please check your connection and try again.", false);
        } finally {
            setIsLoading(false);
        }
    };

    // Voice recording functions
    const startRecording = async () => {
        try {
            // Request permissions if not already granted
            const permission = await AudioModule.requestRecordingPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission Required', 'Please grant microphone permission to record audio');
                return;
            }

            // Set audio mode for recording
            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            // Prepare and start recording
            await audioRecorder.prepareToRecordAsync();
            await audioRecorder.record();

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
            Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
        }
    };

    const stopRecording = async () => {
        try {
            // Stop the recording
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

            // Get the recording URI
            const recordingUri = audioRecorder.uri;

            if (recordingUri) {
                await processAudioRecording(recordingUri);
            } else {
                Alert.alert('Error', 'No recording found. Please try again.');
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
            Alert.alert('Recording Error', 'Failed to stop recording properly.');
        }
    };

    const processAudioRecording = async (uri) => {
        setIsUploading(true);
        addMessage("🎤 Processing your voice message...", true);

        try {
            // First, check if the file exists and get its info
            const fileInfo = await FileSystem.getInfoAsync(uri);

            if (!fileInfo.exists) {
                throw new Error('Audio file does not exist');
            }

            console.log('Audio file info:', {
                uri: uri,
                size: fileInfo.size,
                exists: fileInfo.exists
            });

            // Check file size - if it's too small, it might be corrupted
            if (fileInfo.size < 1000) {
                throw new Error('Audio file is too small, might be corrupted');
            }

            // Method 1: Read as base64 with better error handling
            let base64Audio;
            try {
                base64Audio = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                console.log('Base64 audio length:', base64Audio.length);

                // Verify base64 is valid
                if (!base64Audio || base64Audio.length < 100) {
                    throw new Error('Invalid base64 audio data');
                }
            } catch (readError) {
                console.error('Error reading audio file:', readError);
                throw readError;
            }

            // Send to server with retry logic
            let attempts = 0;
            const maxAttempts = 2;
            let lastError;

            while (attempts < maxAttempts) {
                attempts++;

                try {
                    const response = await fetch(serverConfig.BaseURL + '/api/symptom/medical/audio-to-analysis', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            audio_data: base64Audio,
                            patient_age_group: "adult",
                            model: "nova-2"  // Use nova-2 for better accuracy
                        }),
                        timeout: 60000  // 60 second timeout
                    });

                    const responseText = await response.text();
                    console.log('Server response status:', response.status);

                    let analysisData;
                    try {
                        analysisData = JSON.parse(responseText);
                    } catch (parseError) {
                        console.error('Error parsing response:', responseText);
                        throw new Error('Invalid server response');
                    }

                    if (response.ok && analysisData.success) {
                        // Remove the processing message
                        setMessages(prev => prev.filter(msg => !msg.text.includes("Processing your voice message")));

                        // Display comprehensive medical analysis
                        const analysisMessage = formatMedicalAnalysis(analysisData);
                        addMessage(analysisMessage, false, {
                            isAnalysis: true,
                            analysisData: analysisData
                        });

                        return; // Success!
                    } else {
                        // Check for specific error messages
                        if (analysisData.detail && analysisData.detail.includes("No speech detected")) {
                            throw new Error("No speech detected. Please speak clearly and try again.");
                        }
                        lastError = analysisData.detail || 'Analysis failed';
                    }
                } catch (fetchError) {
                    console.error(`Attempt ${attempts} failed:`, fetchError);
                    lastError = fetchError.message;

                    if (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                    }
                }
            }

            // All attempts failed
            throw new Error(lastError || 'Failed to analyze audio');

        } catch (error) {
            console.error('Audio processing error:', error);

            // Remove the processing message
            setMessages(prev => prev.filter(msg => !msg.text.includes("Processing your voice message")));

            // Provide specific error messages
            let errorMessage = "Sorry, there was an error processing your voice message.";

            if (error.message.includes("No speech detected")) {
                errorMessage = "No speech was detected in your recording. Please make sure:\n• Your microphone is working\n• You're speaking clearly\n• There's minimal background noise";
            } else if (error.message.includes("too small")) {
                errorMessage = "The recording seems to be empty. Please try recording again.";
            } else if (error.message.includes("does not exist")) {
                errorMessage = "Recording file was not found. Please try again.";
            }

            addMessage(errorMessage, false);

            // Optional: Show alert for critical errors
            if (error.message.includes("microphone")) {
                Alert.alert(
                    'Recording Issue',
                    'Please check your microphone permissions and try again.',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setIsUploading(false);

            // Clean up the temporary audio file
            try {
                await FileSystem.deleteAsync(uri, { idempotent: true });
            } catch (cleanupError) {
                console.log('Could not delete temporary audio file:', cleanupError);
            }
        }
    };

    // Alternative method using FormData
    const sendAudioAsFormData = async (uri) => {
        const formData = new FormData();

        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(uri);

        // Append audio file to FormData
        formData.append('audio', {
            uri: uri,
            type: 'audio/m4a',
            name: 'recording.m4a',
        });
        formData.append('patient_age_group', 'adult');
        formData.append('model', 'nova');

        const response = await fetch(serverConfig.BaseURL + '/api/symptom/medical/audio-upload', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData
        });

        const responseData = await response.json();

        if (response.ok && responseData.success) {
            const analysisMessage = formatMedicalAnalysis(responseData);
            addMessage(analysisMessage, false, {
                isAnalysis: true,
                analysisData: responseData
            });
        } else {
            throw new Error('FormData upload failed');
        }
    };

    const formatMedicalAnalysis = (data) => {
        let message = `📋 **Medical Analysis Summary**\n\n`;

        if (data.friendly_summary) {
            message += `${data.friendly_summary}\n\n`;
        }

        if (data.symptom_details?.primary_symptoms) {
            message += `🔍 **Primary Symptoms:** ${data.symptom_details.primary_symptoms.join(', ')}\n`;
        }

        if (data.urgency_level) {
            const urgencyEmoji = {
                'low': '🟢',
                'medium': '🟡',
                'high': '🟠',
                'critical': '🔴'
            };
            message += `${urgencyEmoji[data.urgency_level.toLowerCase()] || '⚡'} **Urgency:** ${data.urgency_level}\n`;
        }

        if (data.recommended_specialty) {
            message += `👨‍⚕️ **Recommended Specialist:** ${data.recommended_specialty}\n\n`;
        }

        if (data.home_remedies && data.home_remedies.length > 0) {
            message += `🏠 **Home Remedies:**\n`;
            data.home_remedies.forEach(remedy => {
                message += `• ${remedy}\n`;
            });
            message += '\n';
        }

        if (data.advice_next_steps) {
            message += `📝 **Next Steps:** ${data.advice_next_steps}`;
        }

        return message;
    };

    // Initialize permissions
    useEffect(() => {
        (async () => {
            try {
                // Request recording permissions
                const { granted } = await AudioModule.requestRecordingPermissionsAsync();
                setPermissionGranted(granted);

                if (!granted) {
                    Alert.alert(
                        'Permission Required',
                        'Microphone permission is needed to record voice messages. Please enable it in your device settings.',
                        [{ text: 'OK' }]
                    );
                }

                // Set initial audio mode
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    allowsRecording: true,
                    staysActiveInBackground: false,
                });
            } catch (error) {
                console.error('Error initializing audio:', error);
            }
        })();

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            // Clean up any ongoing recording
            if (recorderState.isRecording) {
                audioRecorder.stop();
            }
        };
    }, []);

    // Render message component
    const renderMessage = (message) => (
        <View
            key={message.id}
            style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.botMessage
            ]}
        >
            <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.botMessageText,
                message.isAnalysis && styles.analysisText
            ]}>
                {message.text}
            </Text>
            <Text style={[
                styles.timestamp,
                message.isUser ? styles.userTimestamp : styles.botTimestamp
            ]}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );

    return (
        <BackgoundWrapper>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Symptom Analysis</Text>
                    <Text style={styles.headerSubtitle}>Describe your symptoms</Text>
                </View>

                {/* Recording Indicator */}
                <Animated.View style={[styles.recordingIndicator, { opacity: fadeAnim }]}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>Recording</Text>
                    <Text style={styles.durationText}>{formatTime(recordingDuration)}</Text>
                </Animated.View>

                {/* Wave Animation */}
                {recorderState.isRecording && (
                    <View style={styles.waveContainer}>
                        {[...Array(5)].map((_, index) => (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.wave,
                                    {
                                        transform: [
                                            {
                                                scaleY: waveAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.5, 2 + Math.random()],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            />
                        ))}
                    </View>
                )}

                {/* Chat Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatContainer}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map(renderMessage)}
                    {isLoading && (
                        <View style={[styles.messageContainer, styles.botMessage]}>
                            <ActivityIndicator size="small" color="#9D4EDD" />
                            <Text style={styles.loadingText}>Analyzing...</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Input Container */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type your symptoms here..."
                            placeholderTextColor="rgba(255, 255, 255, 0.6)"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            editable={!recorderState.isRecording && !isUploading}
                        />

                        {/* Send Button */}
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || isLoading || recorderState.isRecording) && styles.sendButtonDisabled
                            ]}
                            onPress={sendTextMessage}
                            disabled={!inputText.trim() || isLoading || recorderState.isRecording}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color={(!inputText.trim() || isLoading || recorderState.isRecording) ? "rgba(255,255,255,0.5)" : "#fff"}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Microphone Button */}
                    {permissionGranted && (
                        <TouchableOpacity
                            style={[
                                styles.micButton,
                                recorderState.isRecording && styles.micButtonActive,
                                isUploading && styles.micButtonDisabled,
                            ]}
                            onPress={recorderState.isRecording ? stopRecording : startRecording}
                            disabled={isUploading || isLoading}
                            activeOpacity={0.7}
                        >
                            <Animated.View
                                style={[
                                    styles.micButtonInner,
                                    { transform: [{ scale: recorderState.isRecording ? pulseAnim : 1 }] },
                                ]}
                            >
                                {isUploading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons
                                        name={recorderState.isRecording ? "stop" : "mic"}
                                        size={24}
                                        color="#fff"
                                    />
                                )}
                            </Animated.View>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </BackgoundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(26,26,46,0.1)',
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#054bb9',
        marginBottom: 4,
        textShadowColor: 'rgba(157, 78, 221, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgb(20,88,199)',
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF6B9D',
        marginRight: 6,
    },
    recordingText: {
        fontSize: 14,
        color: '#FF6B9D',
        fontWeight: '600',
        marginRight: 8,
    },
    durationText: {
        fontSize: 14,
        color: '#fff',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontWeight: 'bold',
    },
    waveContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        marginBottom: 10,
    },
    wave: {
        width: 3,
        height: 20,
        backgroundColor: '#9D4EDD',
        marginHorizontal: 1,
        borderRadius: 1.5,
    },
    chatContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    chatContent: {
        paddingBottom: 20,
    },
    messageContainer: {
        maxWidth: '80%',
        marginVertical: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#9D4EDD',
        borderBottomRightRadius: 8,
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 8,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    userMessageText: {
        color: '#000',
    },
    botMessageText: {
        color: '#000',
    },
    analysisText: {
        lineHeight: 24,
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
    },
    userTimestamp: {
        color: 'rgba(0,0,0,0.75)',
        textAlign: 'right',
    },
    botTimestamp: {
        color: 'rgb(0,0,0)',
    },
    loadingText: {
        color: '#9D4EDD',
        fontSize: 14,
        fontStyle: 'italic',
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 32,
        alignItems: 'flex-end',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 25,
        alignItems: 'flex-end',
        marginRight: 12,
        minHeight: 50,
    },
    textInput: {
        flex: 1,
        color: '#000',
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#9D4EDD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
        marginBottom: 4,
    },
    sendButtonDisabled: {
        backgroundColor: 'rgba(157, 78, 221, 0.5)',
    },
    micButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#9D4EDD',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    micButtonActive: {
        backgroundColor: '#FF6B9D',
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    micButtonDisabled: {
        backgroundColor: 'rgba(157, 78, 221, 0.5)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    micButtonInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
});

export default Symptom;