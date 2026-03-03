import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors, { marketplace as marketplaceConfig, statusColors } from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import type { Product, MarketplaceListing } from "@shared/schema";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery<Product>({ queryKey: [`/api/products/${id}`] });
  const { data: listings = [] } = useQuery<MarketplaceListing[]>({ queryKey: [`/api/products/${id}/listings`] });

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [inventory, setInventory] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setPrice(product.price);
      setInventory(String(product.inventoryCount));
      setStatus(product.status);
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/products/${id}`, {
        title,
        description,
        price,
        inventoryCount: parseInt(inventory) || 0,
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditing(false);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (marketplace: string) => {
      const res = await apiRequest("POST", "/api/listings", {
        productId: parseInt(id as string),
        marketplace,
        status: "draft",
      });
      return res.json();
    },
    onSuccess: (listing: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}/listings`] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      router.push({
        pathname: "/product/publish",
        params: { productId: id as string, marketplace: listing.marketplace, listingId: String(listing.id) },
      });
    },
  });

  if (isLoading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  const listedMarketplaces = new Set(listings.map((l) => l.marketplace));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: (statusColors[product.status] || "#9CA3AF") + "20" }]}>
          <Text style={[styles.statusText, { color: statusColors[product.status] || "#9CA3AF" }]}>
            {product.status}
          </Text>
        </View>
        <Pressable onPress={() => setEditing(!editing)}>
          <Ionicons name={editing ? "close" : "create-outline"} size={22} color={Colors.light.primary} />
        </Pressable>
      </View>

      {editing ? (
        <>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Price ($)</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Inventory</Text>
              <TextInput style={styles.input} value={inventory} onChangeText={setInventory} keyboardType="number-pad" />
            </View>
          </View>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusSelector}>
            {["draft", "active", "archived"].map((s) => (
              <Pressable key={s} style={[styles.statusOption, status === s && styles.statusOptionActive]} onPress={() => setStatus(s)}>
                <Text style={[styles.statusOptionText, status === s && styles.statusOptionTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.saveButton} onPress={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>${parseFloat(product.price).toFixed(2)}</Text>
          <Text style={styles.productDesc}>{product.description || "No description"}</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>SKU</Text>
              <Text style={styles.infoValue}>{product.sku || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{product.category || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Stock</Text>
              <Text style={styles.infoValue}>{product.inventoryCount}</Text>
            </View>
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Marketplace Listings</Text>
      {listings.length > 0 ? (
        listings.map((listing) => {
          const mp = marketplaceConfig[listing.marketplace as keyof typeof marketplaceConfig];
          const canOpen = listing.status !== "published";
          return (
            <Pressable
              key={listing.id}
              style={styles.listingCard}
              onPress={() => {
                if (canOpen) {
                  router.push({
                    pathname: "/product/publish",
                    params: { productId: id as string, marketplace: listing.marketplace, listingId: String(listing.id) },
                  });
                }
              }}
            >
              <View style={[styles.mpDot, { backgroundColor: mp?.color || "#9CA3AF" }]} />
              <Text style={styles.listingMp}>{mp?.label || listing.marketplace}</Text>
              <View style={[styles.listingStatus, { backgroundColor: (statusColors[listing.status] || "#9CA3AF") + "20" }]}>
                <Text style={[styles.listingStatusText, { color: statusColors[listing.status] || "#9CA3AF" }]}>{listing.status}</Text>
              </View>
              {canOpen && <Ionicons name="chevron-forward" size={16} color={Colors.light.textTertiary} />}
            </Pressable>
          );
        })
      ) : (
        <Text style={styles.noListings}>Not listed on any marketplace yet</Text>
      )}

      <Text style={styles.publishLabel}>Publish to:</Text>
      <View style={styles.publishGrid}>
        {Object.entries(marketplaceConfig)
          .filter(([key]) => !listedMarketplaces.has(key))
          .map(([key, config]) => (
            <Pressable key={key} style={styles.publishChip} onPress={() => publishMutation.mutate(key)}>
              <View style={[styles.mpDotSmall, { backgroundColor: config.color }]} />
              <Text style={styles.publishChipText}>{config.label}</Text>
            </Pressable>
          ))}
      </View>

      {product.tags && (product.tags as string[]).length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsRow}>
            {(product.tags as string[]).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.background },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  productTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text, marginBottom: 4 },
  productPrice: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.light.primary, marginBottom: 12 },
  productDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 20, marginBottom: 16 },
  infoRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
  infoItem: { flex: 1, backgroundColor: Colors.light.surface, borderRadius: 10, padding: 12 },
  infoLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.light.textSecondary },
  infoValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginTop: 2 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.light.surface, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.text, borderWidth: 1, borderColor: Colors.light.border },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },
  statusSelector: { flexDirection: "row", gap: 8 },
  statusOption: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border },
  statusOptionActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  statusOptionText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.text, textTransform: "capitalize" },
  statusOptionTextActive: { color: "#fff" },
  saveButton: { backgroundColor: Colors.light.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  saveButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginTop: 24, marginBottom: 10 },
  listingCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.light.surface, borderRadius: 10, padding: 12, marginBottom: 8 },
  mpDot: { width: 10, height: 10, borderRadius: 5 },
  listingMp: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.light.text },
  listingStatus: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  listingStatusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  noListings: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textTertiary, marginBottom: 12 },
  publishLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginTop: 12, marginBottom: 8 },
  publishGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  publishChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.light.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: Colors.light.border },
  mpDotSmall: { width: 8, height: 8, borderRadius: 4 },
  publishChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.text },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { backgroundColor: Colors.light.surfaceSecondary, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
});
