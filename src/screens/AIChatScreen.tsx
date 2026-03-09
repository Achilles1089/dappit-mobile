import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Pressable,
} from 'react-native';
import { Text, Card, ActivityIndicator, IconButton } from 'react-native-paper';
import { DappitColors, DappitSpacing, DappitFontSizes } from '../theme/colors';
import { AIService, ChatMessage } from '../services/ai';

export default function AIChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: '👋 Hey! I\'m Dappit AI. Ask me anything about Solana development, token launches, or Web3 building. I\'m powered by Claude and live on Dappit\'s cloud backend.',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMessage: ChatMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await AIService.chat(text);
            const assistantMessage: ChatMessage = { role: 'assistant', content: response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: `❌ Error: ${err.message || 'Failed to reach Dappit AI. Check your connection.'}`,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🤖 Dappit AI</Text>
                <Text style={styles.subtitle}>Powered by Claude · Dappit Cloud</Text>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollRef}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg, idx) => (
                    <View
                        key={idx}
                        style={[
                            styles.messageBubble,
                            msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                        ]}
                    >
                        <Text
                            style={[
                                styles.messageText,
                                msg.role === 'user' ? styles.userText : styles.assistantText,
                            ]}
                        >
                            {msg.content}
                        </Text>
                    </View>
                ))}
                {loading && (
                    <View style={[styles.messageBubble, styles.assistantBubble]}>
                        <ActivityIndicator size="small" color={DappitColors.primary} />
                    </View>
                )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Ask about Solana, tokens, Web3..."
                    placeholderTextColor={DappitColors.textMuted}
                    multiline
                    maxLength={2000}
                    editable={!loading}
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                />
                <Pressable
                    onPress={sendMessage}
                    disabled={loading || !input.trim()}
                    style={({ pressed }) => [
                        styles.sendButton,
                        pressed && { opacity: 0.7 },
                        (!input.trim() || loading) && { opacity: 0.4 },
                    ]}
                >
                    <IconButton icon="send" iconColor={DappitColors.textPrimary} size={22} />
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DappitColors.background,
    },
    header: {
        padding: DappitSpacing.md,
        paddingBottom: DappitSpacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: DappitColors.border,
    },
    title: {
        fontSize: DappitFontSizes.title,
        fontWeight: '800',
        color: DappitColors.textPrimary,
    },
    subtitle: {
        fontSize: DappitFontSizes.caption,
        color: DappitColors.textMuted,
        marginTop: 2,
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        padding: DappitSpacing.md,
        paddingBottom: DappitSpacing.lg,
    },
    messageBubble: {
        maxWidth: '85%',
        borderRadius: 16,
        padding: DappitSpacing.md,
        marginBottom: DappitSpacing.sm,
    },
    userBubble: {
        backgroundColor: DappitColors.primary,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: DappitColors.surface,
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: DappitColors.border,
    },
    messageText: {
        fontSize: DappitFontSizes.body,
        lineHeight: 20,
    },
    userText: {
        color: '#FFFFFF',
    },
    assistantText: {
        color: DappitColors.textPrimary,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: DappitSpacing.sm,
        paddingBottom: DappitSpacing.md,
        borderTopWidth: 1,
        borderTopColor: DappitColors.border,
        backgroundColor: DappitColors.surface,
    },
    input: {
        flex: 1,
        backgroundColor: DappitColors.surfaceLight,
        borderRadius: 20,
        paddingHorizontal: DappitSpacing.md,
        paddingVertical: DappitSpacing.sm,
        color: DappitColors.textPrimary,
        fontSize: DappitFontSizes.body,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: DappitColors.border,
    },
    sendButton: {
        borderRadius: 20,
        backgroundColor: DappitColors.primary,
        marginLeft: DappitSpacing.xs,
    },
});
