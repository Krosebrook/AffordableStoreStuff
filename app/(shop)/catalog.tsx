import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { shopColors } from "@/constants/colors";
import { useResponsive, getStableRating } from "@/lib/useResponsive";
import type { Product } from "@shared/schema";

const SORT_OPTIONS = ["Popular", "Newest", "Price: Low", "Price: High"];

export default function CatalogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Popular");
  const { contentPadding, productCardWidth, productCardGap, productColumns } = useResponsive();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filtered = useMemo(() =>
    products
      .filter(p => {
        const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
        const matchCategory = !params.category || p.category?.toLowerCase() === params.category?.toLowerCase();
        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        if (sortBy === "Price: Low") return parseFloat(a.price) - parseFloat(b.price);
        if (sortBy === "Price: High") return parseFloat(b.price) - parseFloat(a.price);
        return 0;
      }),
    [products, search, params.category, sortBy]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.searchRow, { paddingHorizontal: contentPadding }]}>
        <View style={styles.searchInput}>
          <Ionicons name="search-outline" size={18} color={shopColors.textTertiary} />
          <TextInput
            style={styles.input}
            placeholder="Search products..."
            placeholderTextColor={shopColors.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={shopColors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow} contentContainerStyle={[styles.sortContent, { paddingHorizontal: contentPadding }]}>
        {SORT_OPTIONS.map(opt => (
          <Pressable
            key={opt}
            style={[styles.sortChip, sortBy === opt && styles.sortChipActive]}
            onPress={() => {
              setSortBy(opt);
              if (Platform.OS !== "web") Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.sortChipText, sortBy === opt && styles.sortChipTextActive]}>{opt}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={[styles.resultCount, { paddingHorizontal: contentPadding }]}>
        {filtered.length} product{filtered.length !== 1 ? "s" : ""}
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={shopColors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          numColumns={productColumns}
          key={`cols-${productColumns}`}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={[styles.grid, { paddingHorizontal: contentPadding }]}
          columnWrapperStyle={{ gap: productCardGap }}
          ItemSeparatorComponent={() => <View style={{ height: productCardGap }} />}
          scrollEnabled={!!filtered.length}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const imageUrl = (item.images as string[])?.[0];
            const rating = getStableRating(item.id);
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.productCard,
                  { width: productCardWidth, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/shop/product/${item.id}`);
                }}
              >
                <View style={[styles.imageWrap, { height: productCardWidth * 1.2 }]}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={200} />
                  ) : (
                    <View style={[styles.image, styles.placeholder]}>
                      <Ionicons name="image-outline" size={26} color={shopColors.textTertiary} />
                    </View>
                  )}
                  <Pressable
                    style={({ pressed }) => [styles.heartBtn, { opacity: pressed ? 0.6 : 1 }]}
                    hitSlop={8}
                  >
                    <Ionicons name="heart-outline" size={15} color={shopColors.textSecondary} />
                  </Pressable>
                </View>
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.price}>${item.price}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={11} color={shopColors.star} />
                    <Text style={styles.rating}>{rating}</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={44} color={shopColors.textTertiary} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyDesc}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: shopColors.background },
  searchRow: { paddingTop: 8, paddingBottom: 4 },
  searchInput: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: shopColors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: Platform.OS === "web" ? 10 : 10,
    borderWidth: 1, borderColor: shopColors.border,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: shopColors.text, minHeight: 22 },
  sortRow: { maxHeight: 48, marginTop: 8 },
  sortContent: { gap: 8, alignItems: "center" },
  sortChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: shopColors.surface, borderWidth: 1, borderColor: shopColors.border,
  },
  sortChipActive: { backgroundColor: shopColors.primary, borderColor: shopColors.primary },
  sortChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: shopColors.textSecondary },
  sortChipTextActive: { color: "#fff" },
  resultCount: { paddingTop: 12, paddingBottom: 8, fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_500Medium" },
  grid: { paddingBottom: 100 },
  productCard: {
    backgroundColor: shopColors.surface, borderRadius: 12, overflow: "hidden",
  },
  imageWrap: { position: "relative", width: "100%" },
  image: { width: "100%", height: "100%" },
  placeholder: { backgroundColor: shopColors.background, alignItems: "center", justifyContent: "center" },
  heartBtn: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: "rgba(255,255,255,0.92)", width: 30, height: 30,
    borderRadius: 15, alignItems: "center", justifyContent: "center",
  },
  info: { padding: 10 },
  title: { fontSize: 13, color: shopColors.text, fontFamily: "Inter_500Medium", lineHeight: 18 },
  price: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_700Bold", marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  rating: { fontSize: 11, color: shopColors.text, fontFamily: "Inter_500Medium" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyTitle: { fontSize: 16, color: shopColors.text, fontFamily: "Inter_600SemiBold", marginTop: 12 },
  emptyDesc: { fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 4 },
});
