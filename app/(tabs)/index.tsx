import { StyleSheet, Text, View, ScrollView, Pressable, Platform, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors, { marketplace, statusColors } from "@/constants/colors";
import type { Product, Order, MarketplaceListing } from "@shared/schema";

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress, color }: { icon: string; label: string; onPress: () => void; color: string }) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: orders = [], isLoading: loadingOrders } = useQuery<Order[]>({ queryKey: ["/api/orders"] });
  const { data: listings = [] } = useQuery<MarketplaceListing[]>({ queryKey: ["/api/listings"] });
  const { data: aiUsage } = useQuery<{ totalGenerations: number; totalTokens: number }>({ queryKey: ["/api/ai/usage"] });

  const activeProducts = products.filter((p) => p.status === "active").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
  const publishedListings = listings.filter((l) => l.status === "published").length;

  if (loadingProducts || loadingOrders) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: webTopInset }]}>
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Welcome back</Text>
        <Text style={styles.greetingSubtext}>Here's your store overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="bag-handle" label="Products" value={activeProducts} color={Colors.light.primary} />
        <StatCard icon="receipt" label="Pending Orders" value={pendingOrders} color={Colors.light.warning} />
        <StatCard icon="cash" label="Revenue" value={`$${totalRevenue.toFixed(2)}`} color={Colors.light.success} />
        <StatCard icon="sparkles" label="AI Credits" value={aiUsage?.totalGenerations || 0} color={Colors.light.accent} />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <QuickAction icon="add-circle" label="New Product" onPress={() => router.push("/product/create")} color={Colors.light.primary} />
        <QuickAction icon="sparkles" label="AI Studio" onPress={() => router.push("/(tabs)/ai-studio")} color={Colors.light.accent} />
        <QuickAction icon="megaphone" label="Brand Voice" onPress={() => router.push("/brand-profiles")} color={Colors.light.warning} />
        <QuickAction icon="library" label="Content" onPress={() => router.push("/content-library")} color={Colors.light.info} />
      </View>

      <Text style={styles.sectionTitle}>Marketplace Status</Text>
      <View style={styles.marketplaceRow}>
        {Object.entries(marketplace).map(([key, mp]) => {
          const count = listings.filter((l) => l.marketplace === key && l.status === "published").length;
          return (
            <View key={key} style={styles.marketplaceChip}>
              <View style={[styles.marketplaceDot, { backgroundColor: mp.color }]} />
              <Text style={styles.marketplaceLabel}>{mp.label}</Text>
              <Text style={styles.marketplaceCount}>{count}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Recent Orders</Text>
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={32} color={Colors.light.textTertiary} />
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : (
        orders.slice(0, 5).map((order) => (
          <View key={order.id} style={styles.orderRow}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle} numberOfLines={1}>{order.productTitle}</Text>
              <Text style={styles.orderMeta}>
                {order.marketplace} · {order.customerName || "Customer"}
              </Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderAmount}>${parseFloat(order.totalAmount).toFixed(2)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: (statusColors[order.status] || "#9CA3AF") + "20" }]}>
                <Text style={[styles.statusText, { color: statusColors[order.status] || "#9CA3AF" }]}>
                  {order.status}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.background },
  greeting: { marginBottom: 20 },
  greetingText: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.light.text },
  greetingSubtext: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
  },
  statHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.textSecondary },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginBottom: 12 },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  quickAction: { flex: 1, minWidth: "20%", alignItems: "center", gap: 6 },
  quickActionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  quickActionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.light.textSecondary, textAlign: "center" },
  marketplaceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  marketplaceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  marketplaceDot: { width: 8, height: 8, borderRadius: 4 },
  marketplaceLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.text },
  marketplaceCount: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.light.primary },
  emptyState: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textTertiary },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  orderInfo: { flex: 1, marginRight: 12 },
  orderTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  orderMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 2 },
  orderRight: { alignItems: "flex-end", gap: 4 },
  orderAmount: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.light.text },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
});
