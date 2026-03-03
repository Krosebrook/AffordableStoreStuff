import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { shopColors } from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import { useResponsive } from "@/lib/useResponsive";

interface CartItemWithProduct {
  id: number;
  productId: number;
  quantity: number;
  selectedColor: string | null;
  selectedSize: string | null;
  product: { title: string; price: string; images: string[] };
}

export default function CartScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const { insets, contentPadding } = useResponsive();

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/shop/cart"],
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      if (quantity <= 0) {
        await apiRequest("DELETE", `/api/shop/cart/${id}`);
      } else {
        await apiRequest("PUT", `/api/shop/cart/${id}`, { quantity });
      }
    },
    onSuccess: () => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      qc.invalidateQueries({ queryKey: ["/api/shop/cart"] });
    },
  });

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.product?.price || "0") * item.quantity, 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal - discount + shipping;

  const bottomPad = Math.max(insets.bottom, 20);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: contentPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={shopColors.primary} style={{ marginTop: 40 }} />
        ) : cartItems.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="bag-outline" size={48} color={shopColors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyDesc}>Browse our collection and add items you love</Text>
            <Pressable
              style={({ pressed }) => [styles.shopBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push("/(shop)/catalog")}
            >
              <Ionicons name="search-outline" size={18} color="#fff" />
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.itemCount}>{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</Text>

            {cartItems.map(item => {
              const imageUrl = item.product?.images?.[0];
              return (
                <View key={item.id} style={styles.cartItem}>
                  <Pressable
                    style={styles.itemImage}
                    onPress={() => router.push(`/shop/product/${item.productId}`)}
                  >
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.itemImg} contentFit="cover" transition={150} />
                    ) : (
                      <View style={[styles.itemImg, styles.imgPlaceholder]}>
                        <Ionicons name="image-outline" size={20} color={shopColors.textTertiary} />
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.itemInfo}
                    onPress={() => router.push(`/shop/product/${item.productId}`)}
                  >
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.product?.title}</Text>
                    {(item.selectedSize || item.selectedColor) && (
                      <Text style={styles.itemMeta}>
                        {[item.selectedSize && `Size: ${item.selectedSize}`, item.selectedColor && `Color: ${item.selectedColor}`].filter(Boolean).join(" · ")}
                      </Text>
                    )}
                    <Text style={styles.itemPrice}>${item.product?.price}</Text>
                  </Pressable>
                  <View style={styles.qtyControls}>
                    <Pressable
                      style={({ pressed }) => [styles.qtyBtn, { opacity: pressed ? 0.6 : 1 }]}
                      onPress={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity - 1 })}
                      hitSlop={6}
                    >
                      <Ionicons name={item.quantity <= 1 ? "trash-outline" : "remove"} size={16} color={item.quantity <= 1 ? shopColors.sale : shopColors.text} />
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable
                      style={({ pressed }) => [styles.qtyBtn, { opacity: pressed ? 0.6 : 1 }]}
                      onPress={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity + 1 })}
                      hitSlop={6}
                    >
                      <Ionicons name="add" size={16} color={shopColors.text} />
                    </Pressable>
                  </View>
                </View>
              );
            })}

            <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                placeholderTextColor={shopColors.textTertiary}
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
                returnKeyType="done"
              />
              <Pressable
                style={({ pressed }) => [styles.promoBtn, !promoCode && styles.promoBtnDisabled, { opacity: pressed && promoCode ? 0.85 : 1 }]}
                onPress={() => {
                  if (promoCode) {
                    setPromoApplied(true);
                    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                }}
              >
                <Text style={styles.promoBtnText}>Apply</Text>
              </Pressable>
            </View>
            {promoApplied && (
              <View style={styles.promoSuccess}>
                <Ionicons name="checkmark-circle" size={16} color={shopColors.accent} />
                <Text style={styles.promoSuccessText}>10% discount applied!</Text>
              </View>
            )}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryValue, { color: shopColors.accent }]}>-${discount.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</Text>
              </View>
              {shipping === 0 && (
                <View style={styles.freeShipBadge}>
                  <Ionicons name="checkmark-circle" size={13} color={shopColors.accent} />
                  <Text style={styles.freeShipText}>Free shipping on orders over $50</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}
        <View style={{ height: cartItems.length > 0 ? 120 : 40 }} />
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={[styles.checkoutBar, { paddingBottom: bottomPad, paddingHorizontal: contentPadding }]}>
          <View style={styles.checkoutTotal}>
            <Text style={styles.checkoutLabel}>Total</Text>
            <Text style={styles.checkoutPrice}>${total.toFixed(2)}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.checkoutBtn, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert("Checkout", "Checkout flow coming soon!");
            }}
          >
            <Text style={styles.checkoutBtnText}>Checkout</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: shopColors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 16 },
  itemCount: { fontSize: 14, color: shopColors.textSecondary, fontFamily: "Inter_500Medium", marginBottom: 12 },
  cartItem: {
    flexDirection: "row", backgroundColor: shopColors.surface,
    borderRadius: 14, padding: 12, marginBottom: 10,
  },
  itemImage: { width: 80, height: 80, borderRadius: 10, overflow: "hidden" },
  itemImg: { width: "100%", height: "100%" },
  imgPlaceholder: { backgroundColor: shopColors.background, alignItems: "center", justifyContent: "center" },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  itemTitle: { fontSize: 14, color: shopColors.text, fontFamily: "Inter_600SemiBold", lineHeight: 19 },
  itemMeta: { fontSize: 12, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 3 },
  itemPrice: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_700Bold", marginTop: 4 },
  qtyControls: { alignItems: "center", justifyContent: "center", gap: 6 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: shopColors.background, alignItems: "center", justifyContent: "center",
  },
  qtyText: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_600SemiBold", minWidth: 20, textAlign: "center" },
  promoRow: { flexDirection: "row", gap: 8, marginTop: 12, marginBottom: 4 },
  promoInput: {
    flex: 1, backgroundColor: shopColors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    fontFamily: "Inter_500Medium", color: shopColors.text,
    borderWidth: 1, borderColor: shopColors.border,
  },
  promoBtn: {
    backgroundColor: shopColors.primary, paddingHorizontal: 22, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  promoBtnDisabled: { opacity: 0.4 },
  promoBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  promoSuccess: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, marginBottom: 4 },
  promoSuccessText: { fontSize: 13, color: shopColors.accent, fontFamily: "Inter_500Medium" },
  summaryCard: {
    backgroundColor: shopColors.surface, borderRadius: 14, padding: 16, marginTop: 16,
  },
  summaryTitle: { fontSize: 16, color: shopColors.text, fontFamily: "Inter_700Bold", marginBottom: 14 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: shopColors.textSecondary, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 14, color: shopColors.text, fontFamily: "Inter_600SemiBold" },
  freeShipBadge: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
  freeShipText: { fontSize: 12, color: shopColors.accent, fontFamily: "Inter_500Medium" },
  totalRow: { borderTopWidth: 1, borderTopColor: shopColors.border, paddingTop: 14, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 16, color: shopColors.text, fontFamily: "Inter_700Bold" },
  totalValue: { fontSize: 20, color: shopColors.primary, fontFamily: "Inter_700Bold" },
  checkoutBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: shopColors.surface, paddingTop: 14,
    borderTopWidth: 0,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  checkoutTotal: {},
  checkoutLabel: { fontSize: 12, color: shopColors.textSecondary, fontFamily: "Inter_400Regular" },
  checkoutPrice: { fontSize: 22, color: shopColors.text, fontFamily: "Inter_700Bold" },
  checkoutBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: shopColors.primary, paddingHorizontal: 28, paddingVertical: 15, borderRadius: 14,
  },
  checkoutBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: `${shopColors.primary}08`,
    alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, color: shopColors.text, fontFamily: "Inter_700Bold", marginTop: 20 },
  emptyDesc: { fontSize: 14, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 6, textAlign: "center", lineHeight: 20 },
  shopBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 24, backgroundColor: shopColors.primary,
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 26,
  },
  shopBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
