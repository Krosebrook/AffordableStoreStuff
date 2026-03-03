import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import type { ContentLibraryItem } from "@shared/schema";

const FILTERS = ["all", "product_copy", "marketing_copy"];

function ContentCard({
  item,
  onToggleFavorite,
  onDelete,
}: {
  item: ContentLibraryItem;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable style={styles.card} onPress={() => setExpanded(!expanded)}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeIcon, { backgroundColor: item.type === "product_copy" ? Colors.light.primary + "15" : Colors.light.accent + "15" }]}>
          <Ionicons
            name={item.type === "product_copy" ? "bag-handle" : "megaphone"}
            size={16}
            color={item.type === "product_copy" ? Colors.light.primary : Colors.light.accent}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardMeta}>
            {item.type === "product_copy" ? "Product Copy" : "Marketing Copy"}
            {item.platform ? ` · ${item.platform}` : ""}
          </Text>
        </View>
        <Pressable onPress={onToggleFavorite} hitSlop={8}>
          <Ionicons name={item.isFavorite ? "heart" : "heart-outline"} size={20} color={item.isFavorite ? Colors.light.danger : Colors.light.textTertiary} />
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={Colors.light.danger} />
        </Pressable>
      </View>
      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.contentText} selectable>{item.content}</Text>
          <Text style={styles.dateText}>
            Saved {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function ContentLibraryScreen() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: content = [], isLoading } = useQuery<ContentLibraryItem[]>({ queryKey: ["/api/content"] });

  const favoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/content/${id}/favorite`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/content"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/content/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/content"] }),
  });

  const handleDelete = (item: ContentLibraryItem) => {
    if (Platform.OS === "web") {
      if (confirm(`Delete "${item.title}"?`)) deleteMutation.mutate(item.id);
    } else {
      Alert.alert("Delete", `Delete "${item.title}"?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(item.id) },
      ]);
    }
  };

  const filtered = filter === "all" ? content : content.filter((c) => c.type === filter);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "All" : f === "product_copy" ? "Products" : "Marketing"}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ContentCard
            item={item}
            onToggleFavorite={() => favoriteMutation.mutate(item.id)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.list}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={48} color={Colors.light.textTertiary} />
            <Text style={styles.emptyTitle}>No saved content</Text>
            <Text style={styles.emptyText}>Content you save from AI Studio will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.background },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border },
  filterChipActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.text },
  filterTextActive: { color: "#fff" },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: Colors.light.surface, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  typeIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  cardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  cardMeta: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  expandedContent: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.light.surfaceSecondary },
  contentText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 20 },
  dateText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textTertiary, marginTop: 8 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center" },
});
