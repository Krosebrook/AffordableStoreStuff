import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { shopColors } from "@/constants/colors";
import { useResponsive } from "@/lib/useResponsive";

const MENU_SECTIONS = [
  {
    title: "Shopping",
    items: [
      { icon: "receipt-outline" as const, label: "Order History" },
      { icon: "heart-outline" as const, label: "Wishlist" },
      { icon: "location-outline" as const, label: "Saved Addresses" },
      { icon: "card-outline" as const, label: "Payment Methods" },
    ],
  },
  {
    title: "Style",
    items: [
      { icon: "color-palette-outline" as const, label: "Style Profile", route: "/shop/style-quiz" },
      { icon: "shirt-outline" as const, label: "Digital Wardrobe" },
      { icon: "sparkles-outline" as const, label: "AI Recommendations" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "notifications-outline" as const, label: "Notifications" },
      { icon: "help-circle-outline" as const, label: "Help & Support" },
      { icon: "shield-checkmark-outline" as const, label: "Privacy" },
    ],
  },
];

export default function AccountScreen() {
  const router = useRouter();
  const { contentPadding, insets } = useResponsive();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={shopColors.primary} />
          </View>
          <Text style={styles.name}>Guest User</Text>
          <Text style={styles.email}>Sign in for full experience</Text>
          <Pressable style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.7 : 1 }]}>
            <Text style={styles.editBtnText}>Sign In</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          {[
            { value: "0", label: "Orders" },
            { value: "0", label: "Wishlist" },
            { value: "0", label: "Reviews" },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={{ paddingHorizontal: contentPadding }}>
          <Pressable
            style={({ pressed }) => [styles.switchModeCard, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.replace("/(tabs)");
            }}
          >
            <View style={styles.switchIconWrap}>
              <Ionicons name="storefront-outline" size={20} color={shopColors.primary} />
            </View>
            <View style={styles.switchModeText}>
              <Text style={styles.switchModeTitle}>Store Management</Text>
              <Text style={styles.switchModeDesc}>Switch to seller dashboard</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={shopColors.primary} />
          </Pressable>
        </View>

        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={[styles.menuSection, { paddingHorizontal: contentPadding }]}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [
                    styles.menuItem,
                    i < section.items.length - 1 && styles.menuItemBorder,
                    { backgroundColor: pressed ? `${shopColors.primary}05` : "transparent" },
                  ]}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                    if ((item as any).route) router.push((item as any).route);
                  }}
                >
                  <View style={styles.menuIconWrap}>
                    <Ionicons name={item.icon} size={19} color={shopColors.textSecondary} />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={shopColors.textTertiary} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: shopColors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  profileHeader: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: shopColors.surface,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: `${shopColors.primary}10`,
    alignItems: "center", justifyContent: "center",
  },
  name: { fontSize: 20, color: shopColors.text, fontFamily: "Inter_700Bold", marginTop: 12 },
  email: { fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 4 },
  editBtn: {
    marginTop: 14, borderWidth: 1.5, borderColor: shopColors.primary,
    paddingHorizontal: 28, paddingVertical: 9, borderRadius: 22,
  },
  editBtnText: { fontSize: 14, color: shopColors.primary, fontFamily: "Inter_600SemiBold" },
  statsRow: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    backgroundColor: shopColors.surface, paddingBottom: 18,
    marginBottom: 8,
  },
  statItem: { alignItems: "center", paddingHorizontal: 28 },
  statValue: { fontSize: 20, color: shopColors.text, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: shopColors.border },
  switchModeCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginTop: 12,
    backgroundColor: `${shopColors.primary}06`, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: `${shopColors.primary}12`,
  },
  switchIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: `${shopColors.primary}10`,
    alignItems: "center", justifyContent: "center",
  },
  switchModeText: { flex: 1 },
  switchModeTitle: { fontSize: 15, color: shopColors.text, fontFamily: "Inter_600SemiBold" },
  switchModeDesc: { fontSize: 12, color: shopColors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 2 },
  menuSection: { marginTop: 24 },
  menuSectionTitle: { fontSize: 13, color: shopColors.textSecondary, fontFamily: "Inter_600SemiBold", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 },
  menuCard: { backgroundColor: shopColors.surface, borderRadius: 14, overflow: "hidden" },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 15,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: shopColors.border },
  menuIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: shopColors.background,
    alignItems: "center", justifyContent: "center",
  },
  menuItemLabel: { flex: 1, fontSize: 15, color: shopColors.text, fontFamily: "Inter_500Medium" },
});
