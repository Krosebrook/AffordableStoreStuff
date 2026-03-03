import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const PLATFORM_CONFIG: Record<string, { icon: string; color: string }> = {
  instagram: { icon: "logo-instagram", color: "#E4405F" },
  tiktok: { icon: "musical-notes", color: "#000000" },
  youtube: { icon: "logo-youtube", color: "#FF0000" },
  linkedin: { icon: "logo-linkedin", color: "#0A66C2" },
  pinterest: { icon: "aperture", color: "#BD081C" },
};

const STATUS_TABS = ["all", "draft", "scheduled", "published"];

export default function SocialMediaScreen() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: content, isLoading } = useQuery({ queryKey: ["/api/social/content"] });
  const { data: analytics } = useQuery({ queryKey: ["/api/social/analytics"] });

  const filtered = activeTab === "all" ? (content || []) : (content || []).filter((c: any) => c.status === activeTab);

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
        <Ionicons name="share-social-outline" size={28} color={Colors.light.tint} />
        <Text style={styles.title}>Social Media</Text>
      </View>

      {analytics && (analytics as any[]).length > 0 && (
        <View style={styles.analyticsRow}>
          {(analytics as any[]).slice(0, 3).map((a: any, i: number) => {
            const config = PLATFORM_CONFIG[a.platform] || { icon: "globe", color: "#6B7280" };
            return (
              <View key={i} style={styles.analyticCard}>
                <Ionicons name={config.icon as any} size={20} color={config.color} />
                <Text style={styles.analyticValue}>{a.followerCount?.toLocaleString() || 0}</Text>
                <Text style={styles.analyticLabel}>{a.platform}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <View style={styles.contentCard}>
            <View style={styles.contentHeader}>
              <Text style={styles.contentTitle} numberOfLines={1}>{item.title}</Text>
              <View style={[styles.statusDot, { backgroundColor: item.status === "published" ? "#10B981" : item.status === "scheduled" ? "#F59E0B" : "#9CA3AF" }]} />
            </View>
            <Text style={styles.contentCaption} numberOfLines={2}>{item.caption}</Text>
            <View style={styles.contentFooter}>
              <View style={styles.platformIcons}>
                {(item.platforms || []).map((p: string, i: number) => {
                  const config = PLATFORM_CONFIG[p];
                  return config ? <Ionicons key={i} name={config.icon as any} size={16} color={config.color} /> : null;
                })}
              </View>
              <Text style={styles.dateText}>
                {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="create-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No content yet</Text>
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
  analyticsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 10 },
  analyticCard: {
    flex: 1, alignItems: "center", padding: 12, backgroundColor: "#fff",
    borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB",
  },
  analyticValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.light.text, marginTop: 4 },
  analyticLabel: { fontSize: 11, color: "#6B7280", fontFamily: "Inter_400Regular", textTransform: "capitalize" },
  tabs: { flexDirection: "row", paddingHorizontal: 20, gap: 8, marginBottom: 10 },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: "#F3F4F6" },
  tabActive: { backgroundColor: Colors.light.tint },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#6B7280", textTransform: "capitalize" },
  tabTextActive: { color: "#fff" },
  listContent: { padding: 20, gap: 12 },
  contentCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  contentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  contentTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text, flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  contentCaption: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular", marginTop: 6 },
  contentFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  platformIcons: { flexDirection: "row", gap: 8 },
  dateText: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 15, color: "#9CA3AF", fontFamily: "Inter_500Medium", marginTop: 12 },
});
