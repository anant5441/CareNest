import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    chatSection: {
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    chatSectionGradient: {
        padding: 20,
    },
    collapsibleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        marginBottom: 0,
    },

    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    expandIcon: {
        marginLeft: 12,
        padding: 8,
    },

    collapsibleContent: {
        overflow: 'hidden',
        marginTop: 16,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
    },
    chatHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatHeaderText: {
        marginLeft: 12,
    },
    chatTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2c3e50',
    },
    chatSubtitle: {
        fontSize: 14,
        color: '#6c757d',
    },
    clearBtn: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#fee',
    },
    chatContainer: {
        height: 350,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    chatScrollView: {
        flex: 1,
        padding: 16,
        backgroundColor: 'transparent',
    },
    chatContent: {
        flexGrow: 1,
    },
    emptyChatContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyChatIcon: {
        marginBottom: 16,
    },
    emptyChatTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyChatText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginBottom: 24,
        maxWidth: '80%',
        lineHeight: 22,
    },
    emptyChatFeatures: {
        alignItems: 'center',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 14,
        color: '#6c757d',
        marginLeft: 8,
        fontWeight: '500',
    },
    chatMessage: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '85%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    botMessage: {
        alignSelf: 'flex-start',
    },
    messageAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#8e44ad',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    userAvatar: {
        backgroundColor: '#e74c3c',
    },
    errorAvatar: {
        backgroundColor: '#e74c3c',
    },
    messageContent: {
        flex: 1,
    },
    userMessageContent: {
        alignItems: 'flex-end',
    },
    botMessageContent: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '100%',
    },
    messageText: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        fontSize: 15,
        lineHeight: 20,
    },
    userMessageBubble: {
        alignSelf: 'flex-end',
    },
    botMessageBubble: {
        alignSelf: 'flex-start',
    },
    userMessageText: {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        borderBottomRightRadius: 4,
    },
    botMessageText: {
        backgroundColor: '#f1f3f4',
        color: '#2c3e50',
        borderBottomLeftRadius: 4,
    },
    errorMessageBubble: {
        alignSelf: 'flex-start',
    },
    errorMessageText: {
        backgroundColor: '#ffebee',
        color: '#c62828',
    },
    messageSourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginHorizontal: 16,
    },
    messageSource: {
        fontSize: 12,
        color: '#6c757d',
        marginLeft: 4,
        fontStyle: 'italic',
    },
    messageTime: {
        fontSize: 11,
        color: '#adb5bd',
        marginTop: 4,
        marginHorizontal: 16,
    },
    userMessageTime: {
        textAlign: 'right',
    },
    botMessageTime: {
        textAlign: 'left',
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    typingAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#8e44ad',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f3f4',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#6c757d',
        marginRight: 3,
    },
    typingDot1: {
        opacity: 0.4,
    },
    typingDot2: {
        opacity: 0.6,
    },
    typingDot3: {
        opacity: 0.8,
    },
    typingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#6c757d',
        fontStyle: 'italic',
    },
    chatInputSection: {
        marginBottom: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    chatInput: {
        flex: 1,
        fontSize: 15,
        color: '#2c3e50',
        maxHeight: 100,
        paddingVertical: 8,
        paddingRight: 12,
    },
    sendBtn: {
        backgroundColor: '#8e44ad',
        borderRadius: 20,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendBtnDisabled: {
        backgroundColor: '#bdc3c7',
    },
    inputMeta: {
        alignItems: 'flex-end',
        marginTop: 4,
    },
    characterCount: {
        fontSize: 12,
        color: '#adb5bd',
        marginRight: 16,
    },
    suggestions: {
        marginTop: 8,
    },
    suggestionsLabel: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 12,
        fontWeight: '600',
    },
    suggestionBtn: {
        backgroundColor: '#e9ecef',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    suggestionText: {
        fontSize: 13,
        color: '#495057',
        fontWeight: '500',
    },
});