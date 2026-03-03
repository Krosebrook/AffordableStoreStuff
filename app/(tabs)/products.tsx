import { StyleSheet, Text, View, FlatList, Pressable, Platform, ActivityIndicator, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors, { statusColors } from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import type { Product } from "@shared/schema";

function ProductCard({ product, onPress, onDelete }: { product: Product; onPress: () => void; onDelete: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardLeft}>
        <View style={[styles.productThumb, { backgroundColor: Colors.light.primaryLight + "20" }]}>
          <Ionicons name="bag-handle" size={24} color={Colors.light.primary} />
        </View>
      </View>
      <View style={styles.cardCenter}>
        <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
        <Text style={styles.productMeta}>
          SKU: {product.sku || "N/A"} · Stock: {product.inventoryCount}
        </Text>
        <View style={styles.cardTags}>
          <View style={[styles.statusBadge, { backgroundColor: (statusColors[product.status] || "#9CA3AF") + "20" }]}>
            <Text style={[styles.statusText, { color: statusColors[product.status] || "#9CA3AF" }]}>
              {product.status}
            </Text>
          </View>
          {product.category ? (
            <Text style={styles.categoryText}>{product.category}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.priceText}>${parseFloat(product.price).toFixed(2)}</Text>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={Colors.light.danger} />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function ProductsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const { data: products = [], isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const handleDelete = (product: Product) => {
    if (Platform.OS === "web") {
      if (confirm(`Delete "${product.title}"?`)) {
        deleteMutation.mutate(product.id);
      }
    } else {
      Alert.alert("Delete Product", `Delete "${product.title}"?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(product.id) },
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
    <View style={[styles.container, { paddingTop: webTopInset }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{products.length} Products</Text>
          <Text style={styles.headerSub}>
            {products.filter((p) => p.status === "active").length} active
          </Text>
        </View>
        <Pressable style={styles.addButton} onPress={() => router.push("/product/create")}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/product/${item.id}`)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.list}
        scrollEnabled={!!products.length}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={48} color={Colors.light.textTertiary} />
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyText}>Tap the Add button to create your first product</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.light.text },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  addButtonText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  cardLeft: { marginRight: 12 },
  productThumb: { width: 48, height: 48, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  cardCenter: { flex: 1 },
  productTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  productMeta: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 2 },
  cardTags: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  statusBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  categoryText: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  cardRight: { alignItems: "flex-end", gap: 8 },
  priceText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.light.text },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center" },
});
