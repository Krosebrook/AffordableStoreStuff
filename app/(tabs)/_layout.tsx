import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import Colors from "@/constants/colors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="products">
        <Icon sf={{ default: "bag", selected: "bag.fill" }} />
        <Label>Products</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ai-studio">
        <Icon sf={{ default: "sparkles", selected: "sparkles" }} />
        <Label>AI Studio</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="marketplace">
        <Icon sf={{ default: "globe", selected: "globe" }} />
        <Label>Marketplace</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="orders">
        <Icon sf={{ default: "list.clipboard", selected: "list.clipboard.fill" }} />
        <Label>Orders</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Colors.light.background },
        headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: -2 },
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : isDark ? "#000" : "#fff",
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: isDark ? "#333" : Colors.light.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "#000" : "#fff" }]} />
          ) : null,
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
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />,
          headerRight: () => (
            <Pressable onPress={() => router.push("/settings")} style={{ marginRight: 16, padding: 4 }} hitSlop={10}>
              <Ionicons name="settings-outline" size={22} color={Colors.light.text} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "bag" : "bag-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-studio"
        options={{
          title: "AI Studio",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "sparkles" : "sparkles-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Marketplace",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "globe" : "globe-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "receipt" : "receipt-outline"} size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
