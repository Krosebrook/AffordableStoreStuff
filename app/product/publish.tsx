import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Colors, { marketplace as marketplaceConfig, statusColors } from "@/constants/colors";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import type { Product, MarketplaceListing, BrandProfile } from "@shared/schema";

type PipelineStep = "idle" | "generating" | "preview" | "publishing" | "done";

export default function PublishScreen() {
  const { productId, marketplace, listingId } = useLocalSearchParams<{
    productId: string;
    marketplace: string;
    listingId: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<PipelineStep>("idle");
  const [generateImages, setGenerateImages] = useState(true);

  const { data: product } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
  });

  const { data: listing, refetch: refetchListing } = useQuery<MarketplaceListing>({
    queryKey: [`/api/listings/${listingId}`],
    enabled: !!listingId,
    refetchInterval: step === "generating" ? 3000 : false,
  });

  const { data: brandProfiles = [] } = useQuery<BrandProfile[]>({
    queryKey: ["/api/brand-profiles"],
  });

  const [selectedBrandProfile, setSelectedBrandProfile] = useState<number | undefined>();

  const mp = marketplaceConfig[marketplace as keyof typeof marketplaceConfig];
  const mpLabel = mp?.label || marketplace;
  const mpColor = mp?.color || "#9CA3AF";

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/listings/${listingId}/publish`, {
        generateImages,
        imageCount: 2,
        brandProfileId: selectedBrandProfile,
      });
      return res.json();
    },
    onMutate: () => setStep("generating"),
    onSuccess: (data) => {
      setStep("preview");
      refetchListing();
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/listings`] });
    },
    onError: (error) => {
      setStep("idle");
      Alert.alert("Error", "Failed to generate listing content. Please try again.");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/listings/${listingId}/confirm-publish`);
      return res.json();
    },
    onMutate: () => setStep("publishing"),
    onSuccess: () => {
      setStep("done");
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/listings`] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
    },
    onError: () => {
      setStep("preview");
      Alert.alert("Error", "Failed to confirm publish.");
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/listings/${listingId}/regenerate-content`, {
        brandProfileId: selectedBrandProfile,
      });
      return res.json();
    },
    onMutate: () => setStep("generating"),
    onSuccess: () => {
      setStep("preview");
      refetchListing();
    },
    onError: () => {
      setStep("preview");
      Alert.alert("Error", "Failed to regenerate content.");
    },
  });

  const listingData = listing?.listingData as any;
  const generatedImages = (listing?.generatedImages as string[]) || [];

  const hasPreviewData = listingData && step !== "idle" && step !== "generating";

  if (step === "idle" && listing?.status === "ready" && listingData) {
    setStep("preview");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.mpBadge, { backgroundColor: mpColor + "20" }]}>
          <View style={[styles.mpDot, { backgroundColor: mpColor }]} />
          <Text style={[styles.mpLabel, { color: mpColor }]}>{mpLabel}</Text>
        </View>
        <Text style={styles.productName}>{product?.title || "Loading..."}</Text>
      </View>

      {step === "idle" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publish Settings</Text>
          <Text style={styles.desc}>
            The AI will automatically generate all the content needed for your {mpLabel} listing — optimized title, description, bullet points, tags, SEO data, and product images.
          </Text>

          <Pressable
            style={styles.toggleRow}
            onPress={() => setGenerateImages(!generateImages)}
          >
            <Ionicons
              name={generateImages ? "checkbox" : "square-outline"}
              size={22}
              color={generateImages ? Colors.light.primary : Colors.light.textTertiary}
            />
            <Text style={styles.toggleLabel}>Generate AI product images</Text>
          </Pressable>

          {brandProfiles.length > 0 && (
            <>
              <Text style={styles.subLabel}>Brand Voice</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandScroll}>
                <Pressable
                  style={[styles.brandChip, !selectedBrandProfile && styles.brandChipActive]}
                  onPress={() => setSelectedBrandProfile(undefined)}
                >
                  <Text style={[styles.brandChipText, !selectedBrandProfile && styles.brandChipTextActive]}>Auto</Text>
                </Pressable>
                {brandProfiles.map((bp) => (
                  <Pressable
                    key={bp.id}
                    style={[styles.brandChip, selectedBrandProfile === bp.id && styles.brandChipActive]}
                    onPress={() => setSelectedBrandProfile(bp.id)}
                  >
                    <Text style={[styles.brandChipText, selectedBrandProfile === bp.id && styles.brandChipTextActive]}>
                      {bp.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={styles.subLabel}>What will be generated</Text>
          <View style={styles.checklist}>
            {getMarketplaceChecklist(marketplace as string).map((item, i) => (
              <View key={i} style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.light.primary} />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={[styles.publishButton, { backgroundColor: mpColor }]}
            onPress={() => publishMutation.mutate()}
          >
            <Ionicons name="sparkles" size={18} color="#fff" />
            <Text style={styles.publishButtonText}>Generate & Prepare Listing</Text>
          </Pressable>
        </View>
      )}

      {step === "generating" && (
        <View style={styles.generatingSection}>
          <ActivityIndicator size="large" color={Colors.light.accent} />
          <Text style={styles.generatingTitle}>Creating your listing...</Text>
          <Text style={styles.generatingDesc}>
            AI is generating optimized content and images for {mpLabel}. This may take a minute.
          </Text>
          <View style={styles.progressSteps}>
            <ProgressStep label="Analyzing product" done />
            <ProgressStep label="Generating platform content" active />
            <ProgressStep label={generateImages ? "Creating product images" : "Skipping images"} />
            <ProgressStep label="Preparing listing preview" />
          </View>
        </View>
      )}

      {hasPreviewData && (
        <View style={styles.section}>
          <View style={styles.previewHeader}>
            <Text style={styles.sectionTitle}>Listing Preview</Text>
            <View style={[styles.readyBadge, { backgroundColor: statusColors.ready + "20" }]}>
              <Text style={[styles.readyText, { color: statusColors.ready }]}>Ready</Text>
            </View>
          </View>

          <Text style={styles.previewLabel}>Title</Text>
          <Text style={styles.previewValue}>{listingData.title}</Text>

          <Text style={styles.previewLabel}>Description</Text>
          <Text style={styles.previewDesc}>{listingData.description}</Text>

          {listingData.bulletPoints?.length > 0 && (
            <>
              <Text style={styles.previewLabel}>Bullet Points</Text>
              {listingData.bulletPoints.map((bp: string, i: number) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{bp}</Text>
                </View>
              ))}
            </>
          )}

          {listingData.tags?.length > 0 && (
            <>
              <Text style={styles.previewLabel}>Tags / Keywords</Text>
              <View style={styles.tagsRow}>
                {listingData.tags.map((tag: string, i: number) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={styles.previewLabel}>SEO</Text>
          <View style={styles.seoBox}>
            <Text style={styles.seoTitle}>{listingData.seoTitle}</Text>
            <Text style={styles.seoMeta}>{listingData.metaDescription}</Text>
          </View>

          {listingData.searchTerms?.length > 0 && (
            <>
              <Text style={styles.previewLabel}>Search Terms</Text>
              <Text style={styles.searchTerms}>{listingData.searchTerms.join(", ")}</Text>
            </>
          )}

          {listingData.platformSpecific && Object.keys(listingData.platformSpecific).length > 0 && (
            <>
              <Text style={styles.previewLabel}>{mpLabel}-Specific Data</Text>
              <View style={styles.platformBox}>
                {Object.entries(listingData.platformSpecific).map(([key, value]) => (
                  <View key={key} style={styles.platformRow}>
                    <Text style={styles.platformKey}>{formatKey(key)}</Text>
                    <Text style={styles.platformValue}>
                      {Array.isArray(value) ? (value as string[]).join(", ") : String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {generatedImages.length > 0 && (
            <>
              <Text style={styles.previewLabel}>Generated Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {generatedImages.map((img, i) => (
                  <Image
                    key={i}
                    source={{ uri: `${getApiUrl()}public-objects/${encodeURIComponent(img)}` }}
                    style={styles.previewImage}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.actionRow}>
            <Pressable
              style={styles.regenerateButton}
              onPress={() => regenerateMutation.mutate()}
              disabled={regenerateMutation.isPending}
            >
              <Ionicons name="refresh" size={16} color={Colors.light.primary} />
              <Text style={styles.regenerateText}>Regenerate</Text>
            </Pressable>

            <Pressable
              style={[styles.confirmButton, { backgroundColor: mpColor }]}
              onPress={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.confirmText}>Publish to {mpLabel}</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {step === "done" && (
        <View style={styles.doneSection}>
          <Ionicons name="checkmark-circle" size={56} color={Colors.light.success} />
          <Text style={styles.doneTitle}>Published!</Text>
          <Text style={styles.doneDesc}>
            Your product has been published to {mpLabel} with all generated content, images, and optimized metadata.
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Product</Text>
          </Pressable>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function ProgressStep({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <View style={pStyles.step}>
      {done ? (
        <Ionicons name="checkmark-circle" size={20} color={Colors.light.success} />
      ) : active ? (
        <ActivityIndicator size="small" color={Colors.light.accent} />
      ) : (
        <View style={pStyles.circle} />
      )}
      <Text style={[pStyles.label, done && pStyles.done, active && pStyles.active]}>{label}</Text>
    </View>
  );
}

const pStyles = StyleSheet.create({
  step: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.light.border },
  label: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textTertiary },
  done: { color: Colors.light.success, textDecorationLine: "line-through" },
  active: { color: Colors.light.accent, fontFamily: "Inter_600SemiBold" },
});

function formatKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function getMarketplaceChecklist(marketplace: string): string[] {
  const base = [
    "Optimized product title",
    "Platform-specific description",
    "SEO title & meta description",
    "Search terms & keywords",
  ];
  const extras: Record<string, string[]> = {
    amazon: ["5 feature bullet points (A9 optimized)", "Backend search terms (250 bytes)", "Browse node & product type", "AI product images (white background)"],
    etsy: ["13 Etsy-optimized tags", "Materials & occasion data", "Story-driven listing copy", "AI lifestyle product images"],
    tiktok: ["Viral TikTok video script", "Trending hashtags", "Hook line for short-form", "AI trend-style product images"],
    shopify: ["Shopify collections & product type", "Variant options (size, color)", "Metafields for custom data", "AI product images"],
    printify: ["Print area specifications", "Material & size guide", "Design description & care instructions", "AI mockup product images"],
    wix: ["Wix collections & custom fields", "Info sections for product page", "Ribbon text & branding", "AI elegant product images"],
    instagram: ["Instagram caption template", "Story & Reel hook scripts", "15 discovery hashtags", "AI Instagram-aesthetic images"],
    gumroad: ["Pricing model (one-time/subscription)", "Deliverables list", "Creator-style product copy", "AI product cover images"],
    woocommerce: ["WooCommerce categories & attributes", "Yoast SEO optimization", "Cross-sell & upsell keywords", "AI product images"],
    website: ["Feature highlights & specs", "FAQ items for product page", "Internal search terms", "AI hero product images"],
  };
  return [...base, ...(extras[marketplace] || extras.website)];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16, paddingTop: Platform.OS === "web" ? 83 : 16 },
  header: { marginBottom: 20 },
  mpBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8 },
  mpDot: { width: 8, height: 8, borderRadius: 4 },
  mpLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  productName: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.light.text },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.light.text, marginBottom: 8 },
  desc: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 20, marginBottom: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.light.text },
  subLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text, marginTop: 16, marginBottom: 8 },
  brandScroll: { marginBottom: 8 },
  brandChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, marginRight: 8 },
  brandChipActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  brandChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.light.text },
  brandChipTextActive: { color: "#fff" },
  checklist: { gap: 6, marginBottom: 20 },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  publishButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14 },
  publishButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  generatingSection: { alignItems: "center", paddingVertical: 40 },
  generatingTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.light.text, marginTop: 16 },
  generatingDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center", marginTop: 6, marginBottom: 24, paddingHorizontal: 20 },
  progressSteps: { width: "100%", paddingHorizontal: 20 },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  readyBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  readyText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  previewLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.primary, marginTop: 16, marginBottom: 6 },
  previewValue: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.text, lineHeight: 22 },
  previewDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 20 },
  bulletRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  bulletDot: { fontSize: 16, color: Colors.light.text, lineHeight: 20 },
  bulletText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 20 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { backgroundColor: Colors.light.surfaceSecondary, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  seoBox: { backgroundColor: Colors.light.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.light.border },
  seoTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1a0dab", marginBottom: 4 },
  seoMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 18 },
  searchTerms: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, lineHeight: 18 },
  platformBox: { backgroundColor: Colors.light.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.light.border },
  platformRow: { marginBottom: 8 },
  platformKey: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.light.textTertiary, textTransform: "uppercase", marginBottom: 2 },
  platformValue: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.text, lineHeight: 18 },
  imageScroll: { marginTop: 4 },
  previewImage: { width: 160, height: 160, borderRadius: 10, marginRight: 10, backgroundColor: Colors.light.surfaceSecondary },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 24 },
  regenerateButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: Colors.light.primary },
  regenerateText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.primary },
  confirmButton: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 14 },
  confirmText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  doneSection: { alignItems: "center", paddingVertical: 40 },
  doneTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.light.text, marginTop: 12 },
  doneDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, textAlign: "center", marginTop: 8, paddingHorizontal: 20, lineHeight: 20 },
  backButton: { marginTop: 24, backgroundColor: Colors.light.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  backButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
