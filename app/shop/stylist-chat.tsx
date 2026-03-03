import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { shopColors } from "@/constants/colors";
import { getApiUrl } from "@/lib/query-client";
import { fetch } from "expo/fetch";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  outfitCards?: OutfitCard[];
}

interface OutfitCard {
  title: string;
  items: string[];
  occasion: string;
}

const QUICK_PROMPTS = [
  "What should I wear today?",
  "Style me for a date night",
  "Work outfit ideas",
  "Weekend casual looks",
];

export default function StylistChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI Stylist. I can help you with outfit ideas, style advice, and fashion recommendations. What are you looking for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim() };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "" };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}api/shop/stylist-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.filter(m => m.id !== "welcome").map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulated += data.content;
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
                );
              }
              if (data.done) break;
            } catch {}
          }
        }
      }
    } catch (error) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: "I'm having trouble connecting right now. Please try again in a moment." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatarBot}>
            <Ionicons name="sparkles" size={16} color={shopColors.stylistPrimary} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.msgText, isUser && styles.msgTextUser]}>
            {item.content || (isStreaming && !item.content ? "..." : "")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          title: "AI Stylist",
          headerTintColor: shopColors.text,
          headerStyle: { backgroundColor: shopColors.surface },
        }}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          messages.length <= 1 ? (
            <View style={styles.quickPrompts}>
              <Text style={styles.quickTitle}>Quick suggestions</Text>
              <View style={styles.promptsGrid}>
                {QUICK_PROMPTS.map(prompt => (
                  <Pressable
                    key={prompt}
                    style={styles.promptChip}
                    onPress={() => sendMessage(prompt)}
                  >
                    <Text style={styles.promptText}>{prompt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask about outfits, trends..."
          placeholderTextColor={shopColors.textTertiary}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          editable={!isStreaming}
        />
        <Pressable
          style={[styles.sendBtn, (!input.trim() || isStreaming) && styles.sendBtnDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || isStreaming}
        >
          {isStreaming ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: shopColors.background },
  messagesList: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12, gap: 8 },
  msgRowUser: { flexDirection: "row-reverse" },
  avatarBot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: `${shopColors.stylistPrimary}15`,
    alignItems: "center", justifyContent: "center",
  },
  bubble: { maxWidth: "75%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleUser: {
    backgroundColor: shopColors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: shopColors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: shopColors.border,
  },
  msgText: { fontSize: 14, color: shopColors.text, fontFamily: "Inter_400Regular", lineHeight: 20 },
  msgTextUser: { color: "#fff" },
  quickPrompts: { marginBottom: 20 },
  quickTitle: { fontSize: 14, color: shopColors.textSecondary, fontFamily: "Inter_500Medium", marginBottom: 10 },
  promptsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  promptChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    backgroundColor: shopColors.surface, borderWidth: 1, borderColor: shopColors.border,
  },
  promptText: { fontSize: 13, color: shopColors.text, fontFamily: "Inter_500Medium" },
  inputBar: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    paddingHorizontal: 16, paddingTop: 10,
    paddingBottom: Platform.OS === "web" ? 34 : 20,
    backgroundColor: shopColors.surface, borderTopWidth: 1, borderTopColor: shopColors.border,
  },
  textInput: {
    flex: 1, minHeight: 40, maxHeight: 100,
    backgroundColor: shopColors.background, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, fontFamily: "Inter_400Regular", color: shopColors.text,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: shopColors.stylistPrimary,
    alignItems: "center", justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
});
