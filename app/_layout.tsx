import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { shopColors } from "@/constants/colors";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const STORE_HEADER = { backgroundColor: Colors.light.background };
const SHOP_HEADER = { backgroundColor: shopColors.background };

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
        headerShadowVisible: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: shopColors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="(shop)" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="product/[id]" options={{ title: "Product Details", headerStyle: STORE_HEADER }} />
      <Stack.Screen name="product/create" options={{ title: "Create Product", presentation: "modal", headerStyle: STORE_HEADER }} />
      <Stack.Screen name="product/publish" options={{ title: "Publish to Marketplace", headerStyle: STORE_HEADER }} />
      <Stack.Screen name="brand-profiles" options={{ title: "Brand Profiles", headerStyle: STORE_HEADER }} />
      <Stack.Screen name="content-library" options={{ title: "Content Library", headerStyle: STORE_HEADER }} />
      <Stack.Screen name="settings" options={{ title: "Settings", headerStyle: STORE_HEADER }} />
      <Stack.Screen
        name="shop/product/[id]"
        options={{
          title: "",
          headerStyle: SHOP_HEADER,
          headerTintColor: shopColors.text,
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="shop/style-quiz"
        options={{
          title: "Style Quiz",
          headerStyle: SHOP_HEADER,
          headerTintColor: shopColors.text,
        }}
      />
      <Stack.Screen
        name="shop/stylist-chat"
        options={{
          title: "AI Stylist",
          headerStyle: SHOP_HEADER,
          headerTintColor: shopColors.text,
        }}
      />
      <Stack.Screen name="billing" options={{ title: "Billing", headerStyle: STORE_HEADER }} />
      <Stack.Screen name="analytics" options={{ title: "Analytics", headerStyle: STORE_HEADER }} />
      <Stack.Screen name="social-media" options={{ title: "Social Media", headerStyle: STORE_HEADER }} />
      <Stack.Screen name="teams" options={{ title: "Teams", headerStyle: STORE_HEADER }} />
      <Stack.Screen name="publishing-queue" options={{ title: "Publishing Queue", headerStyle: STORE_HEADER }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            {Platform.OS !== "web" && <StatusBar barStyle="dark-content" />}
            <RootLayoutNav />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
