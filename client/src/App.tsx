import { Switch, Route, useLocation, Redirect } from "wouter";
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
import { Bell, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, Suspense, lazy, useEffect } from "react";
import type { CartItemWithProduct } from "@shared/schema";
import { OfflineIndicator, UpdatePrompt, ConnectionStatus } from "@/components/offline-indicator";
import { initPWA } from "@/lib/pwa-utils";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ErrorBoundary } from "@/components/error-boundary";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Landing = lazy(() => import("@/pages/landing"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Products = lazy(() => import("@/pages/products"));
const Orders = lazy(() => import("@/pages/orders"));
const Checkout = lazy(() => import("@/pages/checkout"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Generator = lazy(() => import("@/pages/generator"));
const IntegrationHub = lazy(() => import("@/pages/integration-hub"));
const StorePulse = lazy(() => import("@/pages/store-pulse"));
const AIInfluencerStudio = lazy(() => import("@/pages/ai-influencer-studio"));
const AIProductCreator = lazy(() => import("@/pages/ai-product-creator"));
const AIMarketingEngine = lazy(() => import("@/pages/ai-marketing-engine"));
const AIBrandVoice = lazy(() => import("@/pages/ai-brand-voice"));
const ProductPulseHeatmap = lazy(() => import("@/pages/product-pulse-heatmap"));
const FusionCore = lazy(() => import("@/pages/fusion-core"));
const BrandCalibration = lazy(() => import("@/pages/brand-calibration"));
const AIInsights = lazy(() => import("@/pages/ai-insights"));
const TaxCompliance = lazy(() => import("@/pages/tax-compliance"));
const MerchStudio = lazy(() => import("@/pages/merch-studio"));
const SocialMedia = lazy(() => import("@/pages/social-media"));
const TeamPage = lazy(() => import("@/pages/team"));
const Auth = lazy(() => import("@/pages/auth"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const Billing = lazy(() => import("@/pages/billing"));
const EcomTemplates = lazy(() => import("@/pages/ecom-templates"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0d0b14] z-[9999]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#4725f4]" />
        <span className="text-sm font-medium text-white/70">Initializing FlashFusion...</span>
      </div>
    </div>
  );
}

function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };
  
  const getInitials = () => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };
  
  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" onClick={() => setLocation("/auth")} data-testid="button-login">
        Log in
      </Button>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-user-menu">
          <Avatar className="h-8 w-8">
            {user?.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.firstName || user?.username}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }
  
  return <>{children}</>;
}

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
    <ProtectedRoute>
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col flex-1">
            <header className="flex h-14 items-center justify-between gap-4 border-b border-white/10 px-4 glass sticky top-0 z-40">
              <div className="flex items-center gap-2">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </div>
              <div className="flex items-center gap-2">
                <ConnectionStatus />
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
                <UserMenu />
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  {children}
                </Suspense>
              </ErrorBoundary>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
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
    "/store-pulse",
    "/ai-influencer-studio",
    "/product-pulse-heatmap",
    "/fusion-core",
    "/brand-calibration",
    "/ai-insights",
    "/tax-compliance",
    "/merch-studio",
    "/social-media",
    "/team",
    "/billing",
    "/ecom-templates",
  ];

  const isDashboardRoute = dashboardRoutes.some((route) =>
    location === route || location.startsWith(route + "/")
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
          <Route path="/store-pulse" component={StorePulse} />
          <Route path="/ai-influencer-studio" component={AIInfluencerStudio} />
          <Route path="/product-pulse-heatmap" component={ProductPulseHeatmap} />
          <Route path="/fusion-core" component={FusionCore} />
          <Route path="/brand-calibration" component={BrandCalibration} />
          <Route path="/ai-insights" component={AIInsights} />
          <Route path="/tax-compliance" component={TaxCompliance} />
          <Route path="/merch-studio" component={MerchStudio} />
          <Route path="/social-media" component={SocialMedia} />
          <Route path="/team" component={TeamPage} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/billing" component={Billing} />
          <Route path="/ecom-templates" component={EcomTemplates} />
          <Route path="/automation" component={Dashboard} />
          <Route path="/customers" component={Dashboard} />
          <Route path="/settings" component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/auth" component={Auth} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  useEffect(() => {
    initPWA();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <AuthProvider>
            <OfflineIndicator />
            <UpdatePrompt />
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
