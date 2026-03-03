import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const PLAN_ICONS: Record<string, string> = {
  free: "sparkles-outline",
  starter: "rocket-outline",
  pro: "diamond-outline",
  enterprise: "business-outline",
};

export default function BillingScreen() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/billing/plans"],
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["/api/billing/subscription"],
  });

  if (plansLoading || subLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  const currentPlan = subscription?.planId;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="card-outline" size={28} color={Colors.light.tint} />
        <Text style={styles.title}>Subscription & Billing</Text>
      </View>

      {subscription && (
        <View style={styles.currentPlanCard}>
          <Text style={styles.currentPlanLabel}>Current Plan</Text>
          <Text style={styles.currentPlanName}>{subscription.planName || "Free"}</Text>
          <View style={[styles.statusBadge, { backgroundColor: subscription.status === "active" ? "#10B98120" : "#EF444420" }]}>
            <Text style={[styles.statusText, { color: subscription.status === "active" ? "#10B981" : "#EF4444" }]}>
              {subscription.status}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Available Plans</Text>

      <FlatList
        data={plans || []}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === item.id && styles.planCardSelected,
              currentPlan === item.id && styles.planCardCurrent,
            ]}
            onPress={() => setSelectedPlan(item.id)}
          >
            <View style={styles.planHeader}>
              <Ionicons
                name={(PLAN_ICONS[item.name?.toLowerCase()] || "star-outline") as any}
                size={24}
                color={selectedPlan === item.id ? Colors.light.tint : "#6B7280"}
              />
              <Text style={styles.planName}>{item.name}</Text>
              {currentPlan === item.id && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </View>
            <Text style={styles.planPrice}>
              ${parseFloat(item.price || "0").toFixed(2)}
              <Text style={styles.planInterval}>/{item.interval || "month"}</Text>
            </Text>
            <View style={styles.planFeatures}>
              {item.productLimit && (
                <Text style={styles.featureText}>Up to {item.productLimit} products</Text>
              )}
              {item.aiCreditsLimit && (
                <Text style={styles.featureText}>{item.aiCreditsLimit} AI credits/month</Text>
              )}
              {item.teamMembersLimit && (
                <Text style={styles.featureText}>{item.teamMembersLimit} team members</Text>
              )}
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
      />

      {selectedPlan && selectedPlan !== currentPlan && (
        <Pressable style={styles.upgradeButton}>
          <Ionicons name="arrow-up-circle" size={20} color="#fff" />
          <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 10, padding: 20, paddingBottom: 10 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text },
  currentPlanCard: {
    margin: 20, marginTop: 10, padding: 16, backgroundColor: "#F0FDF4",
    borderRadius: 12, borderWidth: 1, borderColor: "#10B98130",
  },
  currentPlanLabel: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_500Medium" },
  currentPlanName: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.light.text, marginTop: 4 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text, paddingHorizontal: 20, marginTop: 10 },
  listContent: { padding: 20, gap: 12 },
  planCard: {
    padding: 16, backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  planCardSelected: { borderColor: Colors.light.tint, borderWidth: 2 },
  planCardCurrent: { backgroundColor: "#F0FDF4" },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  planName: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.light.text, flex: 1 },
  currentBadge: { backgroundColor: "#10B98120", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  currentBadgeText: { fontSize: 11, color: "#10B981", fontFamily: "Inter_600SemiBold" },
  planPrice: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.light.text, marginTop: 10 },
  planInterval: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#6B7280" },
  planFeatures: { marginTop: 12, gap: 6 },
  featureText: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular" },
  upgradeButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    margin: 20, padding: 16, backgroundColor: Colors.light.tint,
    borderRadius: 12,
  },
  upgradeButtonText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
