import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { shopColors } from "@/constants/colors";
import * as Haptics from "expo-haptics";

function CartBadge() {
  const { data: cartItems = [] } = useQuery<any[]>({ queryKey: ["/api/shop/cart"] });
  const count = cartItems.length;
  if (count === 0) return null;
  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.badgeText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: "absolute", top: -4, right: -8,
    backgroundColor: shopColors.sale, minWidth: 18, height: 18,
    borderRadius: 9, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 4, borderWidth: 2, borderColor: "#fff",
  },
  badgeText: { fontSize: 10, color: "#fff", fontFamily: "Inter_700Bold" },
});

export default function ShopTabLayout() {
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: shopColors.primary,
        tabBarInactiveTintColor: shopColors.textTertiary,
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: shopColors.surface },
        headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: shopColors.text },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: -2 },
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "#fff",
          borderTopWidth: 0,
          elevation: 0,
          ...(isWeb ? { height: 84, borderTopWidth: 1, borderTopColor: shopColors.border } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: shopColors.border }]} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 8 }]} />
          ),
      }}
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stylist"
        options={{
          title: "AI Stylist",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "sparkles" : "sparkles-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name={focused ? "bag" : "bag-outline"} size={22} color={color} />
              <CartBadge />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
