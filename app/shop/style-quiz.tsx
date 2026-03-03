import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shopColors } from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AESTHETICS = [
  { id: "minimalist", label: "Minimalist", desc: "Clean lines, neutral tones", emoji: "🤍" },
  { id: "classic", label: "Classic", desc: "Timeless, tailored pieces", emoji: "👔" },
  { id: "bohemian", label: "Bohemian", desc: "Free-spirited, eclectic", emoji: "🌻" },
  { id: "streetwear", label: "Streetwear", desc: "Urban, bold statements", emoji: "🔥" },
  { id: "romantic", label: "Romantic", desc: "Soft fabrics, florals", emoji: "🌸" },
  { id: "avant-garde", label: "Avant-Garde", desc: "Experimental, edgy", emoji: "⚡" },
  { id: "preppy", label: "Preppy", desc: "Polished, collegiate", emoji: "🎓" },
  { id: "athleisure", label: "Athleisure", desc: "Sporty meets casual", emoji: "🏃" },
];

const COLOR_PALETTES = [
  { id: "neutrals", label: "Neutrals", colors: ["#1a1a1a", "#6b6b6b", "#d4d4d4", "#f5f5f0"] },
  { id: "warm", label: "Warm Tones", colors: ["#c2410c", "#ea580c", "#f59e0b", "#fbbf24"] },
  { id: "cool", label: "Cool Tones", colors: ["#1d4ed8", "#2563eb", "#06b6d4", "#67e8f9"] },
  { id: "earth", label: "Earth Tones", colors: ["#78350f", "#92400e", "#a16207", "#65a30d"] },
  { id: "pastels", label: "Pastels", colors: ["#fce7f3", "#dbeafe", "#d1fae5", "#fef3c7"] },
  { id: "jewel", label: "Jewel Tones", colors: ["#7c2d12", "#5b21b6", "#065f46", "#991b1b"] },
];

const PATTERNS = [
  { id: "solid", label: "Solid Colors" },
  { id: "stripes", label: "Stripes" },
  { id: "plaid", label: "Plaid/Check" },
  { id: "floral", label: "Floral" },
  { id: "geometric", label: "Geometric" },
  { id: "abstract", label: "Abstract" },
];

const OCCASIONS = [
  { id: "work", label: "Work/Office", icon: "briefcase-outline" as const },
  { id: "casual", label: "Casual/Weekend", icon: "cafe-outline" as const },
  { id: "formal", label: "Formal Events", icon: "wine-outline" as const },
  { id: "workout", label: "Workout/Active", icon: "fitness-outline" as const },
  { id: "date", label: "Date Night", icon: "heart-outline" as const },
  { id: "travel", label: "Travel", icon: "airplane-outline" as const },
];

const LIFESTYLES = [
  { id: "active", label: "Active & On-the-Go" },
  { id: "professional", label: "Corporate Professional" },
  { id: "creative", label: "Creative & Artistic" },
  { id: "relaxed", label: "Laid-back & Relaxed" },
  { id: "social", label: "Social Butterfly" },
];

export default function StyleQuizScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedLifestyle, setSelectedLifestyle] = useState("");

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/shop/style-profile", {
        aesthetics: selectedAesthetics,
        colors: selectedColors,
        patterns: selectedPatterns,
        occasions: selectedOccasions,
        lifestyle: selectedLifestyle,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/shop/style-profile"] });
      Alert.alert("Style Profile Created!", "Your AI stylist will now personalize recommendations for you.");
      router.back();
    },
  });

  const totalSteps = 3;
  const progress = step / totalSteps;

  const canProceed = () => {
    if (step === 1) return selectedAesthetics.length >= 1;
    if (step === 2) return selectedColors.length >= 1;
    if (step === 3) return selectedOccasions.length >= 1;
    return true;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Style Quiz", headerTintColor: shopColors.text }} />

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.stepIndicator}>Step {step} of {totalSteps}</Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your style aesthetic?</Text>
            <Text style={styles.stepDesc}>Select all that resonate with you</Text>
            <View style={styles.optionsGrid}>
              {AESTHETICS.map(a => (
                <Pressable
                  key={a.id}
                  style={[styles.aestheticCard, selectedAesthetics.includes(a.id) && styles.aestheticCardActive]}
                  onPress={() => toggleItem(selectedAesthetics, setSelectedAesthetics, a.id)}
                >
                  <Text style={styles.aestheticEmoji}>{a.emoji}</Text>
                  <Text style={[styles.aestheticLabel, selectedAesthetics.includes(a.id) && styles.aestheticLabelActive]}>{a.label}</Text>
                  <Text style={styles.aestheticDesc}>{a.desc}</Text>
                  {selectedAesthetics.includes(a.id) && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your Color Preferences</Text>
            <Text style={styles.stepDesc}>Choose palettes that appeal to you</Text>
            <View style={styles.colorPalettes}>
              {COLOR_PALETTES.map(p => (
                <Pressable
                  key={p.id}
                  style={[styles.paletteCard, selectedColors.includes(p.id) && styles.paletteCardActive]}
                  onPress={() => toggleItem(selectedColors, setSelectedColors, p.id)}
                >
                  <View style={styles.paletteSwatches}>
                    {p.colors.map((c, i) => (
                      <View key={i} style={[styles.paletteSwatch, { backgroundColor: c }]} />
                    ))}
                  </View>
                  <Text style={styles.paletteLabel}>{p.label}</Text>
                  {selectedColors.includes(p.id) && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={[styles.stepTitle, { marginTop: 24 }]}>Patterns You Like</Text>
            <View style={styles.patternsRow}>
              {PATTERNS.map(p => (
                <Pressable
                  key={p.id}
                  style={[styles.patternChip, selectedPatterns.includes(p.id) && styles.patternChipActive]}
                  onPress={() => toggleItem(selectedPatterns, setSelectedPatterns, p.id)}
                >
                  <Text style={[styles.patternText, selectedPatterns.includes(p.id) && styles.patternTextActive]}>{p.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Lifestyle & Occasions</Text>
            <Text style={styles.stepDesc}>What do you dress for most?</Text>
            <View style={styles.occasionsGrid}>
              {OCCASIONS.map(o => (
                <Pressable
                  key={o.id}
                  style={[styles.occasionCard, selectedOccasions.includes(o.id) && styles.occasionCardActive]}
                  onPress={() => toggleItem(selectedOccasions, setSelectedOccasions, o.id)}
                >
                  <Ionicons name={o.icon} size={24} color={selectedOccasions.includes(o.id) ? shopColors.primary : shopColors.textSecondary} />
                  <Text style={[styles.occasionLabel, selectedOccasions.includes(o.id) && styles.occasionLabelActive]}>{o.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.stepTitle, { marginTop: 24 }]}>Your Lifestyle</Text>
            <View style={styles.lifestyleCol}>
              {LIFESTYLES.map(l => (
                <Pressable
                  key={l.id}
                  style={[styles.lifestyleOption, selectedLifestyle === l.id && styles.lifestyleOptionActive]}
                  onPress={() => setSelectedLifestyle(l.id)}
                >
                  <View style={[styles.radio, selectedLifestyle === l.id && styles.radioActive]}>
                    {selectedLifestyle === l.id && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.lifestyleLabel}>{l.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        {step > 1 && (
          <Pressable style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Ionicons name="arrow-back" size={20} color={shopColors.text} />
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }} />
        <Pressable
          style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
          onPress={() => {
            if (!canProceed()) return;
            if (step < totalSteps) {
              setStep(step + 1);
            } else {
              saveMutation.mutate();
            }
          }}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>{step === totalSteps ? "Create Profile" : "Next"}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: shopColors.background },
  progressBar: { height: 4, backgroundColor: shopColors.border, marginHorizontal: 16, marginTop: 8, borderRadius: 2 },
  progressFill: { height: "100%", backgroundColor: shopColors.primary, borderRadius: 2 },
  stepIndicator: { fontSize: 12, color: shopColors.textSecondary, fontFamily: "Inter_500Medium", textAlign: "center", marginTop: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  stepContent: {},
  stepTitle: { fontSize: 22, color: shopColors.text, fontFamily: "Inter_700Bold" },
  stepDesc: { fontSize: 14, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 4, marginBottom: 20 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  aestheticCard: {
    width: (SCREEN_WIDTH - 44) / 2, borderRadius: 14, padding: 16,
    backgroundColor: shopColors.surface, borderWidth: 2, borderColor: shopColors.border,
    position: "relative",
  },
  aestheticCardActive: { borderColor: shopColors.primary, backgroundColor: `${shopColors.primary}06` },
  aestheticEmoji: { fontSize: 28, marginBottom: 8 },
  aestheticLabel: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_600SemiBold" },
  aestheticLabelActive: { color: shopColors.primary },
  aestheticDesc: { fontSize: 12, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 2 },
  checkBadge: {
    position: "absolute", top: 10, right: 10,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: shopColors.primary, alignItems: "center", justifyContent: "center",
  },
  colorPalettes: { gap: 12 },
  paletteCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 14, padding: 16, backgroundColor: shopColors.surface,
    borderWidth: 2, borderColor: shopColors.border, position: "relative",
  },
  paletteCardActive: { borderColor: shopColors.primary, backgroundColor: `${shopColors.primary}06` },
  paletteSwatches: { flexDirection: "row", gap: 6 },
  paletteSwatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: shopColors.border },
  paletteLabel: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_600SemiBold", flex: 1 },
  patternsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  patternChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
    backgroundColor: shopColors.surface, borderWidth: 1, borderColor: shopColors.border,
  },
  patternChipActive: { backgroundColor: shopColors.primary, borderColor: shopColors.primary },
  patternText: { fontSize: 14, color: shopColors.text, fontFamily: "Inter_500Medium" },
  patternTextActive: { color: "#fff" },
  occasionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  occasionCard: {
    width: (SCREEN_WIDTH - 44) / 2, borderRadius: 14, padding: 16,
    backgroundColor: shopColors.surface, borderWidth: 2, borderColor: shopColors.border,
    alignItems: "center", gap: 8,
  },
  occasionCardActive: { borderColor: shopColors.primary, backgroundColor: `${shopColors.primary}06` },
  occasionLabel: { fontSize: 14, color: shopColors.text, fontFamily: "Inter_500Medium", textAlign: "center" },
  occasionLabelActive: { color: shopColors.primary },
  lifestyleCol: { gap: 8, marginTop: 12 },
  lifestyleOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: shopColors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: shopColors.border,
  },
  lifestyleOptionActive: { borderColor: shopColors.primary, backgroundColor: `${shopColors.primary}06` },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: shopColors.border,
    alignItems: "center", justifyContent: "center",
  },
  radioActive: { borderColor: shopColors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: shopColors.primary },
  lifestyleLabel: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_500Medium" },
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 12,
    paddingBottom: Platform.OS === "web" ? 34 : 24,
    backgroundColor: shopColors.surface, borderTopWidth: 1, borderTopColor: shopColors.border,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 12, paddingHorizontal: 16 },
  backBtnText: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_600SemiBold" },
  nextBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: shopColors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
