import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { shopColors } from "@/constants/colors";
import { useResponsive } from "@/lib/useResponsive";
import { apiRequest } from "@/lib/query-client";

const CATEGORIES = [
  { id: "all", label: "All", icon: "grid-outline" as const },
  { id: "tops", label: "Tops", icon: "shirt-outline" as const },
  { id: "bottoms", label: "Bottoms", icon: "man-outline" as const },
  { id: "dresses", label: "Dresses", icon: "woman-outline" as const },
  { id: "outerwear", label: "Outerwear", icon: "snow-outline" as const },
  { id: "shoes", label: "Shoes", icon: "footsteps-outline" as const },
  { id: "accessories", label: "Accessories", icon: "watch-outline" as const },
];

const SORT_OPTIONS = ["Recently Added", "Most Worn", "Color"];

interface WardrobeItem {
  id: number;
  name: string;
  category: string;
  color?: string;
  imageUrl?: string;
  tags: string[];
  wearCount: number;
  lastWorn?: string;
}

function AddItemModal({ onAdd, onClose }: { onAdd: (item: any) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("tops");
  const [color, setColor] = useState("");

  return (
    <View style={addStyles.overlay}>
      <Pressable style={addStyles.backdrop} onPress={onClose} />
      <View style={addStyles.sheet}>
        <View style={addStyles.handle} />
        <Text style={addStyles.sheetTitle}>Add to Wardrobe</Text>

        <Text style={addStyles.label}>Item Name</Text>
        <TextInput
          style={addStyles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Blue Denim Jacket"
          placeholderTextColor={shopColors.textTertiary}
        />

        <Text style={addStyles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={addStyles.catScroll}>
          {CATEGORIES.filter(c => c.id !== "all").map(cat => (
            <Pressable
              key={cat.id}
              style={[addStyles.catPill, category === cat.id && addStyles.catPillActive]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={[addStyles.catPillText, category === cat.id && addStyles.catPillTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={addStyles.label}>Color (optional)</Text>
        <TextInput
          style={addStyles.input}
          value={color}
          onChangeText={setColor}
          placeholder="e.g. Navy Blue"
          placeholderTextColor={shopColors.textTertiary}
        />

        <Pressable
          style={[addStyles.addBtn, !name.trim() && { opacity: 0.5 }]}
          disabled={!name.trim()}
          onPress={() => {
            onAdd({ name: name.trim(), category, color: color.trim() || undefined, tags: [] });
          }}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={addStyles.addBtnText}>Add Item</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function WardrobeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { contentPadding, insets, width } = useResponsive();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState(0);

  const numColumns = width > 500 ? 3 : 2;
  const gap = 12;
  const itemWidth = (Math.min(width, 600) - contentPadding * 2 - gap * (numColumns - 1)) / numColumns;

  const { data: items = [], isLoading } = useQuery<WardrobeItem[]>({
    queryKey: ["/api/shop/wardrobe"],
  });

  const addMutation = useMutation({
    mutationFn: (item: any) => apiRequest("/api/shop/wardrobe", { method: "POST", body: JSON.stringify(item) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/wardrobe"] });
      setShowAddModal(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/shop/wardrobe/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/shop/wardrobe"] }),
  });

  const filtered = items.filter(item => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 1) return b.wearCount - a.wearCount;
    if (sortBy === 2) return (a.color || "").localeCompare(b.color || "");
    return b.id - a.id;
  });

  const categoryCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: cat.id === "all" ? items.length : items.filter(i => i.category === cat.id).length,
  }));

  const handleRemove = (item: WardrobeItem) => {
    if (Platform.OS === "web") {
      if (confirm(`Remove "${item.name}" from wardrobe?`)) removeMutation.mutate(item.id);
    } else {
      Alert.alert("Remove Item", `Remove "${item.name}" from your wardrobe?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => removeMutation.mutate(item.id) },
      ]);
    }
  };

  const renderItem = ({ item }: { item: WardrobeItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.itemCard,
        { width: itemWidth, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <View style={styles.itemImageWrap}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.itemImage, styles.itemPlaceholder]}>
            <Ionicons
              name={CATEGORIES.find(c => c.id === item.category)?.icon || "shirt-outline"}
              size={32}
              color={shopColors.textTertiary}
            />
          </View>
        )}
        {item.color && (
          <View style={styles.colorDot}>
            <View style={[styles.colorInner, { backgroundColor: getColorHex(item.color) }]} />
          </View>
        )}
        <Pressable
          style={styles.removeBtn}
          hitSlop={10}
          onPress={(e) => {
            e.stopPropagation?.();
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleRemove(item);
          }}
        >
          <Ionicons name="close-circle" size={22} color="rgba(0,0,0,0.5)" />
        </Pressable>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.itemMeta}>
          <Ionicons name="repeat-outline" size={12} color={shopColors.textTertiary} />
          <Text style={styles.itemMetaText}>Worn {item.wearCount}x</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "My Wardrobe",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: shopColors.surface },
          headerTitleStyle: { fontFamily: "Inter_600SemiBold", color: shopColors.text },
          headerRight: () => (
            <Pressable
              hitSlop={10}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAddModal(true);
              }}
              style={{ marginRight: 8 }}
            >
              <Ionicons name="add-circle" size={28} color={shopColors.stylistPrimary} />
            </Pressable>
          ),
        }}
      />

      <View style={[styles.searchWrap, { paddingHorizontal: contentPadding }]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={shopColors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search your closet..."
            placeholderTextColor={shopColors.textTertiary}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={shopColors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>{items.length} items</Text>
        <Pressable
          style={styles.sortBtn}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.selectionAsync();
            setSortBy((sortBy + 1) % SORT_OPTIONS.length);
          }}
        >
          <Ionicons name="swap-vertical-outline" size={14} color={shopColors.stylistPrimary} />
          <Text style={styles.sortText}>{SORT_OPTIONS[sortBy]}</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.catScroll, { paddingHorizontal: contentPadding }]}
      >
        {categoryCounts.map(cat => (
          <Pressable
            key={cat.id}
            style={[styles.catPill, activeCategory === cat.id && styles.catPillActive]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              setActiveCategory(cat.id);
            }}
          >
            <Ionicons
              name={cat.icon}
              size={16}
              color={activeCategory === cat.id ? "#fff" : shopColors.textSecondary}
            />
            <Text style={[styles.catPillText, activeCategory === cat.id && styles.catPillTextActive]}>
              {cat.label}
            </Text>
            <View style={[styles.catBadge, activeCategory === cat.id && styles.catBadgeActive]}>
              <Text style={[styles.catBadgeText, activeCategory === cat.id && styles.catBadgeTextActive]}>
                {cat.count}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {sorted.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Ionicons name="shirt-outline" size={48} color={shopColors.textTertiary} />
          <Text style={styles.emptyTitle}>
            {searchQuery ? "No items found" : "Your wardrobe is empty"}
          </Text>
          <Text style={styles.emptyDesc}>
            {searchQuery ? "Try a different search term" : "Add items to start building your digital closet"}
          </Text>
          {!searchQuery && (
            <Pressable
              style={styles.emptyAddBtn}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.emptyAddText}>Add First Item</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={sorted}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          numColumns={numColumns}
          key={numColumns}
          contentContainerStyle={[styles.grid, { paddingHorizontal: contentPadding }]}
          columnWrapperStyle={{ gap }}
          ItemSeparatorComponent={() => <View style={{ height: gap }} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!sorted.length}
        />
      )}

      {showAddModal && (
        <AddItemModal
          onAdd={(item) => addMutation.mutate(item)}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </View>
  );
}

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    black: "#1a1a1a", white: "#f5f5f5", red: "#ef4444", blue: "#3b82f6",
    navy: "#1e3a5f", green: "#22c55e", yellow: "#eab308", pink: "#ec4899",
    purple: "#a855f7", orange: "#f97316", grey: "#9ca3af", gray: "#9ca3af",
    brown: "#92400e", beige: "#d2b48c", cream: "#fffdd0", tan: "#d2b48c",
  };
  const lower = color.toLowerCase();
  for (const [key, hex] of Object.entries(map)) {
    if (lower.includes(key)) return hex;
  }
  return shopColors.stylistPrimary;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: shopColors.background },
  searchWrap: { paddingTop: 8, paddingBottom: 8, backgroundColor: shopColors.surface },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: shopColors.background, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: shopColors.text,
    fontFamily: "Inter_400Regular", padding: 0,
  },
  statsBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10,
  },
  statsText: { fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_500Medium" },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortText: { fontSize: 13, color: shopColors.stylistPrimary, fontFamily: "Inter_600SemiBold" },
  catScroll: { gap: 8, paddingBottom: 12 },
  catPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: shopColors.surface, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: shopColors.border,
  },
  catPillActive: {
    backgroundColor: shopColors.stylistPrimary, borderColor: shopColors.stylistPrimary,
  },
  catPillText: { fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_500Medium" },
  catPillTextActive: { color: "#fff" },
  catBadge: {
    backgroundColor: shopColors.background, borderRadius: 10,
    minWidth: 20, height: 20, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 4,
  },
  catBadgeActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  catBadgeText: { fontSize: 11, color: shopColors.textSecondary, fontFamily: "Inter_600SemiBold" },
  catBadgeTextActive: { color: "#fff" },
  grid: { paddingTop: 4, paddingBottom: 120 },
  itemCard: {
    backgroundColor: shopColors.surface,
    borderRadius: 14, overflow: "hidden",
  },
  itemImageWrap: {
    width: "100%", aspectRatio: 1,
    backgroundColor: shopColors.background,
  },
  itemImage: { width: "100%", height: "100%" },
  itemPlaceholder: {
    alignItems: "center", justifyContent: "center",
    backgroundColor: `${shopColors.stylistPrimary}08`,
  },
  colorDot: {
    position: "absolute", bottom: 8, left: 8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 3, elevation: 3,
  },
  colorInner: { width: 16, height: 16, borderRadius: 8 },
  removeBtn: { position: "absolute", top: 6, right: 6 },
  itemInfo: { padding: 10 },
  itemName: { fontSize: 13, color: shopColors.text, fontFamily: "Inter_600SemiBold" },
  itemMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  itemMetaText: { fontSize: 11, color: shopColors.textTertiary, fontFamily: "Inter_400Regular" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, color: shopColors.text, fontFamily: "Inter_600SemiBold", marginTop: 16 },
  emptyDesc: {
    fontSize: 14, color: shopColors.textSecondary, fontFamily: "Inter_400Regular",
    textAlign: "center", marginTop: 8, lineHeight: 20,
  },
  emptyAddBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: shopColors.stylistPrimary,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 20,
  },
  emptyAddText: { fontSize: 14, color: "#fff", fontFamily: "Inter_600SemiBold" },
});

const addStyles = StyleSheet.create({
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: shopColors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: shopColors.border, alignSelf: "center", marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, color: shopColors.text, fontFamily: "Inter_700Bold", marginBottom: 20 },
  label: {
    fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_600SemiBold",
    marginBottom: 8, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5,
  },
  input: {
    backgroundColor: shopColors.background, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: shopColors.text, fontFamily: "Inter_400Regular",
    borderWidth: 1, borderColor: shopColors.border,
  },
  catScroll: { marginBottom: 4 },
  catPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: shopColors.background, marginRight: 8,
    borderWidth: 1, borderColor: shopColors.border,
  },
  catPillActive: { backgroundColor: shopColors.stylistPrimary, borderColor: shopColors.stylistPrimary },
  catPillText: { fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_500Medium" },
  catPillTextActive: { color: "#fff" },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: shopColors.stylistPrimary,
    paddingVertical: 14, borderRadius: 14, marginTop: 24,
  },
  addBtnText: { fontSize: 15, color: "#fff", fontFamily: "Inter_600SemiBold" },
});
