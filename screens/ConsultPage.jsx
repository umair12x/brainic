import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Constants from 'expo-constants';

const resolveApiBaseUrl = () => {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  const extra1 = Constants?.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL;
  const extra2 = Constants?.manifest?.extra?.EXPO_PUBLIC_API_BASE_URL;
  const configured = env || extra1 || extra2;
  if (configured) return configured;
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  if (Platform.OS === 'ios') return 'http://127.0.0.1:8000';
  return 'http://192.168.0.100:8000';
};

const API_BASE_URL = resolveApiBaseUrl();

const QUICK_SUGGESTIONS = [
  "What are the types of brain tumors?",
  "Symptoms of a brain tumor",
  "How are brain tumors diagnosed?",
  "Treatment options for glioma",
  "What does an MRI scan show?",
  "What is a meningioma?",
];

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I'm your AI medical assistant. I specialize in brain tumors, neurology, and general medical topics. Feel free to ask me anything — from understanding MRI results to learning about treatment options.\n\nYou can type your question below or click one of the suggested topics to get started.",
};

export default function ConsultPage() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const generateId = () => {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");

    const userMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail ?? "Failed to get a response. Please try again.");
      }

      const data = await response.json();

      const assistantMessage = {
        id: generateId(),
        role: "assistant",
        content: data.reply,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const showSuggestions = messages.length <= 1 && !loading;

  const MessageBubble = ({ message }) => {
    const isUser = message.role === "user";
    
    return (
      <View style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
        {!isUser && (
          <View style={styles.bubbleAvatar}>
            <Text style={styles.avatarIcon}>🧠</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        enabled={true}
      >
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>⚕️</Text>
          <Text style={styles.disclaimerText}>
            This AI provides general medical information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {loading && (
            <View style={[styles.bubbleWrapper, styles.assistantWrapper]}>
              <View style={styles.bubbleAvatar}>
                <Text style={styles.avatarIcon}>🧠</Text>
              </View>
              <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {showSuggestions && !keyboardVisible && (
          <View style={styles.suggestionsArea}>
            <Text style={styles.suggestionsLabel}>Suggested topics</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsScroll}
            >
              <View style={styles.suggestionsGrid}>
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestionClick(suggestion)}
                    disabled={loading}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Ask a medical question..."
              value={input}
              onChangeText={setInput}
              multiline
              editable={!loading}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => sendMessage(input)}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
              onPress={() => sendMessage(input)}
              disabled={loading || !input.trim()}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHint}>
            Press ⏎ to send
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    margin: 12,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  disclaimerIcon: {
    fontSize: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#92400e',
    lineHeight: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  assistantWrapper: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarIcon: {
    fontSize: 18,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    color: '#1f2937',
  },
  userBubbleText: {
    color: '#ffffff',
  },
  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    marginHorizontal: 2,
  },
  suggestionsArea: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  suggestionsScroll: {
    flexDirection: 'row',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#374151',
  },
  inputBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Extra padding for iOS home indicator
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  inputHint: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
});