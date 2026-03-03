import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { shopColors } from "@/constants/colors";
import { useResponsive } from "@/lib/useResponsive";
import type { Product } from "@shared/schema";

const STYLE_TOOLS = [
  { id: "quiz", title: "Style Quiz", desc: "Discover your style DNA", icon: "color-palette-outline" as const, route: "/shop/style-quiz" },
  { id: "chat", title: "AI Chat", desc: "Get outfit advice", icon: "chatbubbles-outline" as const, route: "/shop/stylist-chat" },
  { id: "wardrobe", title: "My Wardrobe", desc: "Manage your closet", icon: "shirt-outline" as const, route: "/shop/wardrobe" },
  { id: "calendar", title: "Outfit Planner", desc: "Plan weekly outfits", icon: "calendar-outline" as const, route: "/shop/outfit-planner" },
];

function RecommendationCard({ product, reason }: { product: Product; reason: string }) {
  const router = useRouter();
  const imageUrl = (product.images as string[])?.[0];

  return (
    <Pressable
      style={({ pressed }) => [styles.recCard, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/shop/product/${product.id}`);
      }}
    >
      <View style={styles.recImageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.recImage} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.recImage, styles.recPlaceholder]}>
            <Ionicons name="image-outline" size={26} color={shopColors.textTertiary} />
          </View>
        )}
      </View>
      <View style={styles.recInfo}>
        <Text style={styles.recTitle} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.recPrice}>${product.price}</Text>
        <View style={styles.recReasonRow}>
          <Ionicons name="sparkles" size={11} color={shopColors.stylistPrimary} />
          <Text style={styles.recReason} numberOfLines={1}>{reason}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function StylistScreen() {
  const router = useRouter();
  const { contentPadding, toolCardWidth, insets } = useResponsive();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: styleProfile } = useQuery<any>({
    queryKey: ["/api/shop/style-profile"],
  });

  const activeProducts = products.filter(p => p.status !== "archived");
  const recommendations = activeProducts.slice(0, 4);
  const reasons = [
    "Matches your minimalist aesthetic",
    "Perfect for your color palette",
    "Great for casual occasions",
    "Trending in your style DNA",
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles" size={30} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Your AI Stylist</Text>
          <Text style={styles.heroDesc}>
            Personalized fashion recommendations powered by AI
          </Text>
          {!styleProfile && (
            <Pressable
              style={({ pressed }) => [styles.quizBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/shop/style-quiz");
              }}
            >
              <Text style={styles.quizBtnText}>Take Style Quiz</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </Pressable>
          )}
        </View>

        <View style={[styles.section, { paddingHorizontal: contentPadding }]}>
          <Text style={styles.sectionTitle}>Style Tools</Text>
          <View style={styles.toolsGrid}>
            {STYLE_TOOLS.map(tool => (
              <Pressable
                key={tool.id}
                style={({ pressed }) => [
                  styles.toolCard,
                  { width: toolCardWidth, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(tool.route as any);
                }}
              >
                <View style={styles.toolIcon}>
                  <Ionicons name={tool.icon} size={22} color={shopColors.stylistPrimary} />
                </View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDesc}>{tool.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: contentPadding }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Picks for You</Text>
            <Pressable hitSlop={10}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {recommendations.length === 0 ? (
            <View style={styles.emptyRecs}>
              <Ionicons name="sparkles-outline" size={36} color={shopColors.textTertiary} />
              <Text style={styles.emptyRecsText}>Complete your style quiz to get personalized picks</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recScroll}>
              {recommendations.map((product, i) => (
                <RecommendationCard key={product.id} product={product} reason={reasons[i % reasons.length]} />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={{ paddingHorizontal: contentPadding }}>
          <Pressable
            style={({ pressed }) => [styles.chatBanner, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/shop/stylist-chat");
            }}
          >
            <View style={styles.chatBannerLeft}>
              <View style={styles.chatBannerIcon}>
                <Ionicons name="chatbubbles" size={22} color={shopColors.stylistPrimary} />
              </View>
              <View style={styles.chatBannerText}>
                <Text style={styles.chatBannerTitle}>Chat with Your Stylist</Text>
                <Text style={styles.chatBannerDesc}>Ask about outfits, trends, or style advice</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={shopColors.textTertiary} />
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: shopColors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  heroSection: {
    backgroundColor: shopColors.stylistPrimary,
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  heroIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  heroTitle: { fontSize: 24, color: "#fff", fontFamily: "Inter_700Bold" },
  heroDesc: { fontSize: 14, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 6, lineHeight: 20 },
  quizBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 22,
    paddingVertical: 12, borderRadius: 26, marginTop: 16,
  },
  quizBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 18, color: shopColors.text, fontFamily: "Inter_700Bold", marginBottom: 14 },
  seeAll: { fontSize: 14, color: shopColors.stylistPrimary, fontFamily: "Inter_600SemiBold" },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  toolCard: {
    backgroundColor: shopColors.surface,
    borderRadius: 14, padding: 16,
  },
  toolIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: `${shopColors.stylistPrimary}10`,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  toolTitle: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_600SemiBold" },
  toolDesc: { fontSize: 12, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 3 },
  recScroll: { gap: 12, paddingRight: 16 },
  recCard: {
    width: 155, backgroundColor: shopColors.surface,
    borderRadius: 12, overflow: "hidden",
  },
  recImageWrap: { width: "100%", height: 175 },
  recImage: { width: "100%", height: "100%" },
  recPlaceholder: { backgroundColor: shopColors.background, alignItems: "center", justifyContent: "center" },
  recInfo: { padding: 10 },
  recTitle: { fontSize: 13, color: shopColors.text, fontFamily: "Inter_500Medium", lineHeight: 17 },
  recPrice: { fontSize: 14, color: shopColors.text, fontFamily: "Inter_700Bold", marginTop: 4 },
  recReasonRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  recReason: { fontSize: 11, color: shopColors.stylistPrimary, fontFamily: "Inter_500Medium", flex: 1 },
  emptyRecs: { alignItems: "center", paddingVertical: 30 },
  emptyRecsText: { fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 8, textAlign: "center" },
  chatBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: 24,
    backgroundColor: shopColors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: `${shopColors.stylistPrimary}15`,
  },
  chatBannerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  chatBannerIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: `${shopColors.stylistPrimary}10`,
    alignItems: "center", justifyContent: "center",
  },
  chatBannerText: { flex: 1 },
  chatBannerTitle: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_600SemiBold" },
  chatBannerDesc: { fontSize: 12, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 2 },
});
