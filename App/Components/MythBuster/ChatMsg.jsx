import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ChatStyle';

const ChatMessage = ({ message }) => {
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Animated.View
            style={[
                styles.chatMessage,
                message.sender === 'user' ? styles.userMessage : styles.botMessage
            ]}
        >
            {message.sender === 'bot' && (
                <View style={[styles.messageAvatar, message.isError && styles.errorAvatar]}>
                    <Ionicons
                        name={message.isError ? "alert-circle" : "medical"}
                        size={16}
                        color="white"
                    />
                </View>
            )}
            <View style={[
                styles.messageContent,
                message.sender === 'user' ? styles.userMessageContent : styles.botMessageContent
            ]}>
                <View style={[
                    styles.messageBubble,
                    message.sender === 'user' ? styles.userMessageBubble : styles.botMessageBubble,
                    message.isError && styles.errorMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        message.sender === 'user' ? styles.userMessageText : styles.botMessageText,
                        message.isError && styles.errorMessageText
                    ]}>
                        {message.text}
                    </Text>
                </View>
                {message.source && (
                    <View style={styles.messageSourceContainer}>
                        <Ionicons name="library" size={12} color="#6c757d" />
                        <Text style={styles.messageSource}>{message.source}</Text>
                    </View>
                )}
                <Text style={[
                    styles.messageTime,
                    message.sender === 'user' ? styles.userMessageTime : styles.botMessageTime
                ]}>
                    {formatTime(message.timestamp)}
                </Text>
            </View>
            {message.sender === 'user' && (
                <View style={[styles.messageAvatar, styles.userAvatar]}>
                    <Ionicons name="person" size={16} color="white" />
                </View>
            )}
        </Animated.View>
    );
};

export default ChatMessage;