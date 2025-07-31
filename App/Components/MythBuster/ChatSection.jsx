import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ChatMessage from './ChatMsg';
import { styles } from './ChatStyle';

const { height: screenHeight } = Dimensions.get('window');

const ChatSection = ({
                         chatMessages,
                         inputText,
                         setInputText,
                         isLoading,
                         isTyping,
                         chatScrollRef,
                         sendMessage,
                         clearChat
                     }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animatedHeight] = useState(new Animated.Value(0));
    const [animatedRotation] = useState(new Animated.Value(0));

    const handleClearChat = () => {
        Alert.alert(
            'Clear Chat',
            'Are you sure you want to clear the chat history?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', onPress: clearChat }
            ]
        );
    };

    const toggleExpanded = () => {
        const toValue = isExpanded ? 0 : 1;
        const rotationValue = isExpanded ? 0 : 1;

        Animated.parallel([
            Animated.timing(animatedHeight, {
                toValue,
                duration: 300,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                useNativeDriver: false,
            }),
            Animated.timing(animatedRotation, {
                toValue: rotationValue,
                duration: 300,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                useNativeDriver: true,
            })
        ]).start();

        setIsExpanded(!isExpanded);
    };

    const rotateInterpolation = animatedRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    // Increase the maximum height to allow more content and scrolling
    const maxChatHeight = screenHeight * 0.6; // 60% of screen height
    const heightInterpolation = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, maxChatHeight],
    });

    return (
        <View style={styles.chatSection}>
            <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.chatSectionGradient}
            >
                {/* Collapsible Header */}
                <TouchableOpacity
                    style={styles.collapsibleHeader}
                    onPress={toggleExpanded}
                    activeOpacity={0.7}
                >
                    <View style={styles.chatHeaderLeft}>
                        <Ionicons name="chatbubbles" size={24} color="#8e44ad" />
                        <View style={styles.chatHeaderText}>
                            <Text style={styles.chatTitle}>AI Myth Buster</Text>
                            <Text style={styles.chatSubtitle}>
                                {isExpanded ? 'Ask me anything about pregnancy' : 'Tap to open chat'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        {isExpanded && chatMessages.length > 0 && (
                            <TouchableOpacity
                                onPress={handleClearChat}
                                style={styles.clearBtn}
                            >
                                <Ionicons name="trash" size={16} color="#e74c3c" />
                            </TouchableOpacity>
                        )}
                        <Animated.View style={[styles.expandIcon, { transform: [{ rotate: rotateInterpolation }] }]}>
                            <Ionicons name="chevron-down" size={20} color="#8e44ad" />
                        </Animated.View>
                    </View>
                </TouchableOpacity>

                {/* Collapsible Content */}
                <Animated.View
                    style={[
                        styles.collapsibleContent,
                        {
                            height: heightInterpolation,
                            overflow: 'hidden', // Ensure content is clipped
                        }
                    ]}
                >
                    {/* Chat Messages Container */}
                    <View style={[styles.chatContainer, { flex: 1 }]}>
                        <ScrollView
                            ref={chatScrollRef}
                            style={[styles.chatScrollView, { flex: 1 }]}
                            contentContainerStyle={[
                                styles.chatContent,
                                { flexGrow: 1, paddingBottom: 10 }
                            ]}
                            showsVerticalScrollIndicator={true}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled={true} // Important for nested scrolling
                            scrollEnabled={true} // Explicitly enable scrolling
                            bounces={true} // Enable bounce effect
                            overScrollMode="always" // Android scroll behavior
                            maintainVisibleContentPosition={{
                                minIndexForVisible: 0,
                                autoscrollToTopThreshold: 10,
                            }}
                        >
                            {chatMessages.length === 0 ? (
                                <View style={styles.emptyChatContainer}>
                                    <View style={styles.emptyChatIcon}>
                                        <Ionicons name="chatbubble-ellipses" size={48} color="#8e44ad" />
                                    </View>
                                    <Text style={styles.emptyChatTitle}>Welcome to AI Myth Buster!</Text>
                                    <Text style={styles.emptyChatText}>
                                        Ask me any question about pregnancy myths and I'll provide evidence-based answers.
                                    </Text>
                                    <View style={styles.emptyChatFeatures}>
                                        <View style={styles.featureItem}>
                                            <Ionicons name="shield-checkmark" size={20} color="#2ecc71" />
                                            <Text style={styles.featureText}>Evidence-based answers</Text>
                                        </View>
                                        <View style={styles.featureItem}>
                                            <Ionicons name="medical" size={20} color="#3498db" />
                                            <Text style={styles.featureText}>Medical sources</Text>
                                        </View>
                                        <View style={styles.featureItem}>
                                            <Ionicons name="time" size={20} color="#e67e22" />
                                            <Text style={styles.featureText}>Instant responses</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    {chatMessages.map((message) => (
                                        <ChatMessage key={message.id} message={message} />
                                    ))}
                                    {isTyping && (
                                        <View style={styles.typingIndicator}>
                                            <View style={styles.typingAvatar}>
                                                <Ionicons name="medical" size={16} color="white" />
                                            </View>
                                            <View style={styles.typingBubble}>
                                                <View style={styles.typingDots}>
                                                    <View style={[styles.typingDot, styles.typingDot1]} />
                                                    <View style={[styles.typingDot, styles.typingDot2]} />
                                                    <View style={[styles.typingDot, styles.typingDot3]} />
                                                </View>
                                                <Text style={styles.typingText}>AI is analyzing...</Text>
                                            </View>
                                        </View>
                                    )}
                                </>
                            )}
                        </ScrollView>
                    </View>

                    {/* Chat Input */}
                    <View style={styles.chatInputSection}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.chatInput}
                                placeholder="Ask me about any pregnancy myth..."
                                placeholderTextColor="#999"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={500}
                                returnKeyType="send"
                                onSubmitEditing={sendMessage}
                                blurOnSubmit={false}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendBtn,
                                    (!inputText.trim() || isLoading) && styles.sendBtnDisabled
                                ]}
                                onPress={sendMessage}
                                disabled={!inputText.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Ionicons name="send" size={18} color="white" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Character count */}
                        <View style={styles.inputMeta}>
                            <Text style={styles.characterCount}>
                                {inputText.length}/500
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

export default ChatSection;