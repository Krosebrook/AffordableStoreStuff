import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  processing: "#3B82F6",
  published: "#10B981",
  failed: "#EF4444",
  rejected: "#6B7280",
};

export default function PublishingQueueScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: items, isLoading } = useQuery({ queryKey: ["/api/publishing-queue"] });
  const { data: stats } = useQuery({ queryKey: ["/api/publishing-queue/stats"] });

  const retryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/publishing-queue/${id}/status`, { status: "pending" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/publishing-queue"] }),
  });

  const filtered = filter === "all" ? (items || []) : (items || []).filter((i: any) => i.status === filter);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="layers-outline" size={28} color={Colors.light.tint} />
        <Text style={styles.title}>Publishing Queue</Text>
      </View>

      {stats && (
        <View style={styles.statsRow}>
          {[
            { label: "Pending", value: stats.pending || 0, color: "#F59E0B" },
            { label: "Processing", value: stats.processing || 0, color: "#3B82F6" },
            { label: "Published", value: stats.published || 0, color: "#10B981" },
            { label: "Failed", value: stats.failed || 0, color: "#EF4444" },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.filters}>
        {["all", "pending", "processing", "published", "failed"].map((f) => (
          <Pressable key={f} style={[styles.filterChip, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <View style={styles.queueCard}>
            <View style={styles.queueHeader}>
              <Text style={styles.platformText}>{item.platform}</Text>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || "#6B7280") + "20" }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || "#6B7280" }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.productId}>Product #{item.productId}</Text>
            {item.scheduledFor && (
              <Text style={styles.scheduledText}>
                Scheduled: {new Date(item.scheduledFor).toLocaleString()}
              </Text>
            )}
            {item.errorMessage && (
              <Text style={styles.errorText} numberOfLines={2}>{item.errorMessage}</Text>
            )}
            <View style={styles.cardFooter}>
              <Text style={styles.priorityText}>Priority: {item.priority || 5}</Text>
              {item.status === "failed" && (
                <Pressable style={styles.retryButton} onPress={() => retryMutation.mutate(item.id)}>
                  <Ionicons name="refresh" size={14} color="#fff" />
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              )}
              {item.externalUrl && (
                <Pressable style={styles.viewButton}>
                  <Ionicons name="open-outline" size={14} color={Colors.light.tint} />
                  <Text style={styles.viewText}>View</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="layers-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Queue is empty</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 10, padding: 20, paddingBottom: 10 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text },
  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 8, marginBottom: 10 },
  statItem: {
    flex: 1, alignItems: "center", padding: 10, backgroundColor: "#fff",
    borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB",
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, color: "#6B7280", fontFamily: "Inter_400Regular" },
  filters: { flexDirection: "row", paddingHorizontal: 20, gap: 6, marginBottom: 10 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: "#F3F4F6" },
  filterActive: { backgroundColor: Colors.light.tint },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#6B7280", textTransform: "capitalize" },
  filterTextActive: { color: "#fff" },
  listContent: { padding: 20, gap: 10 },
  queueCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  queueHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  platformText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text, textTransform: "capitalize" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  productId: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular", marginTop: 4 },
  scheduledText: { fontSize: 12, color: "#3B82F6", fontFamily: "Inter_400Regular", marginTop: 4 },
  errorText: { fontSize: 12, color: "#EF4444", fontFamily: "Inter_400Regular", marginTop: 4 },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  priorityText: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular", flex: 1 },
  retryButton: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: "#F59E0B",
  },
  retryText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#fff" },
  viewButton: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: Colors.light.tint,
  },
  viewText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.tint },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 15, color: "#9CA3AF", fontFamily: "Inter_500Medium", marginTop: 12 },
});
