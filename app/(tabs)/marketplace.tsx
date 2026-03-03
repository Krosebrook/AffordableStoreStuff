import { StyleSheet, Text, View, ScrollView, Pressable, Platform, ActivityIndicator } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors, { marketplace as marketplaceConfig, statusColors } from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import type { Product, MarketplaceListing } from "@shared/schema";

function MarketplaceCard({
  key: mpKey,
  config,
  listings,
  products,
  onPublish,
}: {
  key: string;
  config: { color: string; label: string };
  listings: MarketplaceListing[];
  products: Product[];
  onPublish: (productId: number) => void;
}) {
  const published = listings.filter((l) => l.status === "published").length;
  const draft = listings.filter((l) => l.status === "draft").length;
  const unlistedProducts = products.filter(
    (p) => !listings.some((l) => l.productId === p.id) && p.status === "active"
  );

  return (
    <View style={styles.mpCard}>
      <View style={styles.mpCardHeader}>
        <View style={[styles.mpDot, { backgroundColor: config.color }]} />
        <Text style={styles.mpName}>{config.label}</Text>
        <View style={styles.mpStats}>
          <Text style={styles.mpStatText}>{published} live</Text>
          <Text style={styles.mpStatDivider}>·</Text>
          <Text style={styles.mpStatText}>{draft} draft</Text>
        </View>
      </View>

      {listings.length > 0 ? (
        listings.map((listing) => {
          const product = products.find((p) => p.id === listing.productId);
          return (
            <View key={listing.id} style={styles.listingRow}>
              <Text style={styles.listingTitle} numberOfLines={1}>
                {listing.customTitle || product?.title || "Unknown"}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: (statusColors[listing.status] || "#9CA3AF") + "20" }]}>
                <Text style={[styles.statusText, { color: statusColors[listing.status] || "#9CA3AF" }]}>
                  {listing.status}
                </Text>
              </View>
            </View>
          );
        })
      ) : (
        <Text style={styles.noListings}>No listings yet</Text>
      )}

      {unlistedProducts.length > 0 && (
        <View style={styles.unlistedSection}>
          <Text style={styles.unlistedLabel}>Ready to publish ({unlistedProducts.length})</Text>
          {unlistedProducts.slice(0, 3).map((p) => (
            <Pressable key={p.id} style={styles.publishRow} onPress={() => onPublish(p.id)}>
              <Text style={styles.publishTitle} numberOfLines={1}>{p.title}</Text>
              <Ionicons name="cloud-upload-outline" size={16} color={Colors.light.primary} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function MarketplaceScreen() {
  const queryClient = useQueryClient();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: listings = [], isLoading: loadingListings } = useQuery<MarketplaceListing[]>({ queryKey: ["/api/listings"] });

  const publishMutation = useMutation({
    mutationFn: async ({ productId, marketplace }: { productId: number; marketplace: string }) => {
      await apiRequest("POST", "/api/listings", {
        productId,
        marketplace,
        status: "draft",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
  });

  if (loadingProducts || loadingListings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  const totalPublished = listings.filter((l) => l.status === "published").length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: webTopInset }]}>
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalPublished}</Text>
          <Text style={styles.summaryLabel}>Published</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{listings.length}</Text>
          <Text style={styles.summaryLabel}>Total Listings</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{Object.keys(marketplaceConfig).length}</Text>
          <Text style={styles.summaryLabel}>Platforms</Text>
        </View>
      </View>

      {Object.entries(marketplaceConfig).map(([key, config]) => {
        const mpListings = listings.filter((l) => l.marketplace === key);
        return (
          <MarketplaceCard
            key={key}
            config={config}
            listings={mpListings}
            products={products}
            onPublish={(productId) => publishMutation.mutate({ productId, marketplace: key })}
          />
        );
      })}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.background },
  summaryBar: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: "space-around",
  },
  summaryItem: { alignItems: "center" },
  summaryValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 2 },
  mpCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  mpCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  mpDot: { width: 10, height: 10, borderRadius: 5 },
  mpName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text, flex: 1 },
  mpStats: { flexDirection: "row", gap: 4 },
  mpStatText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  mpStatDivider: { fontSize: 11, color: Colors.light.textTertiary },
  listingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.surfaceSecondary,
  },
  listingTitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.text, flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  noListings: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textTertiary, paddingVertical: 8 },
  unlistedSection: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.light.surfaceSecondary },
  unlistedLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.light.primary, marginBottom: 6 },
  publishRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  publishTitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.text, flex: 1, marginRight: 8 },
});
