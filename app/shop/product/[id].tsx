import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { shopColors } from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import { useResponsive } from "@/lib/useResponsive";
import type { Product } from "@shared/schema";

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS_LIST = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1E3A5F" },
  { name: "Red", hex: "#DC2626" },
];

export default function ShopProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { width } = useWindowDimensions();
  const { insets, contentPadding } = useResponsive();
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Black");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const imageHeight = Math.min(width * 1.1, 500);
  const bottomPad = Math.max(insets.bottom, 20);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/shop/cart", {
        productId: parseInt(id!),
        quantity,
        selectedSize,
        selectedColor,
      });
    },
    onSuccess: () => {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["/api/shop/cart"] });
      Alert.alert("Added to Cart", `${product?.title} has been added to your cart`);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: "" }} />
        <ActivityIndicator size="large" color={shopColors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: "Not Found" }} />
        <Ionicons name="alert-circle-outline" size={44} color={shopColors.textTertiary} />
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const images = (product.images as string[]) || [];
  const rating = 4.7;
  const reviews = 128;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: product.title, headerTintColor: shopColors.text }} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.imageCarousel}>
          {images.length > 0 ? (
            <>
              <Image
                source={{ uri: images[activeImageIdx] }}
                style={[styles.mainImage, { width, height: imageHeight }]}
                contentFit="cover"
                transition={200}
              />
              {images.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow} contentContainerStyle={styles.thumbContent}>
                  {images.map((img, i) => (
                    <Pressable
                      key={i}
                      onPress={() => {
                        setActiveImageIdx(i);
                        if (Platform.OS !== "web") Haptics.selectionAsync();
                      }}
                      hitSlop={4}
                    >
                      <Image
                        source={{ uri: img }}
                        style={[styles.thumb, activeImageIdx === i && styles.thumbActive]}
                        contentFit="cover"
                        transition={100}
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={[styles.mainImage, styles.imagePlaceholder, { width, height: imageHeight }]}>
              <Ionicons name="image-outline" size={44} color={shopColors.textTertiary} />
            </View>
          )}
        </View>

        <View style={[styles.detailsSection, { paddingHorizontal: contentPadding }]}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Ionicons
                    key={star}
                    name={star <= Math.floor(rating) ? "star" : star - 0.5 <= rating ? "star-half" : "star-outline"}
                    size={15}
                    color={shopColors.star}
                  />
                ))}
                <Text style={styles.ratingText}>{rating}</Text>
                <Text style={styles.reviewCount}>({reviews} reviews)</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.heartBtn, { opacity: pressed ? 0.6 : 1 }]}
              hitSlop={8}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name="heart-outline" size={22} color={shopColors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.price}>${product.price}</Text>

          {product.description && (
            <View style={styles.descSection}>
              <Text style={styles.descLabel}>Description</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          )}

          <View style={styles.optionSection}>
            <Text style={styles.optionLabel}>Color</Text>
            <View style={styles.colorsRow}>
              {COLORS_LIST.map(c => (
                <Pressable
                  key={c.name}
                  style={[styles.colorBtn, selectedColor === c.name && styles.colorBtnActive]}
                  onPress={() => {
                    setSelectedColor(c.name);
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                  }}
                >
                  <View style={[styles.colorSwatch, { backgroundColor: c.hex }]} />
                  <Text style={styles.colorName}>{c.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.optionSection}>
            <Text style={styles.optionLabel}>Size</Text>
            <View style={styles.sizesRow}>
              {SIZES.map(s => (
                <Pressable
                  key={s}
                  style={[styles.sizeBtn, selectedSize === s && styles.sizeBtnActive]}
                  onPress={() => {
                    setSelectedSize(s);
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                  }}
                >
                  <Text style={[styles.sizeBtnText, selectedSize === s && styles.sizeBtnTextActive]}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.optionSection}>
            <Text style={styles.optionLabel}>Quantity</Text>
            <View style={styles.qtyRow}>
              <Pressable
                style={({ pressed }) => [styles.qtyBtn, { opacity: pressed ? 0.6 : 1 }]}
                onPress={() => {
                  setQuantity(Math.max(1, quantity - 1));
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
                hitSlop={6}
              >
                <Ionicons name="remove" size={18} color={shopColors.text} />
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable
                style={({ pressed }) => [styles.qtyBtn, { opacity: pressed ? 0.6 : 1 }]}
                onPress={() => {
                  setQuantity(quantity + 1);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
                hitSlop={6}
              >
                <Ionicons name="add" size={18} color={shopColors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color={shopColors.accent} />
              <Text style={styles.featureText}>Quality Guaranteed</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="cube-outline" size={18} color={shopColors.accent} />
              <Text style={styles.featureText}>Free Shipping over $50</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="refresh-outline" size={18} color={shopColors.accent} />
              <Text style={styles.featureText}>30-Day Returns</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad, paddingHorizontal: contentPadding }]}>
        <Pressable
          style={({ pressed }) => [styles.addToCartBtn, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => addToCart.mutate()}
          disabled={addToCart.isPending}
        >
          {addToCart.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="bag-add-outline" size={20} color="#fff" />
              <Text style={styles.addToCartText}>Add to Cart - ${(parseFloat(product.price) * quantity).toFixed(2)}</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: shopColors.background },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: shopColors.background, gap: 12 },
  errorText: { fontSize: 16, color: shopColors.textSecondary, fontFamily: "Inter_500Medium" },
  scroll: { flex: 1 },
  imageCarousel: { backgroundColor: shopColors.surface },
  mainImage: {},
  imagePlaceholder: { backgroundColor: shopColors.background, alignItems: "center", justifyContent: "center" },
  thumbRow: { paddingVertical: 10 },
  thumbContent: { paddingHorizontal: 16, gap: 8 },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  thumbActive: { borderWidth: 2, borderColor: shopColors.primary },
  detailsSection: { paddingVertical: 16 },
  titleRow: { flexDirection: "row", alignItems: "flex-start" },
  productTitle: { fontSize: 20, color: shopColors.text, fontFamily: "Inter_700Bold", lineHeight: 26 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 6 },
  ratingText: { fontSize: 13, color: shopColors.text, fontFamily: "Inter_600SemiBold", marginLeft: 4 },
  reviewCount: { fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_400Regular" },
  heartBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: shopColors.background, alignItems: "center", justifyContent: "center", marginLeft: 8,
  },
  price: { fontSize: 26, color: shopColors.primary, fontFamily: "Inter_700Bold", marginTop: 12 },
  descSection: { marginTop: 20 },
  descLabel: { fontSize: 16, color: shopColors.text, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  descText: { fontSize: 14, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", lineHeight: 22 },
  optionSection: { marginTop: 22 },
  optionLabel: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  colorsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: shopColors.border,
  },
  colorBtnActive: { borderColor: shopColors.primary, backgroundColor: `${shopColors.primary}08` },
  colorSwatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: shopColors.border },
  colorName: { fontSize: 13, color: shopColors.text, fontFamily: "Inter_500Medium" },
  sizesRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  sizeBtn: {
    width: 46, height: 46, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: shopColors.border,
  },
  sizeBtnActive: { backgroundColor: shopColors.primary, borderColor: shopColors.primary },
  sizeBtnText: { fontSize: 14, color: shopColors.text, fontFamily: "Inter_600SemiBold" },
  sizeBtnTextActive: { color: "#fff" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: shopColors.background, alignItems: "center", justifyContent: "center",
  },
  qtyValue: { fontSize: 18, color: shopColors.text, fontFamily: "Inter_700Bold", minWidth: 24, textAlign: "center" },
  features: { marginTop: 28, gap: 12, paddingTop: 20, borderTopWidth: 1, borderTopColor: shopColors.border },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 14, color: shopColors.textSecondary, fontFamily: "Inter_500Medium" },
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: shopColors.surface, paddingTop: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  addToCartBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: shopColors.primary, paddingVertical: 16, borderRadius: 14,
  },
  addToCartText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
