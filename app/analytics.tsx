import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { data: products } = useQuery({ queryKey: ["/api/products"] });
  const { data: orders } = useQuery({ queryKey: ["/api/orders"] });
  const { data: listings } = useQuery({ queryKey: ["/api/listings"] });
  const { data: aiUsage } = useQuery({ queryKey: ["/api/ai/usage"] });

  const totalRevenue = (orders || []).reduce(
    (sum: number, o: any) => sum + parseFloat(o.totalAmount || "0"), 0
  );
  const activeListings = (listings || []).filter((l: any) => l.status === "published").length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="bar-chart-outline" size={28} color={Colors.light.tint} />
        <Text style={styles.title}>Analytics</Text>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="cube-outline" label="Products" value={(products || []).length} color="#3B82F6" />
        <StatCard icon="receipt-outline" label="Orders" value={(orders || []).length} color="#10B981" />
        <StatCard icon="cash-outline" label="Revenue" value={`$${totalRevenue.toFixed(2)}`} color="#8B5CF6" />
        <StatCard icon="globe-outline" label="Active Listings" value={activeListings} color="#F59E0B" />
      </View>

      <Text style={styles.sectionTitle}>AI Usage</Text>
      <View style={styles.aiCard}>
        <View style={styles.aiRow}>
          <Text style={styles.aiLabel}>Credits Used</Text>
          <Text style={styles.aiValue}>{aiUsage?.totalGenerations || 0}</Text>
        </View>
        <View style={styles.aiRow}>
          <Text style={styles.aiLabel}>Tokens Consumed</Text>
          <Text style={styles.aiValue}>{(aiUsage?.totalTokens || 0).toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Order Status Breakdown</Text>
      <View style={styles.breakdownCard}>
        {["pending", "processing", "shipped", "fulfilled", "cancelled"].map((status) => {
          const count = (orders || []).filter((o: any) => o.status === status).length;
          return (
            <View key={status} style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.dot, { backgroundColor: status === "fulfilled" ? "#10B981" : status === "cancelled" ? "#EF4444" : "#F59E0B" }]} />
                <Text style={styles.breakdownLabel}>{status}</Text>
              </View>
              <Text style={styles.breakdownValue}>{count}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginTop: 20, marginBottom: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "47%", padding: 16, backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  statIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text },
  statLabel: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_400Regular", marginTop: 2 },
  aiCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  aiRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  aiLabel: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_400Regular" },
  aiValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  breakdownCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  breakdownLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontSize: 14, color: "#374151", fontFamily: "Inter_500Medium", textTransform: "capitalize" },
  breakdownValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
});
