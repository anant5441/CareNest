import React, { useState, useRef, useEffect } from 'react';
import {
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    View,
    Animated,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import CView from "./CView";
import Background from "./BackgoundWrapper";
import Colors from "../Constants/Colors";

function Chatbot({ handleQuery: handleQueryProp }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi! I'm PoshanAI. How can I help you today?",
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Thinking animation
    useEffect(() => {
        if (isTyping) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 0.7,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [isTyping, pulseAnim]);

    const handleQuery = async (query) => {
        if (!query.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            text: query,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            // Use the prop function if provided, otherwise fallback to mock responses
            let response;
            if (handleQueryProp) {
                response = await handleQueryProp(query);
            } else {
                // Fallback mock responses (for development/testing)
                await new Promise(resolve => setTimeout(resolve, 2000));
                const responses = ["Sorry, I'm having trouble responding right now. Please try again later."];
                response = responses[Math.floor(Math.random() * responses.length)];
            }

            const botMessage = {
                id: Date.now() + 1,
                text: response,
                isBot: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error getting response:', error);
            const errors = [
                "Oops, the nutrition gnomes are on strike. Try again later.",
                "Error 404: Toddler food wisdom not found. Brb, consulting the grandma server.",
                "Beep boop. System overloaded from too many mashed banana queries.",
                "Fetching response... nope. Server saw broccoli and quit.",
                "Alert: AI went to get snacks. Please hold while we crunch... literally."
            ];
            let e = errors[Math.floor(Math.random() * errors.length)];
            const errorMessage = {
                id: Date.now() + 1,
                text: e,
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const sendMessage = () => {
        if (inputText.trim() && !isTyping) {
            handleQuery(inputText);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const renderMessage = (message) => (
        <CView key={message.id} style={[
            styles.messageContainer,
            message.isBot ? styles.botMessageContainer : styles.userMessageContainer
        ]}>
            <CView style={[
                styles.messageBubble,
                message.isBot ? styles.botBubble : styles.userBubble
            ]}>
                <Text style={[
                    styles.messageText,
                    message.isBot ? styles.botText : styles.userText
                ]}>
                    {message.text}
                </Text>
            </CView>
        </CView>
    );

    const renderTypingIndicator = () => (
        <CView style={[styles.messageContainer, styles.botMessageContainer]}>
            <Animated.View style={[
                styles.messageBubble,
                styles.botBubble,
                styles.typingBubble,
                { opacity: pulseAnim }
            ]}>
                <CView style={styles.typingContainer}>
                    <CView style={[styles.typingDot, { animationDelay: '0ms' }]} />
                    <CView style={[styles.typingDot, { animationDelay: '200ms' }]} />
                    <CView style={[styles.typingDot, { animationDelay: '400ms' }]} />
                </CView>
                <Text style={[styles.messageText, styles.botText, styles.typingText]}>
                    PoshanAI is thinking...
                </Text>
            </Animated.View>
        </CView>
    );

    return (
        <CView style={styles.wrapper} safe={true}>
            <Background>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {/* Messages */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.map(renderMessage)}
                        {isTyping && renderTypingIndicator()}
                    </ScrollView>

                    {/* Input */}
                    <CView style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Type here..."
                            placeholderTextColor="#999"
                            multiline
                            maxLength={500}
                            editable={!isTyping}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || isTyping) && styles.sendButtonDisabled
                            ]}
                            onPress={sendMessage}
                            disabled={!inputText.trim() || isTyping}
                        >
                            <Text style={styles.sendButtonText}>Send</Text>
                        </TouchableOpacity>
                    </CView>
                </KeyboardAvoidingView>
            </Background>
        </CView>
    );
}
const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: '10%',
    },
    messagesContainer: {
        flex: 1,
        marginVertical: 16,
    },
    messagesContent: {
        paddingBottom: 16,
    },
    messageContainer: {
        marginVertical: 4,
    },
    botMessageContainer: {
        alignItems: 'flex-start',
    },
    userMessageContainer: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    botBubble: {
        backgroundColor: Colors.BotTextContainer,
        borderBottomLeftRadius: 8,
    },
    userBubble: {
        backgroundColor: Colors.UserTextContainer,
        borderBottomRightRadius: 8,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    botText: {
        color: '#333',
    },
    userText: {
        color: '#333',
    },
    typingBubble: {
        minHeight: 48,
        justifyContent: 'center',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#8B5CF6',
        marginHorizontal: 2,
    },
    typingText: {
        fontStyle: 'italic',
        color: '#666',
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingVertical: 16,
        paddingHorizontal: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 24,
        marginBottom: 16,
    },
    textInput: {
        flex: 1,
        minHeight: 44,
        maxHeight: 120,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#000000',
        fontSize: 16,
        backgroundColor: 'transparent',
    },
    sendButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        marginLeft: 8,
        marginRight: 4,
    },
    sendButtonDisabled: {
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Chatbot;