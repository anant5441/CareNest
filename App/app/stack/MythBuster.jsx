import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Animated,
} from 'react-native';
import BackgroundWrapper from "../../Components/BackgoundWrapper";
import HeaderSection from '../../Components/MythBuster/HeaderSection';
import MythsSection from '../../Components/MythBuster/MythSection';
import ChatSection from '../../Components/MythBuster/ChatSection';
import FooterSection from '../../Components/MythBuster/Footer';
import serverConfig from "../../Constants/serverConfig";

const MythBuster = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [chatMessages, setChatMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const chatScrollRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // API call function
    const callMythBusterAPI = async (userInput) => {
        const URL = serverConfig.BaseURL + '/api/f5/ask';
        try {
            const response = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_input: userInput
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setChatMessages(prev => [...prev, userMessage]);
        const currentInput = inputText;
        setInputText('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            const response = await callMythBusterAPI(currentInput);
            console.log(response);

            const botMessage = {
                id: Date.now() + 1,
                text: response.reply || "I'm here to help with pregnancy-related questions! While I can provide general information, always consult with your healthcare provider for personalized advice.",
                sender: 'bot',
                timestamp: new Date().toISOString(),
                source: response.source || null
            };

            setChatMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm sorry, I'm having trouble connecting right now. Please try again later or consult with your healthcare provider for immediate concerns.",
                sender: 'bot',
                timestamp: new Date().toISOString(),
                isError: true
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const clearChat = () => {
        setChatMessages([]);
    };

    useEffect(() => {
        if (chatScrollRef.current && chatMessages.length > 0) {
            setTimeout(() => {
                chatScrollRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [chatMessages]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    style={styles.keyboardContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        style={styles.mainContent}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <HeaderSection />

                        <ChatSection
                            chatMessages={chatMessages}
                            inputText={inputText}
                            setInputText={setInputText}
                            isLoading={isLoading}
                            isTyping={isTyping}
                            chatScrollRef={chatScrollRef}
                            sendMessage={sendMessage}
                            clearChat={clearChat}
                        />

                        <MythsSection
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            fadeAnim={fadeAnim}
                        />

                        <FooterSection />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </BackgroundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardContainer: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
});

export default MythBuster;