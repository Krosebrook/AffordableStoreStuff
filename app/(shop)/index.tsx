import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { shopColors } from "@/constants/colors";
import { useResponsive, getStableRating, getStableReviewCount, getStableDiscount } from "@/lib/useResponsive";
import type { Product } from "@shared/schema";

const CATEGORIES = [
  { id: "tops", label: "Tops", icon: "shirt-outline" as const },
  { id: "bottoms", label: "Bottoms", icon: "layers-outline" as const },
  { id: "dresses", label: "Dresses", icon: "sparkles-outline" as const },
  { id: "shoes", label: "Shoes", icon: "footsteps-outline" as const },
  { id: "bags", label: "Bags", icon: "bag-handle-outline" as const },
  { id: "jewelry", label: "Jewelry", icon: "diamond-outline" as const },
];

function CategoryButton({ label, icon, size }: { label: string; icon: any; size: number }) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [{ alignItems: "center", width: size, opacity: pressed ? 0.7 : 1 }]}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: "/(shop)/catalog", params: { category: label } });
      }}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={icon} size={22} color={shopColors.primary} />
      </View>
      <Text style={styles.categoryLabel}>{label}</Text>
    </Pressable>
  );
}

function ProductCard({ product, cardWidth }: { product: Product; cardWidth: number }) {
  const router = useRouter();
  const imageUrl = (product.images as string[])?.[0];
  const hasDiscount = getStableDiscount(product.id);
  const originalPrice = hasDiscount ? (parseFloat(product.price) * 1.3).toFixed(2) : null;
  const rating = getStableRating(product.id);
  const reviews = getStableReviewCount(product.id);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.productCard,
        { width: cardWidth, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/shop/product/${product.id}`);
      }}
    >
      <View style={[styles.productImageWrap, { height: cardWidth * 1.2 }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.productImage, styles.productImagePlaceholder]}>
            <Ionicons name="image-outline" size={28} color={shopColors.textTertiary} />
          </View>
        )}
        {hasDiscount && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        )}
        <Pressable
          style={({ pressed }) => [styles.heartBtn, { opacity: pressed ? 0.7 : 1 }]}
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation?.();
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons name="heart-outline" size={16} color={shopColors.textSecondary} />
        </Pressable>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${product.price}</Text>
          {originalPrice && <Text style={styles.originalPrice}>${originalPrice}</Text>}
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={11} color={shopColors.star} />
          <Text style={styles.ratingText}>{rating}</Text>
          <Text style={styles.reviewCount}>({reviews})</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ShopHomeScreen() {
  const router = useRouter();
  const { insets, contentPadding, productCardWidth, productCardGap, productColumns, width } = useResponsive();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const activeProducts = useMemo(
    () => products.filter(p => p.status === "active" || p.status === "draft"),
    [products]
  );

  const categoryBtnSize = (width - contentPadding * 2 - 12 * 5) / 6;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome to</Text>
              <Text style={styles.storeName}>AffordableStoreStuff</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                style={({ pressed }) => [styles.headerIcon, { opacity: pressed ? 0.6 : 1 }]}
                hitSlop={10}
              >
                <Ionicons name="notifications-outline" size={22} color={shopColors.text} />
                <View style={styles.notifDot} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.searchBar, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push("/(shop)/catalog")}
          >
            <Ionicons name="search-outline" size={18} color={shopColors.textTertiary} />
            <Text style={styles.searchPlaceholder}>Search products, styles...</Text>
          </Pressable>
        </View>

        <View style={[styles.section, { paddingHorizontal: contentPadding }]}>
          <View style={styles.heroBanner}>
            <View style={styles.heroGradient}>
              <Text style={styles.heroSubtitle}>AI-POWERED STYLE</Text>
              <Text style={styles.heroTitle}>Discover Your{"\n"}Perfect Look</Text>
              <Pressable
                style={({ pressed }) => [styles.heroBtn, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/shop/style-quiz");
                }}
              >
                <Text style={styles.heroBtnText}>Take Style Quiz</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: contentPadding }]}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <CategoryButton key={cat.id} label={cat.label} icon={cat.icon} size={Math.max(categoryBtnSize, 48)} />
            ))}
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: contentPadding }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Flash Sale</Text>
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={13} color={shopColors.sale} />
              <Text style={styles.timerText}>Ends in 2h 45m</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: contentPadding }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <Pressable
              onPress={() => router.push("/(shop)/catalog")}
              hitSlop={10}
            >
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {isLoading ? (
            <ActivityIndicator size="large" color={shopColors.primary} style={{ marginTop: 20 }} />
          ) : activeProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={44} color={shopColors.textTertiary} />
              <Text style={styles.emptyText}>No products available yet</Text>
              <Text style={styles.emptySubtext}>Check back soon for new arrivals</Text>
            </View>
          ) : (
            <View style={[styles.productGrid, { gap: productCardGap }]}>
              {activeProducts.slice(0, productColumns * 3).map(product => (
                <ProductCard key={product.id} product={product} cardWidth={productCardWidth} />
              ))}
            </View>
          )}
        </View>

        <View style={[styles.section, { paddingHorizontal: contentPadding }]}>
          <Pressable
            style={({ pressed }) => [styles.aiCard, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            onPress={() => router.push("/(shop)/stylist")}
          >
            <View style={styles.aiCardContent}>
              <Ionicons name="sparkles" size={26} color={shopColors.stylistPrimary} />
              <Text style={styles.aiCardTitle}>AI Style Recommendations</Text>
              <Text style={styles.aiCardDesc}>
                Get personalized outfit suggestions based on your style profile
              </Text>
              <View style={styles.aiCardBtn}>
                <Text style={styles.aiCardBtnText}>Explore</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </View>
            </View>
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: shopColors.surface,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  greeting: { fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_400Regular" },
  storeName: { fontSize: 22, color: shopColors.text, fontFamily: "Inter_700Bold", marginTop: 1 },
  headerActions: { flexDirection: "row", gap: 12 },
  headerIcon: { position: "relative", padding: 6 },
  notifDot: {
    position: "absolute", top: 4, right: 4, width: 8, height: 8,
    borderRadius: 4, backgroundColor: shopColors.sale, borderWidth: 1.5, borderColor: shopColors.surface,
  },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: shopColors.background, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: shopColors.border,
  },
  searchPlaceholder: { fontSize: 14, color: shopColors.textTertiary, fontFamily: "Inter_400Regular" },
  section: { marginTop: 24 },
  heroBanner: {
    borderRadius: 16,
    overflow: "hidden", backgroundColor: shopColors.primary,
  },
  heroGradient: { padding: 24, minHeight: 170, justifyContent: "center" },
  heroSubtitle: {
    fontSize: 11, color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginBottom: 6,
  },
  heroTitle: { fontSize: 26, color: "#fff", fontFamily: "Inter_700Bold", lineHeight: 32, marginBottom: 16 },
  heroBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "flex-start",
    paddingHorizontal: 18, paddingVertical: 11, borderRadius: 24,
  },
  heroBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 18, color: shopColors.text, fontFamily: "Inter_700Bold", marginBottom: 14 },
  seeAll: { fontSize: 14, color: shopColors.primary, fontFamily: "Inter_600SemiBold" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  categoryIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: `${shopColors.primary}10`, alignItems: "center", justifyContent: "center",
  },
  categoryLabel: { fontSize: 11, color: shopColors.textSecondary, fontFamily: "Inter_500Medium", marginTop: 6, textAlign: "center" },
  timerBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: `${shopColors.sale}10`, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  timerText: { fontSize: 12, color: shopColors.sale, fontFamily: "Inter_600SemiBold" },
  productGrid: { flexDirection: "row", flexWrap: "wrap" },
  productCard: {
    backgroundColor: shopColors.surface,
    borderRadius: 12, overflow: "hidden",
  },
  productImageWrap: { position: "relative", width: "100%" },
  productImage: { width: "100%", height: "100%" },
  productImagePlaceholder: { backgroundColor: shopColors.background, alignItems: "center", justifyContent: "center" },
  saleBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: shopColors.sale, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  saleBadgeText: { fontSize: 10, color: "#fff", fontFamily: "Inter_700Bold" },
  heartBtn: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: "rgba(255,255,255,0.92)", width: 32, height: 32,
    borderRadius: 16, alignItems: "center", justifyContent: "center",
  },
  productInfo: { padding: 10 },
  productTitle: { fontSize: 13, color: shopColors.text, fontFamily: "Inter_500Medium", lineHeight: 18 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  productPrice: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_700Bold" },
  originalPrice: { fontSize: 12, color: shopColors.textTertiary, textDecorationLine: "line-through", fontFamily: "Inter_400Regular" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  ratingText: { fontSize: 11, color: shopColors.text, fontFamily: "Inter_600SemiBold" },
  reviewCount: { fontSize: 11, color: shopColors.textTertiary, fontFamily: "Inter_400Regular" },
  aiCard: {
    borderRadius: 16, overflow: "hidden",
    backgroundColor: `${shopColors.stylistPrimary}08`,
    borderWidth: 1, borderColor: `${shopColors.stylistPrimary}20`,
  },
  aiCardContent: { padding: 20, alignItems: "center" },
  aiCardTitle: { fontSize: 17, color: shopColors.text, fontFamily: "Inter_700Bold", marginTop: 10, textAlign: "center" },
  aiCardDesc: { fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 6, lineHeight: 19 },
  aiCardBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 14, backgroundColor: shopColors.stylistPrimary,
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24,
  },
  aiCardBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 16, color: shopColors.text, fontFamily: "Inter_600SemiBold", marginTop: 12 },
  emptySubtext: { fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 4 },
});
