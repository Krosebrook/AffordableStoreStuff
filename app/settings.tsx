import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const SUBSCRIPTION_TIERS = {
  free: { name: "Free", price: "$0/mo", products: 10, aiCredits: 100, color: Colors.light.textSecondary },
  pro: { name: "Pro", price: "$29/mo", products: 500, aiCredits: 5000, color: Colors.light.primary },
  enterprise: { name: "Enterprise", price: "$99/mo", products: "Unlimited", aiCredits: "Unlimited", color: Colors.light.accent },
};

function SettingsItem({ icon, label, value, onPress }: { icon: string; label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.settingsItem} onPress={onPress} disabled={!onPress}>
      <Ionicons name={icon as any} size={20} color={Colors.light.text} />
      <Text style={styles.settingsLabel}>{label}</Text>
      <View style={styles.settingsRight}>
        {value ? <Text style={styles.settingsValue}>{value}</Text> : null}
        {onPress ? <Ionicons name="chevron-forward" size={16} color={Colors.light.textTertiary} /> : null}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  const { data: aiUsage } = useQuery<{ totalGenerations: number; totalTokens: number }>({ queryKey: ["/api/ai/usage"] });

  const currentTier = "free";
  const tierInfo = SUBSCRIPTION_TIERS[currentTier];
  const aiUsed = aiUsage?.totalGenerations || 0;
  const aiLimit = SUBSCRIPTION_TIERS[currentTier].aiCredits as number;
  const usagePercent = Math.min((aiUsed / aiLimit) * 100, 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.tierCard}>
        <View style={styles.tierHeader}>
          <View>
            <Text style={styles.tierName}>{tierInfo.name} Plan</Text>
            <Text style={styles.tierPrice}>{tierInfo.price}</Text>
          </View>
          <View style={[styles.tierBadge, { backgroundColor: tierInfo.color + "20" }]}>
            <Text style={[styles.tierBadgeText, { color: tierInfo.color }]}>{currentTier.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.tierLimits}>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Products</Text>
            <Text style={styles.limitValue}>0 / {tierInfo.products}</Text>
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>AI Credits</Text>
            <Text style={styles.limitValue}>{aiUsed} / {tierInfo.aiCredits}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${usagePercent}%`, backgroundColor: usagePercent > 80 ? Colors.light.danger : Colors.light.primary }]} />
          </View>
        </View>
      </View>

      <View style={styles.upgradeCards}>
        {(["pro", "enterprise"] as const).map((tier) => {
          const info = SUBSCRIPTION_TIERS[tier];
          return (
            <Pressable key={tier} style={styles.upgradeCard}>
              <View style={[styles.upgradeDot, { backgroundColor: info.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.upgradeName}>{info.name}</Text>
                <Text style={styles.upgradePrice}>{info.price}</Text>
              </View>
              <Text style={styles.upgradeProducts}>{info.products} products</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.shopSwitchCard} onPress={() => router.replace("/(shop)")}>
        <Ionicons name="storefront" size={24} color="#2563EB" />
        <View style={{ flex: 1 }}>
          <Text style={styles.shopSwitchTitle}>Customer Shop View</Text>
          <Text style={styles.shopSwitchDesc}>Browse products, AI stylist, cart</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#2563EB" />
      </Pressable>

      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsGroup}>
        <SettingsItem icon="person-outline" label="Brand Profiles" onPress={() => router.push("/brand-profiles")} />
        <SettingsItem icon="library-outline" label="Content Library" onPress={() => router.push("/content-library")} />
      </View>

      <Text style={styles.sectionTitle}>Marketplace Connections</Text>
      <View style={styles.settingsGroup}>
        <SettingsItem icon="cart-outline" label="Amazon SP-API" value="Not connected" />
        <SettingsItem icon="heart-outline" label="Etsy API" value="Not connected" />
        <SettingsItem icon="videocam-outline" label="TikTok Shop" value="Not connected" />
        <SettingsItem icon="code-outline" label="WooCommerce" value="Not connected" />
        <SettingsItem icon="globe-outline" label="Website" value="affordablestorestuff.com" />
      </View>

      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.settingsGroup}>
        <SettingsItem icon="information-circle-outline" label="Version" value="1.0.0" />
        <SettingsItem icon="shield-checkmark-outline" label="Privacy Policy" />
        <SettingsItem icon="document-text-outline" label="Terms of Service" />
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16 },
  tierCard: { backgroundColor: Colors.light.surface, borderRadius: 14, padding: 16, marginBottom: 16 },
  tierHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  tierName: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.light.text },
  tierPrice: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 2 },
  tierBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tierBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  tierLimits: {},
  limitRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  limitLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  limitValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: Colors.light.surfaceSecondary, marginTop: 6 },
  progressFill: { height: 6, borderRadius: 3 },
  upgradeCards: { flexDirection: "row", gap: 10, marginBottom: 24 },
  upgradeCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  upgradeDot: { width: 8, height: 8, borderRadius: 4 },
  upgradeName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  upgradePrice: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  upgradeProducts: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.light.textTertiary },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginBottom: 8, marginTop: 8 },
  settingsGroup: { backgroundColor: Colors.light.surface, borderRadius: 12, marginBottom: 16, overflow: "hidden" },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surfaceSecondary,
  },
  settingsLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.text },
  settingsRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  settingsValue: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textTertiary },
  shopSwitchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#2563EB10",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2563EB20",
  },
  shopSwitchTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  shopSwitchDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 2 },
});
