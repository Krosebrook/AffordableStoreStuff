import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, Platform, ActivityIndicator } from "react-native";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { fetch } from "expo/fetch";
import { getApiUrl, apiRequest } from "@/lib/query-client";
import Colors from "@/constants/colors";
import type { BrandProfile } from "@shared/schema";

const PLATFORMS = [
  { id: "general", label: "General", icon: "globe-outline" },
  { id: "amazon", label: "Amazon", icon: "cart-outline" },
  { id: "etsy", label: "Etsy", icon: "heart-outline" },
  { id: "tiktok", label: "TikTok", icon: "videocam-outline" },
  { id: "instagram", label: "Instagram", icon: "camera-outline" },
  { id: "pinterest", label: "Pinterest", icon: "pin-outline" },
  { id: "email", label: "Email", icon: "mail-outline" },
];

type Mode = "product" | "marketing";

export default function AIStudioScreen() {
  const [mode, setMode] = useState<Mode>("product");
  const [productInput, setProductInput] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [platform, setPlatform] = useState("general");
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const { data: profiles = [] } = useQuery<BrandProfile[]>({ queryKey: ["/api/brand-profiles"] });

  const activeProfile = profiles.find((p) => p.id === selectedProfile);

  async function handleGenerate() {
    if (mode === "product" && !productInput.trim()) return;
    if (mode === "marketing" && !titleInput.trim()) return;

    setIsGenerating(true);
    setResult("");

    try {
      const baseUrl = getApiUrl();
      const endpoint = mode === "product" ? "api/ai/generate-product" : "api/ai/generate-marketing";
      const body =
        mode === "product"
          ? { productType: productInput, features: featuresInput, brandProfile: activeProfile }
          : { productTitle: titleInput, productDescription: descInput, platform, brandProfile: activeProfile };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Generation failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

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
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              setResult(fullContent);
            }
          } catch {}
        }
      }
    } catch (error) {
      setResult("Error generating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveToLibrary() {
    if (!result) return;
    try {
      await apiRequest("POST", "/api/content", {
        type: mode === "product" ? "product_copy" : "marketing_copy",
        title: mode === "product" ? productInput : titleInput,
        content: result,
        platform: mode === "marketing" ? platform : undefined,
      });
    } catch {}
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: webTopInset }]}>
      <View style={styles.modeSelector}>
        <Pressable
          style={[styles.modeButton, mode === "product" && styles.modeButtonActive]}
          onPress={() => setMode("product")}
        >
          <Ionicons name="bag-handle" size={16} color={mode === "product" ? "#fff" : Colors.light.text} />
          <Text style={[styles.modeText, mode === "product" && styles.modeTextActive]}>Product Creator</Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === "marketing" && styles.modeButtonActive]}
          onPress={() => setMode("marketing")}
        >
          <Ionicons name="megaphone" size={16} color={mode === "marketing" ? "#fff" : Colors.light.text} />
          <Text style={[styles.modeText, mode === "marketing" && styles.modeTextActive]}>Marketing Engine</Text>
        </Pressable>
      </View>

      {profiles.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Brand Voice</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.profileChips}>
              <Pressable
                style={[styles.chip, !selectedProfile && styles.chipActive]}
                onPress={() => setSelectedProfile(null)}
              >
                <Text style={[styles.chipText, !selectedProfile && styles.chipTextActive]}>Default</Text>
              </Pressable>
              {profiles.map((p) => (
                <Pressable
                  key={p.id}
                  style={[styles.chip, selectedProfile === p.id && styles.chipActive]}
                  onPress={() => setSelectedProfile(p.id)}
                >
                  <Text style={[styles.chipText, selectedProfile === p.id && styles.chipTextActive]}>{p.name}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {mode === "product" ? (
        <View style={styles.section}>
          <Text style={styles.label}>What product are you selling?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Handmade leather wallet, organic face cream..."
            placeholderTextColor={Colors.light.textTertiary}
            value={productInput}
            onChangeText={setProductInput}
          />
          <Text style={[styles.label, { marginTop: 12 }]}>Key features (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="e.g., Genuine Italian leather, minimalist design, RFID blocking..."
            placeholderTextColor={Colors.light.textTertiary}
            value={featuresInput}
            onChangeText={setFeaturesInput}
            multiline
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.label}>Product Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your product name..."
            placeholderTextColor={Colors.light.textTertiary}
            value={titleInput}
            onChangeText={setTitleInput}
          />
          <Text style={[styles.label, { marginTop: 12 }]}>Product Description</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Brief description of your product..."
            placeholderTextColor={Colors.light.textTertiary}
            value={descInput}
            onChangeText={setDescInput}
            multiline
          />
          <Text style={[styles.label, { marginTop: 12 }]}>Platform</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.platformRow}>
              {PLATFORMS.map((p) => (
                <Pressable
                  key={p.id}
                  style={[styles.platformChip, platform === p.id && styles.platformChipActive]}
                  onPress={() => setPlatform(p.id)}
                >
                  <Ionicons
                    name={p.icon as any}
                    size={14}
                    color={platform === p.id ? "#fff" : Colors.light.text}
                  />
                  <Text style={[styles.platformText, platform === p.id && styles.platformTextActive]}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <Pressable
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons name="sparkles" size={18} color="#fff" />
        )}
        <Text style={styles.generateText}>
          {isGenerating ? "Generating..." : "Generate with AI"}
        </Text>
      </Pressable>

      {result ? (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Generated Content</Text>
            <Pressable onPress={handleSaveToLibrary} style={styles.saveButton}>
              <Ionicons name="bookmark-outline" size={16} color={Colors.light.primary} />
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
          <Text style={styles.resultContent} selectable>{result}</Text>
        </View>
      ) : null}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16 },
  modeSelector: { flexDirection: "row", gap: 8, marginBottom: 16 },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modeButtonActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  modeText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  modeTextActive: { color: "#fff" },
  section: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginBottom: 6 },
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
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
  profileChips: { flexDirection: "row", gap: 8 },
  chip: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: { backgroundColor: Colors.light.accent, borderColor: Colors.light.accent },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.text },
  chipTextActive: { color: "#fff" },
  platformRow: { flexDirection: "row", gap: 8 },
  platformChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  platformChipActive: { backgroundColor: Colors.light.accent, borderColor: Colors.light.accent },
  platformText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.text },
  platformTextActive: { color: "#fff" },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.accent,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  generateButtonDisabled: { opacity: 0.7 },
  generateText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  resultContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  resultTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  saveButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  saveText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.primary },
  resultContent: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 20 },
});
