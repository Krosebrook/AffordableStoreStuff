import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const ROLE_COLORS: Record<string, string> = {
  owner: "#8B5CF6",
  admin: "#3B82F6",
  editor: "#10B981",
  viewer: "#6B7280",
};

export default function TeamsScreen() {
  const { data: teams, isLoading } = useQuery({ queryKey: ["/api/teams"] });

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
        <Ionicons name="people-outline" size={28} color={Colors.light.tint} />
        <Text style={styles.title}>Teams</Text>
        <Pressable style={styles.addButton}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={teams || []}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <View style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <View style={styles.teamIcon}>
                <Ionicons name="people" size={24} color={Colors.light.tint} />
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{item.name}</Text>
                <Text style={styles.teamPlan}>{item.plan || "Free"} plan</Text>
              </View>
            </View>
            <View style={styles.membersSection}>
              <Text style={styles.membersTitle}>Members</Text>
              {(item.members || []).map((member: any, i: number) => (
                <View key={i} style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>{(member.name || member.email || "?")[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name || member.email}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLORS[member.role] || "#6B7280") + "20" }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLORS[member.role] || "#6B7280" }]}>{member.role}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Pressable style={styles.inviteButton}>
              <Ionicons name="person-add-outline" size={16} color={Colors.light.tint} />
              <Text style={styles.inviteText}>Invite Member</Text>
            </Pressable>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No teams yet</Text>
            <Text style={styles.emptySubtitle}>Create a team to collaborate</Text>
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
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text, flex: 1 },
  addButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.light.tint,
    justifyContent: "center", alignItems: "center",
  },
  listContent: { padding: 20, gap: 16 },
  teamCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  teamHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  teamIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.light.tint + "15",
    justifyContent: "center", alignItems: "center",
  },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  teamPlan: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular", textTransform: "capitalize" },
  membersSection: { borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 12 },
  membersTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#6B7280", marginBottom: 8 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  memberAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#E5E7EB",
    justifyContent: "center", alignItems: "center",
  },
  memberInitial: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#374151" },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.light.text },
  memberEmail: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  roleText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  inviteButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 12, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.light.tint, borderStyle: "dashed",
  },
  inviteText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.light.tint },
  emptyState: { alignItems: "center", paddingTop: 80 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: "#374151", marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginTop: 4 },
});
