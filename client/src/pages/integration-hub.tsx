import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plug, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Search,
  Zap,
  ShoppingCart,
  Bot,
  Server,
  Building2,
  FileText,
  ExternalLink,
  Settings,
  Play,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Connector {
  id: string;
  platform: string;
  displayName: string;
  description: string;
  category: string;
  connectorType: string;
  baseUrl: string;
  docsUrl: string;
  requiredCredentials: string[];
  optionalCredentials?: string[];
  rateLimitPerMinute: number;
  features: string[];
  isBuiltIn: boolean;
}

interface Connection {
  id: string;
  platform: string;
  status: string;
  lastSyncAt?: string;
  errorMessage?: string;
  connector?: Connector;
}

interface Stats {
  connectedPlatforms: number;
  totalPlatforms: number;
  totalGenerations: number;
  completedWorkflows: number;
  pendingPublishes: number;
  categories: { name: string; total: number; connected: number }[];
}

const categoryIcons: Record<string, any> = {
  ai: Bot,
  ecommerce: ShoppingCart,
  automation: Zap,
  infrastructure: Server,
  business: Building2,
  productivity: FileText,
};

const categoryColors: Record<string, string> = {
  ai: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  ecommerce: "bg-green-500/10 text-green-400 border-green-500/20",
  automation: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  infrastructure: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  business: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  productivity: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export default function IntegrationHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: connectorsData, isLoading: loadingConnectors } = useQuery<{ connectors: Connector[]; categories: any[] }>({
    queryKey: ["/api/integrations/connectors"],
  });

  const { data: connections = [], isLoading: loadingConnections } = useQuery<Connection[]>({
    queryKey: ["/api/integrations/connections"],
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/integrations/stats"],
  });

  const connectMutation = useMutation({
    mutationFn: async (platform: string) => {
      return apiRequest("/api/integrations/connections", {
        method: "POST",
        body: JSON.stringify({ platform, credentials: {}, settings: {} }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/stats"] });
      setConnectingPlatform(null);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (platform: string) => {
      return apiRequest(`/api/integrations/connections/${platform}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/stats"] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (platform: string) => {
      return apiRequest(`/api/integrations/connections/${platform}/test`, {
        method: "POST",
      });
    },
  });

  const connectors = connectorsData?.connectors || [];
  
  const filteredConnectors = connectors.filter(connector => {
    const matchesSearch = 
      connector.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connector.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || connector.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getConnectionStatus = (platform: string) => {
    return connections.find(c => c.platform === platform);
  };

  const isConnected = (platform: string) => {
    const conn = getConnectionStatus(platform);
    return conn?.status === "connected";
  };

  if (loadingConnectors) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Integration Hub
              </h1>
              <p className="text-muted-foreground mt-1">
                Connect 25+ platforms for AI generation, e-commerce, and automation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Plug className="h-4 w-4 mr-2" />
                {stats?.connectedPlatforms || 0} / {stats?.totalPlatforms || 0} Connected
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">
            {stats?.categories.map(cat => {
              const Icon = categoryIcons[cat.name] || Plug;
              return (
                <Card key={cat.name} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${categoryColors[cat.name]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground capitalize">{cat.name}</p>
                        <p className="text-xl font-semibold">{cat.connected}/{cat.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-integrations"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList>
                <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                <TabsTrigger value="ai" data-testid="tab-ai">AI</TabsTrigger>
                <TabsTrigger value="ecommerce" data-testid="tab-ecommerce">E-commerce</TabsTrigger>
                <TabsTrigger value="automation" data-testid="tab-automation">Automation</TabsTrigger>
                <TabsTrigger value="infrastructure" data-testid="tab-infrastructure">Infrastructure</TabsTrigger>
                <TabsTrigger value="business" data-testid="tab-business">Business</TabsTrigger>
                <TabsTrigger value="productivity" data-testid="tab-productivity">Productivity</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredConnectors.map(connector => {
            const connected = isConnected(connector.platform);
            const connection = getConnectionStatus(connector.platform);
            const Icon = categoryIcons[connector.category] || Plug;
            
            return (
              <Card 
                key={connector.id} 
                className={`hover-elevate transition-all ${connected ? 'ring-1 ring-green-500/30' : ''}`}
                data-testid={`card-connector-${connector.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${categoryColors[connector.category]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{connector.displayName}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1 capitalize">
                          {connector.category}
                        </Badge>
                      </div>
                    </div>
                    {connected ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm line-clamp-2">
                    {connector.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-1">
                    {connector.features.slice(0, 3).map(feature => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {connector.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{connector.features.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {connected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => testMutation.mutate(connector.platform)}
                          disabled={testMutation.isPending}
                          data-testid={`button-test-${connector.id}`}
                        >
                          {testMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => disconnectMutation.mutate(connector.platform)}
                          disabled={disconnectMutation.isPending}
                          data-testid={`button-disconnect-${connector.id}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="w-full"
                            data-testid={`button-connect-${connector.id}`}
                          >
                            <Plug className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Connect to {connector.displayName}</DialogTitle>
                            <DialogDescription>
                              Configure your {connector.displayName} integration
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Required Credentials:</p>
                              {connector.requiredCredentials.map(cred => (
                                <Input
                                  key={cred}
                                  placeholder={cred}
                                  type="password"
                                  data-testid={`input-${cred}`}
                                />
                              ))}
                            </div>
                            {connector.optionalCredentials && connector.optionalCredentials.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Optional:</p>
                                {connector.optionalCredentials.map(cred => (
                                  <Input
                                    key={cred}
                                    placeholder={cred}
                                    type="password"
                                  />
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ExternalLink className="h-4 w-4" />
                              <a 
                                href={connector.docsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                View API Documentation
                              </a>
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => connectMutation.mutate(connector.platform)}
                              disabled={connectMutation.isPending}
                              data-testid={`button-save-connection-${connector.id}`}
                            >
                              {connectMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                              )}
                              Save Connection
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={connector.docsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredConnectors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Plug className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No integrations found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
