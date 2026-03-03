import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, ActivityIndicator, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { fetch } from "expo/fetch";
import Colors from "@/constants/colors";
import { apiRequest, getApiUrl } from "@/lib/query-client";

export default function CreateProductScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [inventory, setInventory] = useState("");
  const [tags, setTags] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/products", {
        title,
        description,
        price: price || "0",
        sku,
        category,
        inventoryCount: parseInt(inventory) || 0,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: "active",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      router.back();
    },
  });

  async function handleAiGenerate() {
    if (!title.trim()) return;
    setIsAiGenerating(true);
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}api/ai/generate-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ productType: title }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) fullContent += parsed.content;
          } catch {}
        }
      }

      try {
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          if (data.title) setTitle(data.title);
          if (data.description) setDescription(data.description);
          if (data.suggestedPrice) setPrice(String(data.suggestedPrice));
          if (data.category) setCategory(data.category);
          if (data.tags) setTags(data.tags.join(", "));
        }
      } catch {}
    } catch {} finally {
      setIsAiGenerating(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable
        style={[styles.aiButton, isAiGenerating && styles.aiButtonDisabled]}
        onPress={handleAiGenerate}
        disabled={isAiGenerating || !title.trim()}
      >
        {isAiGenerating ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons name="sparkles" size={16} color="#fff" />
        )}
        <Text style={styles.aiButtonText}>
          {isAiGenerating ? "Generating..." : "Auto-fill with AI"}
        </Text>
      </Pressable>

      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Product name" placeholderTextColor={Colors.light.textTertiary} />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} placeholder="Product description..." placeholderTextColor={Colors.light.textTertiary} multiline />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Price ($)</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" placeholderTextColor={Colors.light.textTertiary} />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>SKU</Text>
          <TextInput style={styles.input} value={sku} onChangeText={setSku} placeholder="SKU-001" placeholderTextColor={Colors.light.textTertiary} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Category</Text>
          <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Electronics" placeholderTextColor={Colors.light.textTertiary} />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Inventory</Text>
          <TextInput style={styles.input} value={inventory} onChangeText={setInventory} placeholder="0" keyboardType="number-pad" placeholderTextColor={Colors.light.textTertiary} />
        </View>
      </View>

      <Text style={styles.label}>Tags (comma-separated)</Text>
      <TextInput style={styles.input} value={tags} onChangeText={setTags} placeholder="leather, handmade, wallet" placeholderTextColor={Colors.light.textTertiary} />

      <Pressable
        style={[styles.createButton, (!title.trim() || createMutation.isPending) && styles.createButtonDisabled]}
        onPress={() => createMutation.mutate()}
        disabled={!title.trim() || createMutation.isPending}
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.createButtonText}>Create Product</Text>
        )}
      </Pressable>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.light.accent,
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 8,
  },
  aiButtonDisabled: { opacity: 0.7 },
  aiButtonText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  createButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  createButtonDisabled: { opacity: 0.5 },
  createButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
