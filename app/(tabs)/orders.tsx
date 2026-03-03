import { StyleSheet, Text, View, FlatList, ScrollView, Pressable, Platform, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors, { marketplace as marketplaceConfig, statusColors } from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import type { Order } from "@shared/schema";

const STATUS_FILTERS = ["all", "pending", "processing", "shipped", "fulfilled", "cancelled"];

function OrderCard({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (status: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const mpConfig = marketplaceConfig[order.marketplace as keyof typeof marketplaceConfig];

  const nextStatus: Record<string, string> = {
    pending: "processing",
    processing: "shipped",
    shipped: "fulfilled",
  };

  return (
    <Pressable style={styles.card} onPress={() => setExpanded(!expanded)}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.mpDot, { backgroundColor: mpConfig?.color || "#9CA3AF" }]} />
          <Text style={styles.orderId}>#{order.externalOrderId || order.id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (statusColors[order.status] || "#9CA3AF") + "20" }]}>
          <Text style={[styles.statusText, { color: statusColors[order.status] || "#9CA3AF" }]}>
            {order.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.productTitle} numberOfLines={1}>{order.productTitle}</Text>
        <View style={styles.orderDetails}>
          <Text style={styles.detailText}>{mpConfig?.label || order.marketplace}</Text>
          <Text style={styles.detailDivider}>·</Text>
          <Text style={styles.detailText}>Qty: {order.quantity}</Text>
          <Text style={styles.detailDivider}>·</Text>
          <Text style={styles.detailAmount}>${parseFloat(order.totalAmount).toFixed(2)}</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.expandedRow}>
            <Text style={styles.expandedLabel}>Customer</Text>
            <Text style={styles.expandedValue}>{order.customerName || "N/A"}</Text>
          </View>
          <View style={styles.expandedRow}>
            <Text style={styles.expandedLabel}>Date</Text>
            <Text style={styles.expandedValue}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {nextStatus[order.status] && (
            <Pressable
              style={styles.updateButton}
              onPress={() => onUpdateStatus(nextStatus[order.status])}
            >
              <Ionicons name="arrow-forward-circle" size={16} color="#fff" />
              <Text style={styles.updateButtonText}>
                Mark as {nextStatus[order.status]}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

export default function OrdersScreen() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const { data: orders = [], isLoading } = useQuery<Order[]>({ queryKey: ["/api/orders"] });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + parseFloat(o.totalAmount), 0);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: webTopInset }]}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.filter((o) => o.status === "pending").length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.light.primary }]}>${totalRevenue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <View style={styles.filterContainer}>
          {STATUS_FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onUpdateStatus={(status) => updateStatusMutation.mutate({ id: item.id, status })}
          />
        )}
        contentContainerStyle={styles.list}
        scrollEnabled={!!filteredOrders.length}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Colors.light.textTertiary} />
            <Text style={styles.emptyTitle}>No orders</Text>
            <Text style={styles.emptyText}>
              {filter === "all" ? "Orders will appear here when customers make purchases" : `No ${filter} orders`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.background },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.light.text },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 2 },
  filterRow: { marginTop: 12, marginBottom: 4 },
  filterContainer: { flexDirection: "row", paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.text },
  filterTextActive: { color: "#fff" },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  mpDot: { width: 8, height: 8, borderRadius: 4 },
  orderId: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.light.textSecondary },
  statusBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  cardBody: {},
  productTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  orderDetails: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  detailText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  detailDivider: { fontSize: 12, color: Colors.light.textTertiary },
  detailAmount: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.light.text },
  expandedSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.light.surfaceSecondary },
  expandedRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  expandedLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.textSecondary },
  expandedValue: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.text },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
  },
  updateButtonText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff", textTransform: "capitalize" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center" },
});
