import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import { CartDrawer } from "@/components/cart-drawer";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import type { CartItemWithProduct } from "@shared/schema";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Orders from "@/pages/orders";
import Checkout from "@/pages/checkout";
import Analytics from "@/pages/analytics";
import Generator from "@/pages/generator";
import IntegrationHub from "@/pages/integration-hub";
import AIProductCreator from "@/pages/ai-product-creator";
import AIMarketingEngine from "@/pages/ai-marketing-engine";
import AIBrandVoice from "@/pages/ai-brand-voice";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex h-14 items-center justify-between gap-4 border-b border-white/10 px-4 glass sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </div>
            <div className="flex items-center gap-2">
              <CartDrawer
                items={cartItems}
                onUpdateQuantity={(itemId, quantity) =>
                  updateCartMutation.mutate({ itemId, quantity })
                }
                onRemoveItem={(itemId) => removeCartMutation.mutate(itemId)}
                isOpen={cartOpen}
                onOpenChange={setCartOpen}
              />
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const [location] = useLocation();

  const dashboardRoutes = [
    "/dashboard",
    "/products",
    "/orders",
    "/analytics",
    "/generator",
    "/integrations",
    "/automation",
    "/customers",
    "/settings",
    "/checkout",
    "/ai-product-creator",
    "/ai-marketing",
    "/ai-brand-voice",
  ];

  const isDashboardRoute = dashboardRoutes.some((route) =>
    location.startsWith(route)
  );

  if (isDashboardRoute) {
    return (
      <DashboardLayout>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/products" component={Products} />
          <Route path="/orders" component={Orders} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/generator" component={Generator} />
          <Route path="/integrations" component={IntegrationHub} />
          <Route path="/ai-product-creator" component={AIProductCreator} />
          <Route path="/ai-marketing" component={AIMarketingEngine} />
          <Route path="/ai-brand-voice" component={AIBrandVoice} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/automation" component={Dashboard} />
          <Route path="/customers" component={Dashboard} />
          <Route path="/settings" component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
