import React, { useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../../../services/api'; // make sure this points to your backend

export default function DiveAI() {
  const [messages, setMessages] = useState([]); // ✅ add this
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const renderItem = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubbleRow, isUser ? styles.rowEnd : styles.rowStart]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.assistantText]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const keyExtractor = useMemo(() => (item) => item.id, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));

    try {
      setLoading(true);

      // ✅ Do NOT send HF token from the app
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are DiveAI, a helpful dive planning and safety assistant.' },
            ...messages.map(m => ({ role: m.role, content: m.text })),
            { role: 'user', content: trimmed }
          ]
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        const errMsg = data?.error || `Server error (${res.status})`;
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: `Error: ${errMsg}` }]);
        return;
      }

      const text = data?.reply && String(data.reply).trim().length > 0
        ? data.reply
        : 'Sorry, I could not generate a response.';
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text }]);

    } catch (e) {
      setMessages((prev) => [...prev, { id: (Date.now() + 2).toString(), role: 'assistant', text: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 120, android: 0 })}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask DiveAI..."
            placeholderTextColor="#9aa3b2"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} activeOpacity={0.8} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ...styles unchanged ...

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0b1220'
  },
  container: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8
  },
  bubbleRow: {
    width: '100%',
    marginVertical: 2,
    flexDirection: 'row'
  },
  rowStart: {
    justifyContent: 'flex-start'
  },
  rowEnd: {
    justifyContent: 'flex-end'
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  assistantBubble: {
    backgroundColor: '#1b2436',
    borderTopLeftRadius: 4
  },
  userBubble: {
    backgroundColor: '#2563eb',
    borderTopRightRadius: 4
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20
  },
  assistantText: {
    color: '#e5e7eb'
  },
  userText: {
    color: 'white'
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1f2937',
    backgroundColor: '#0d1726',
    marginBottom: 10
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#121a2b'
  },
  sendButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#2563eb',
    borderRadius: 12
  },
  sendText: {
    color: 'white',
    fontWeight: '600'
  }
});


