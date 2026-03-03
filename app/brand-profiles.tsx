import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import type { BrandProfile } from "@shared/schema";

const TONES = ["professional", "casual", "playful", "luxurious", "minimalist", "bold", "friendly", "authoritative"];

function ProfileCard({
  profile,
  onDelete,
}: {
  profile: BrandProfile;
  onDelete: () => void;
}) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.profileIcon}>
          <Ionicons name="megaphone" size={18} color={Colors.light.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileTone}>{profile.tone}</Text>
        </View>
        {profile.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
        <Pressable onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={Colors.light.danger} />
        </Pressable>
      </View>
      {profile.targetAudience ? (
        <Text style={styles.profileAudience}>Audience: {profile.targetAudience}</Text>
      ) : null}
      {(profile.keywords as string[])?.length > 0 && (
        <View style={styles.keywordsRow}>
          {(profile.keywords as string[]).map((k, i) => (
            <View key={i} style={styles.keyword}>
              <Text style={styles.keywordText}>{k}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function BrandProfilesScreen() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");

  const { data: profiles = [], isLoading } = useQuery<BrandProfile[]>({ queryKey: ["/api/brand-profiles"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/brand-profiles", {
        name,
        tone,
        targetAudience: audience,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        description,
        isDefault: profiles.length === 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-profiles"] });
      setShowForm(false);
      setName("");
      setTone("professional");
      setAudience("");
      setKeywords("");
      setDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/brand-profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-profiles"] });
    },
  });

  const handleDelete = (profile: BrandProfile) => {
    if (Platform.OS === "web") {
      if (confirm(`Delete "${profile.name}"?`)) deleteMutation.mutate(profile.id);
    } else {
      Alert.alert("Delete Profile", `Delete "${profile.name}"?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(profile.id) },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Define how AI generates content for your brand. Each profile shapes the tone, language, and style of generated product descriptions and marketing copy.
      </Text>

      {profiles.map((p) => (
        <ProfileCard key={p.id} profile={p} onDelete={() => handleDelete(p)} />
      ))}

      {profiles.length === 0 && !showForm && (
        <View style={styles.emptyState}>
          <Ionicons name="color-palette-outline" size={40} color={Colors.light.textTertiary} />
          <Text style={styles.emptyTitle}>No brand profiles yet</Text>
          <Text style={styles.emptyText}>Create one to personalize AI-generated content</Text>
        </View>
      )}

      {showForm ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New Brand Profile</Text>
          <Text style={styles.label}>Profile Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g., My Brand" placeholderTextColor={Colors.light.textTertiary} />

          <Text style={styles.label}>Tone</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.toneRow}>
              {TONES.map((t) => (
                <Pressable key={t} style={[styles.toneChip, tone === t && styles.toneChipActive]} onPress={() => setTone(t)}>
                  <Text style={[styles.toneText, tone === t && styles.toneTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.label}>Target Audience</Text>
          <TextInput style={styles.input} value={audience} onChangeText={setAudience} placeholder="e.g., Young professionals aged 25-35" placeholderTextColor={Colors.light.textTertiary} />

          <Text style={styles.label}>Brand Keywords (comma-separated)</Text>
          <TextInput style={styles.input} value={keywords} onChangeText={setKeywords} placeholder="e.g., sustainable, premium, handcrafted" placeholderTextColor={Colors.light.textTertiary} />

          <Text style={styles.label}>Brand Description</Text>
          <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} placeholder="Describe your brand's mission and values..." placeholderTextColor={Colors.light.textTertiary} multiline />

          <View style={styles.formActions}>
            <Pressable style={styles.cancelButton} onPress={() => setShowForm(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.createButton, !name.trim() && styles.createButtonDisabled]} onPress={() => createMutation.mutate()} disabled={!name.trim() || createMutation.isPending}>
              {createMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.createText}>Create</Text>}
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.addButton} onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>New Brand Profile</Text>
        </Pressable>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.background },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 18, marginBottom: 16 },
  profileCard: { backgroundColor: Colors.light.surface, borderRadius: 12, padding: 14, marginBottom: 10 },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  profileIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.light.accent + "15", justifyContent: "center", alignItems: "center" },
  profileName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  profileTone: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textTransform: "capitalize" },
  defaultBadge: { backgroundColor: Colors.light.primary + "20", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  defaultText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.light.primary },
  profileAudience: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 8 },
  keywordsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  keyword: { backgroundColor: Colors.light.surfaceSecondary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  keywordText: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  formCard: { backgroundColor: Colors.light.surface, borderRadius: 12, padding: 16, marginTop: 8 },
  formTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginBottom: 12 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.light.background, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.text, borderWidth: 1, borderColor: Colors.light.border },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  toneRow: { flexDirection: "row", gap: 8 },
  toneChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.light.background, borderWidth: 1, borderColor: Colors.light.border },
  toneChipActive: { backgroundColor: Colors.light.accent, borderColor: Colors.light.accent },
  toneText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.text, textTransform: "capitalize" },
  toneTextActive: { color: "#fff" },
  formActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelButton: { flex: 1, backgroundColor: Colors.light.surfaceSecondary, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  cancelText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.light.text },
  createButton: { flex: 1, backgroundColor: Colors.light.primary, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  createButtonDisabled: { opacity: 0.5 },
  createText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: Colors.light.primary, borderRadius: 12, paddingVertical: 14, marginTop: 12 },
  addButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
